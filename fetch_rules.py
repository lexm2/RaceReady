#!/usr/bin/env python3
"""
fetch_rules.py — Fetches the Racing Rules of Sailing from sailing.org
and generates structured markdown files in the rules/ directory.

Usage:
    python3 fetch_rules.py [--dry-run] [--output-dir ./rules]
    python3 fetch_rules.py --pdf /path/to/rrs.pdf          # use local PDF

Steps:
  1. Queries the sailing.org sotic API to discover the current RRS PDF URL.
  2. Downloads the PDF.
  3. Extracts text with pdftotext.
  4. Parses the text into sections (Introduction, Definitions, Basic Principles,
     Parts 1-7 with sub-sections, Race Signals, Appendices).
  5. Writes one markdown file per rule/section under output-dir.
"""

import argparse
import json
import os
import re
import subprocess
import sys
import tempfile
import urllib.request
from pathlib import Path


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def fetch_json(url: str) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 RaceReady/1.0"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read())


def download_file(url: str, dest: Path) -> None:
    print(f"  Downloading {url} → {dest.name}")
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 RaceReady/1.0"})
    with urllib.request.urlopen(req, timeout=60) as r, open(dest, "wb") as f:
        f.write(r.read())


def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "_", text)
    return text.strip("_")


# ---------------------------------------------------------------------------
# Step 1: Discover the current RRS PDF URL via the sotic API
# ---------------------------------------------------------------------------

SOTIC_PAGE_API = (
    "https://www.sailing.org/wp-json/sotic-wp-api/posts"
    "?fields=id,title,slug,content,acf"
    "&posts[post_type][0]=page"
    "&posts[name]=racingrules"
)

SOTIC_POSTS_API = (
    "https://www.sailing.org/wp-json/sotic-wp-api/posts"
    "?fields=id,title,slug,acf,link"
    "&posts[post_type][0]=document"
    "&posts[posts_per_page]=100"
)


def discover_rrs_pdf_url() -> str:
    """
    Queries the sotic API to find the latest full RRS PDF.
    Returns the direct URL to the PDF file.
    """
    print("Querying sailing.org API for current RRS document…")
    data = fetch_json(SOTIC_PAGE_API)
    pages = data.get("data", [])
    if not pages:
        raise RuntimeError("No page data returned from sotic API.")

    page = pages[0]
    doc_config = page.get("acf", {}).get("documents_config", {}).get("documents", [])

    # Find the category ID for the main RRS document group
    rrs_category = None
    for doc_set in doc_config:
        ds = doc_set.get("document_set", {})
        for group in ds.get("document_groups", []):
            docs = group.get("documents", {})
            set_title = docs.get("document_set_title", "")
            cats = docs.get("document_categories") or []
            if re.search(r"racing rules of sailing \d{4}", set_title, re.I) and cats:
                rrs_category = cats[0]
                break
        if rrs_category:
            break

    if not rrs_category:
        raise RuntimeError("Could not locate RRS document category in the API response.")

    # Fetch documents in that category
    posts_data = fetch_json(
        f"{SOTIC_POSTS_API}&posts[cat]={rrs_category}&posts[posts_per_page]=20"
    )
    posts = posts_data.get("data", [])

    # Prefer the combined "with Changes and Corrections" PDF, fall back to any PDF
    best_url = None
    fallback_url = None
    for post in posts:
        acf = post.get("acf", {})
        doc_file = acf.get("document_file") or {}
        if not isinstance(doc_file, dict):
            continue
        url = doc_file.get("url", "")
        mime = doc_file.get("mime_type", "")
        title = post.get("title", "")
        if mime != "application/pdf" or not url:
            continue
        tl = title.lower()
        # Best match: the combined full RRS + corrections document (contains "rrs" and "with")
        if "rrs" in tl and "with" in tl and "changes" in tl:
            best_url = url
        elif fallback_url is None:
            fallback_url = url

    pdf_url = best_url or fallback_url
    if not pdf_url:
        raise RuntimeError("Could not find a PDF URL in the RRS document posts.")

    print(f"Found RRS PDF: {pdf_url}")
    return pdf_url


# ---------------------------------------------------------------------------
# Step 2: Extract text from the PDF
# ---------------------------------------------------------------------------

def extract_pdf_text(pdf_path: Path) -> str:
    result = subprocess.run(
        ["pdftotext", "-layout", str(pdf_path), "-"],
        capture_output=True, text=True, check=True
    )
    return result.stdout


def detect_rrs_version(text: str) -> str:
    m = re.search(r"for\s+(\d{4}[–\-]\d{4})", text)
    if m:
        return m.group(1).replace("–", "-")
    return "2025-2028"


# ---------------------------------------------------------------------------
# Step 3: Parse the extracted text
# ---------------------------------------------------------------------------

PART_NAMES = {
    1: "part1_fundamental_rules",
    2: "part2_when_boats_meet",
    3: "part3_conduct_of_a_race",
    4: "part4_other_requirements",
    5: "part5_protests_redress",
    6: "part6_entry_qualification",
    7: "part7_event_organization",
}

SECTION_SUFFIXES = {
    2: {"A": "right_of_way", "B": "general_limitations",
        "C": "marks_and_obstructions", "D": "other_rules"},
    4: {"A": "general", "B": "equipment"},
    5: {"A": "protests", "B": "hearings", "C": "misconduct", "D": "appeals"},
}


def section_dirname(part: int, letter: str) -> str:
    suffix = SECTION_SUFFIXES.get(part, {}).get(letter, "")
    base = f"section_{letter.lower()}"
    return f"{base}_{suffix}" if suffix else base


def parse_rules_text(full_text: str) -> list[dict]:
    """
    Parse the full pdftotext output into a list of section dicts.
    Each dict has: type, part, section, rule_num, title, body, filename,
                   part_name, section_name
    """
    lines = full_text.splitlines()

    # ---- Helpers ----
    def stripped(line):
        return line.strip()

    def is_page_num(s):
        return bool(re.match(r"^\d+$", s))

    def is_running_part_header(s):
        # e.g. "Part 2   WHEN BOATS MEET" or "DEFINITIONS"
        return bool(re.match(r"^Part\s+\d+\s+[A-Z]", s))

    # ---- Find structural landmarks ----
    # The TOC is in roughly the first 163 lines; real content starts after.
    CONTENT_START = 163

    # Valid rule number ranges per part (inclusive)
    PART_RULE_RANGES = {
        1: (1, 6), 2: (10, 23), 3: (25, 37),
        4: (40, 56), 5: (60, 72), 6: (75, 80), 7: (85, 92),
    }

    def rule_in_range(part, num):
        if part is None:
            return False
        lo, hi = PART_RULE_RANGES.get(part, (0, 999))
        return lo <= int(num) <= hi

    landmarks = []   # list of (line_index, event_type, data)
    current_part_lm = None  # track part during landmark scan

    i = CONTENT_START
    in_appendix = False   # once True, suppress part/section/rule detection
    while i < len(lines):
        s = stripped(lines[i])

        # Race signals: very beginning of document (before CONTENTS)
        if i == CONTENT_START:
            landmarks.append((i, "race_signals", {}))

        # INTRODUCTION, DEFINITIONS, BASIC PRINCIPLES  (only before appendices)
        if not in_appendix and s in ("INTRODUCTION", "DEFINITIONS", "BASIC PRINCIPLES"):
            landmarks.append((i, s.lower().replace(" ", "_"), {}))
            i += 1
            continue

        # PART N  (on its own line, possibly indented; only before appendices)
        if not in_appendix:
            m = re.match(r"^PART\s+(\d+)$", s)
            if m:
                part_num = int(m.group(1))
                current_part_lm = part_num
                # Next non-empty line should be the part's subtitle
                j = i + 1
                while j < len(lines) and not stripped(lines[j]):
                    j += 1
                part_title = stripped(lines[j]) if j < len(lines) else ""
                landmarks.append((i, "part_start", {"num": part_num, "title": part_title}))
                i = j + 1
                continue

        # SECTION X  (on its own line; only before appendices)
        if not in_appendix:
            m = re.match(r"^SECTION\s+([A-Z])$", s)
            if m:
                letter = m.group(1)
                # Next non-empty line is section title
                j = i + 1
                while j < len(lines) and not stripped(lines[j]):
                    j += 1
                sec_title = stripped(lines[j]) if j < len(lines) else ""
                landmarks.append((i, "section_start", {"letter": letter, "title": sec_title}))
                i = j + 1
                continue

        # Rule N   TITLE  (integer rule number; only before appendices, only if in valid range)
        if not in_appendix:
            m = re.match(r"^(\d{1,3})\s{2,}([A-Z][^\n]{2,})$", s)
            if m and rule_in_range(current_part_lm, m.group(1)):
                rule_num = m.group(1)
                rule_title = m.group(2).strip()
                landmarks.append((i, "rule", {"num": rule_num, "title": rule_title}))
                i += 1
                continue

        # Appendix X  TITLE  — only real appendix headers (ALL CAPS title, not TOC Title Case)
        # TOC entries look like "Appendix A Scoring   59"; real headers like "Appendix A   SCORING"
        m = re.match(r"^Appendix\s+([A-Z]+)\s{2,}([A-Z][A-Z0-9 ,\-/]+)$", s)
        if m:
            in_appendix = True
            app_letter = m.group(1)
            app_title = m.group(2).strip()
            landmarks.append((i, "appendix", {"letter": app_letter, "title": app_title}))
            i += 1
            continue

        i += 1

    # ---- Extract body text between landmarks ----
    sections = []
    current_part = None
    current_section = None

    def body_between(start_line, end_line):
        """Collect lines between landmarks, cleaning noise."""
        chunk = []
        for ln in lines[start_line:end_line]:
            s = ln.rstrip()
            s_stripped = s.strip()
            # Skip bare page numbers
            if is_page_num(s_stripped):
                continue
            # Skip running part-headers ("Part 2   WHEN BOATS MEET")
            if is_running_part_header(s_stripped):
                continue
            # Skip repeated section labels that appear as running headers
            if re.match(r"^(DEFINITIONS|INTRODUCTION|BASIC PRINCIPLES)$", s_stripped):
                continue
            chunk.append(s)
        text = "\n".join(chunk)
        # Collapse 3+ blank lines to 2
        text = re.sub(r"\n{3,}", "\n\n", text)
        return text.strip()

    for idx, (line_idx, event, data) in enumerate(landmarks):
        next_line = landmarks[idx + 1][0] if idx + 1 < len(landmarks) else len(lines)
        body = body_between(line_idx + 1, next_line)

        if event == "race_signals":
            # Limit to content before CONTENTS page
            end = next_line
            for k, (li, ev, _) in enumerate(landmarks):
                if ev == "introduction":
                    end = li
                    break
            body = body_between(CONTENT_START, end)
            sections.append({
                "type": "race_signals",
                "part": None, "section": None, "rule_num": None,
                "title": "Race Signals",
                "body": body,
                "part_name": "race_signals",
                "section_name": "",
                "filename": "race_signals.md",
            })

        elif event == "introduction":
            sections.append({
                "type": "introduction",
                "part": None, "section": None, "rule_num": None,
                "title": "Introduction",
                "body": body,
                "part_name": "introduction",
                "section_name": "",
                "filename": "introduction.md",
            })

        elif event == "definitions":
            sections.append({
                "type": "definitions",
                "part": None, "section": None, "rule_num": None,
                "title": "Definitions",
                "body": body,
                "part_name": "definitions",
                "section_name": "",
                "filename": "definitions.md",
            })

        elif event == "basic_principles":
            sections.append({
                "type": "basic_principles",
                "part": None, "section": None, "rule_num": None,
                "title": "Basic Principles",
                "body": body,
                "part_name": "basic_principles",
                "section_name": "",
                "filename": "basic_principles.md",
            })

        elif event == "part_start":
            current_part = data["num"]
            current_section = None
            # Part preamble goes into its own file if there is text
            if body:
                pname = PART_NAMES.get(current_part, f"part{current_part}")
                sections.append({
                    "type": "part_preamble",
                    "part": current_part, "section": None, "rule_num": None,
                    "title": f"Part {current_part}: {data['title'].title()}",
                    "body": body,
                    "part_name": pname,
                    "section_name": "",
                    "filename": "preamble.md",
                })

        elif event == "section_start":
            current_section = data["letter"]
            # Section preamble
            if body:
                pname = PART_NAMES.get(current_part, f"part{current_part}")
                sname = section_dirname(current_part, current_section)
                sections.append({
                    "type": "section_preamble",
                    "part": current_part, "section": current_section, "rule_num": None,
                    "title": f"Section {current_section}: {data['title'].title()}",
                    "body": body,
                    "part_name": pname,
                    "section_name": sname,
                    "filename": "preamble.md",
                })

        elif event == "rule":
            rule_num = data["num"]
            rule_title = data["title"]
            pname = PART_NAMES.get(current_part, f"part{current_part}") if current_part else "unknown"
            sname = section_dirname(current_part, current_section) if current_section else ""
            slug = slugify(rule_title)
            filename = f"rule_{rule_num}_{slug}.md"
            sections.append({
                "type": "rule",
                "part": current_part,
                "section": current_section,
                "rule_num": rule_num,
                "title": rule_title,
                "body": body,
                "part_name": pname,
                "section_name": sname,
                "filename": filename,
            })

        elif event == "appendix":
            letter = data["letter"]
            title = f"Appendix {letter}: {data['title']}"
            filename = f"appendix_{letter.lower()}_{slugify(data['title'])}.md"
            sections.append({
                "type": "appendix",
                "part": None, "section": None, "rule_num": None,
                "title": title,
                "body": body,
                "part_name": "appendices",
                "section_name": "",
                "filename": filename,
            })

    # ---- Merge duplicate entries (same filename) ----
    # Running page headers cause the same section to appear multiple times.
    # Merge them by concatenating their bodies.
    merged = []
    seen: dict[str, int] = {}  # filename -> index in merged
    for entry in sections:
        key = entry["part_name"] + "/" + entry["section_name"] + "/" + entry["filename"]
        if key in seen:
            existing = merged[seen[key]]
            existing["body"] = existing["body"] + "\n\n" + entry["body"]
        else:
            seen[key] = len(merged)
            merged.append(entry)

    return merged


# ---------------------------------------------------------------------------
# Step 4: Write markdown files
# ---------------------------------------------------------------------------

SOURCE_URL = "https://www.sailing.org/inside-world-sailing/rules-regulations/racingrules/"


def write_markdown(entry: dict, output_dir: Path, rrs_version: str, dry_run: bool) -> None:
    pname = entry["part_name"]
    sname = entry["section_name"]
    fname = entry["filename"]

    if not pname or not fname:
        return

    body = entry["body"]
    if not body.strip():
        return  # skip empty sections

    # Dedent the body: remove common leading whitespace
    body_lines = body.splitlines()
    dedented = []
    for ln in body_lines:
        dedented.append(ln.lstrip())
    body = "\n".join(dedented)
    # Re-collapse excessive blank lines
    body = re.sub(r"\n{3,}", "\n\n", body).strip()

    target_dir = output_dir / pname / sname if sname else output_dir / pname
    target_file = target_dir / fname

    title = entry["title"]
    etype = entry["type"]

    # Human-readable part/section names
    PART_TITLES = {
        1: "Fundamental Rules", 2: "When Boats Meet",
        3: "Conduct of a Race", 4: "Other Requirements When Racing",
        5: "Protests, Redress, Hearings, Misconduct and Appeals",
        6: "Entry and Qualification", 7: "Event Organization",
    }
    SECTION_TITLES_HUMAN = {
        2: {"A": "Right of Way", "B": "General Limitations",
            "C": "At Marks and Obstructions", "D": "Other Rules"},
        4: {"A": "General", "B": "Equipment and Clothing"},
        5: {"A": "Protests, Redress and Support Persons",
            "B": "Hearings and Decisions", "C": "Misconduct",
            "D": "Appeals and Requests"},
    }

    # Build header
    meta_lines = [f"**Source:** Racing Rules of Sailing {rrs_version}, World Sailing  ", SOURCE_URL]

    if etype == "rule":
        part_num = entry.get("part")
        section = entry.get("section")
        part_title = PART_TITLES.get(part_num, "")
        part_label = f"Part {part_num} — {part_title}" if part_num and part_title else ""
        section_label = ""
        if section and part_num:
            sec_title = SECTION_TITLES_HUMAN.get(part_num, {}).get(section, "")
            if sec_title:
                section_label = f"Section {section} — {sec_title}"

        header = f"# Rule {entry['rule_num']}: {title}\n\n"
        if part_label:
            header += f"**{part_label}**  \n"
        if section_label:
            header += f"**{section_label}**\n"
        header += "\n" + "\n".join(meta_lines) + "\n\n---\n\n"
    else:
        header = f"# {title}\n\n"
        header += "\n".join(meta_lines) + "\n\n---\n\n"

    content = header + body + "\n"

    if dry_run:
        print(f"  [dry-run] {target_file.relative_to(output_dir)}")
        return

    target_dir.mkdir(parents=True, exist_ok=True)
    target_file.write_text(content, encoding="utf-8")
    print(f"  Wrote {target_file.relative_to(output_dir)}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Fetch Racing Rules of Sailing from sailing.org and write markdown files."
    )
    parser.add_argument("--dry-run", action="store_true",
                        help="Parse and show what would be written, but don't write files")
    parser.add_argument("--output-dir", default="./rules",
                        help="Directory to write markdown files (default: ./rules)")
    parser.add_argument("--pdf", metavar="PATH",
                        help="Use a local PDF file instead of downloading from sailing.org")
    args = parser.parse_args()

    output_dir = Path(args.output_dir).resolve()
    print(f"Output directory: {output_dir}")

    with tempfile.TemporaryDirectory() as tmpdir:
        if args.pdf:
            pdf_path = Path(args.pdf)
            print(f"Using local PDF: {pdf_path}")
        else:
            pdf_url = discover_rrs_pdf_url()
            pdf_path = Path(tmpdir) / "rrs.pdf"
            download_file(pdf_url, pdf_path)

        print("Extracting text from PDF…")
        text = extract_pdf_text(pdf_path)

        rrs_version = detect_rrs_version(text)
        print(f"Detected RRS version: {rrs_version}")

        print("Parsing rules…")
        sections = parse_rules_text(text)

        by_type = {}
        for s in sections:
            by_type.setdefault(s["type"], 0)
            by_type[s["type"]] += 1
        print("Sections found:", by_type)

        print("Writing markdown files…")
        for entry in sections:
            write_markdown(entry, output_dir, rrs_version, dry_run=args.dry_run)

    print("\nDone.")


if __name__ == "__main__":
    main()
