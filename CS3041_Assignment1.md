# CS 3041: Human-Computer Interaction
## Assignment 1: Ideation, User Research & Analysis

---

# Part A: Problem Finding

## Problem Statement

Competitive sailors preparing for fleet, team, and match racing need a better way to learn racing rules because existing study tools like flashcards and Quizlet only support rote memorization and not situational judgment. 

I know this is real because my sister, a sailor preparing for competitive collegiate racing, created her own flashcard system but still struggles to recognize which rules apply when she is actually on the water.

## Key Assumption Statement

My key assumption is that sailors who struggle with rules do so not because they cannot memorize them, but because they cannot recognize which rule applies in a specific on-water scenario. 

If memorization alone is actually the primary issue then a well structured flashcard or spaced-repetition quiz app might be sufficient, and my project direction would need to shift toward reinforcing memorization rather than building situational judgment.

## Arrival Note

I listed frustrations from my own life and people I know, then grouped them into clusters. My sister's struggle with sailing rules stood out and became its own cluster. When I pressure tested it, she had already tried flashcards but they didn't help. The real gap is that sailors need to know rules well enough to both avoid breaking them and challenge other boats when they do.

---

# Part B: Brainstorming

Ideas 1–20 are my own. Ideas 21–50 used AI assistance. Ideas 46–48 are hedge ideas.

- Animated diagram showing two boats approaching each other with the applicable rule highlighted
- Drag and drop boat positioning tool where you set up a scenario and the app tells you which rule applies
- A quiz mode where you see a scenario and pick the correct rule from multiple choice
- A judgment mode where you describe what you would do and the app evaluates your reasoning
- Progress tracker that shows which rules you consistently get wrong
- Personalized weak spot report after each study session
- Team color and sail customization so your practice boats look like your actual boat
- A racing game where you must apply rules correctly or get penalized
- A rule of the day mode for quick daily review
- Flashcard mode as a fallback for users who prefer traditional study
- Audio narration of rules so sailors can listen while rigging or on the water
- Voice activated rule lookup where you say a situation out loud and the app identifies the relevant rule
- Multiplayer scenario mode where two sailors each play a boat and must decide who has right of way
- Team study room where a coach queues up scenarios for the whole team to answer simultaneously
- Fully offline mode with downloadable rule sets and scenarios for use without cell service
- A dock mode with simplified large button interface designed for quick lookup before a race
- GPS integrated replay tool where you trace what happened in a race and the app flags potential rule violations
- Post race review mode where you log incidents and the app explains which rules applied
- Coach dashboard showing which rules each team member struggles with most
- Race type selector that filters rules to only show what applies to your specific format
- A choose your own adventure style story where you navigate a full race and make rule decisions at each conflict point
- A slow motion replay tool that breaks down a scenario step by step so you can see exactly when a rule kicks in
- A what went wrong mode where you see the outcome of a collision and have to identify which rule was violated
- A side by side comparison tool showing two similar scenarios with different outcomes to highlight subtle rule differences
- A timed pressure mode where scenarios speed up as you improve to simulate real race decision making stress
- A leaderboard where teammates compete on scenario accuracy scores
- A challenge a friend feature where you send a tricky scenario to a teammate and see if they get it right
- A community submitted scenario library where experienced sailors upload real situations they have encountered
- A mentorship mode where an experienced sailor can annotate a scenario and send it to a less experienced one
- A debate mode where two users argue which rule applies and a moderator decides
- A scenario generator that creates unique situations so you never see the same one twice
- A plain English rule search where you type a situation and it finds the relevant rule
- A pattern tracker that identifies which types of rules you get wrong most often
- A photo upload feature where you take a picture of a race situation and the app identifies which rules are in play
- A simplified rule rewriter that presents rules in plain language based on your experience level
- An interactive overhead map view where you drag boats into position and animate their paths
- A color coded rule categorization system so rules about right of way are one color and mark rounding rules are another
- A rule relationship diagram showing how rules connect and override each other
- An augmented reality mode where you point your phone at real boats on the water and see rule overlays
- A visual timeline showing exactly when during a boats approach a rule becomes active
- A bookmark system where you save rules you always forget for quick access
- A rule of the week notification that surfaces one rule with a scenario example each week
- A glossary mode that defines sailing specific terms used in the rulebook in plain language
- A side by side view of the official rulebook text next to a plain English translation
- A printable quick reference card generator that pulls your weakest rules into a cheat sheet
- **[HEDGE]** A spaced repetition flashcard system built around sailing rules with scenario images attached to each card
- **[HEDGE]** A structured rule memorization course broken into modules by category with built in quizzes after each section
- **[HEDGE]** A mnemonic tool that creates memorable phrases to help sailors remember specific rules
- A sailing rules podcast where each episode walks through a real race incident and the rules involved
- A physical card game version of the scenario quiz that sailors can play on the dock without any screen

---

# Part C: Initial User Research

## Research Brief

**Participants & Method**

I conducted semi structured video call interviews with two competitive collegiate sailors. I did an open ended interview on how they currently memorize sailing rules. There was a question about specifically whether the primary barrier is memorization or situational recognition.

**Key Insights**

1. *Sailors need to recognize which rule applies in a real situation, not just memorize rules, because tools like Quizlet only test recall.*

2. *Sailors need to understand the nuances of rules because simple rules have subtle details that are easy to miss until you're actually in a race.*

3. *Sailors need to know rules strategically because the protest system means you can use rules against opponents or get penalized if you don't know them.*

4. *Sailors need a tool that separates rules by race type because fleet, team, and match racing each have different rules.*

5. *Sailors need to practice with realistic scenarios because studying words alone doesn't build the recognition needed in real senarios.*

**Quotes**

- *"Quizlet doesn't help with actual situational relationships, it's just multiple choice and doesn't help with reinforcement."*
- *"The simple rules have nuances so it's good to know those nuances , it's harder to notice from the outside vs. in person."*

## Assumption Check

My key assumption was that sailors struggle not with memorizing rules but with recognizing which rule applies in a specific situation. Both participants confirmed that tools like Quizlet fail precisely because they test memorization without context. Furthermore, the protest system means misapplying or failing to recognize a rule can result in penalties, lost races, or missed opportunities to call out opponents.

---

# Part D: Refining the Idea & Project Proposal

## Idea Refinement

Starting from idea #3 (quiz mode where you pick the correct rule for a given scenario). Instead of just picking from a list, users are shown a real sailing situation and have to identify what rules apply and how they should respond. This makes studying more realistic and directly addresses the gap that Quizlet and flashcards leave.

I combined idea #2 (drag-and-drop boat positioning tool) with idea #36 (overhead map view where you drag boats and animate their paths) into one interactive whiteboard. Users can position boats, set the wind direction, and step through how a situation unfolds to see which rules apply. This is better than either idea alone because it gives both setup flexibility and visual context.

**Revisiting the key assumption:** If my assumption is right (situational judgment is the barrier), the scenario simulator and interactive whiteboard are the most valuable features. If it's wrong (memorization is the barrier), the written rule reference section becomes the priority. The platform supports both, so it stays useful either way.

---

## (1) Project Title

**Race Ready**
A Sailing Rules Study Platform for Competitive Sailors

---

## (2) Problem Description

Competitive sailors in fleet, team, and match racing struggle to apply racing rules correctly during a race. Most sailors study using Quizlet, flashcards, or a PDF of the rulebook, but these tools only test memorization they don't help sailors recognize which rule applies in a real situation. This matters because the protest system means getting a rule wrong can cost you a race or result in a penalty. No existing tool combines scenario training, an interactive whiteboard, and a rule reference in one place.

Race Ready addresses this with a written rule reference organized by race type, a scenario based study platform where users are shown real racing situations and tested on which rules apply, and an interactive whiteboard where sailors can position boats and step through situations to see how rules play out.

---

## (3) User Analysis

The main users are competitive collegiate sailors aged 18–22 in fleet, team, and match racing. They typically have a few years of sailing experience and understand basic boat handling and racing tactics, but are still learning the nuances in the rules. Their main goal is to know rules well enough to apply them instinctively and use them strategically in protest situations. Key constraints include limited study time due to academics and athletics, unreliable internet at sailing venues, and the need to use the platform on both phone and laptop. Secondary users are coaches who assign drills and track team progress.

---

## (4) User Experience and Usability Goals

### 1. Situational Accuracy

This is the most important goal because it is the whole point of the platform. Every other goal only matters if the platform actually works. If Race Ready doesn't improve a sailor's ability to apply rules correctly in new situations, it has failed no matter how fun or easy to use it is. It ranks above engagement because a platform can be engaging without being effective, and above learnability because even a hard to learn tool is worth using if it produces real results.

- Does quiz accuracy improve after three sessions compared to a baseline score?
- Can a user correctly identify the right rule in a scenario they've never seen before?
- Do users report feeling more confident applying rules during actual races after using the platform?

### 2. Engagement and Motivation

Learning only happens if users come back. Quizlet already failed to keep sailors engaged despite being functional, which proves a tool can be accurate and still go unused. Engagement ranks above learnability because a sailor who finds the platform useful will figure out how to use it, but a sailor who finds it boring won't return even if it's easy to navigate.

- Do users come back more than once a week without being told to?
- Do users finish full sessions or drop off early, and if so where?
- Do users say Race Ready is more engaging than what they used before?

### 3. Learnability

Race Ready has several features including a whiteboard, scenario trainer, and rule reference library. Sailors are busy and won't read a manual. If the platform isn't intuitive from the start, people won't stick with it. It ranks below accuracy and engagement because it is a barrier to entry rather than a measure of success.

- Can a new user finish their first scenario quiz within two minutes with no help?
- Do users need to look up help to use the whiteboard?
- How many wrong clicks does a first-time user make before finding what they need?
---

## (5) Literature Review and Review of Existing Systems

### Existing Tools

**World Sailing** provides the official RRS text, Case Book, and Call Book on their website but has no interactive learning features (World Sailing, 2025, [https://www.sailing.org/inside-world-sailing/rules-regulations/racingrules/](https://www.sailing.org/inside-world-sailing/rules-regulations/racingrules/)). The World Sailing Rules App was retired in 2024 and replaced by a paid RYA eBook, useful as a reference but not a learning tool (RYA, 2024).

**SailZing** offers animated boat scenarios, video rule summaries, and quizzes and is one of the best free resources available. However it only covers Part 2 rules and has no progress tracking (SailZing, [https://sailzing.com/](https://sailzing.com/)).

**The Finckh Rules Quiz Game** is a browser-based quiz with illustrated scenarios and rule citations the closest existing tool to Race Ready. It has no personalization, progress tracking, or scenario variety beyond what is pre-built (Finckh, [http://game.finckh.net/](http://game.finckh.net/)).

**US Sailing** offers a searchable rulebook app with a basic whiteboard and video explanations. Dave Perry's _100 Best Racing Rules Quizzes_ (2025) is the standard for scenario-based rule education, but both are static with no adaptive or interactive features (US Sailing, 2025, [https://www.ussailing.org/competition/rules-officiating/the-racing-rules-of-sailing-2025-2028/](https://www.ussailing.org/competition/rules-officiating/the-racing-rules-of-sailing-2025-2028/)).

Existing sailing tools fall into two categories, static references and basic quizzes. None of them combine a rule reference, scenario simulation, and an interactive whiteboard in one place.

---

# AI Use Statement

Claude was used in the following ways. In Part B, I generated the first 20 ideas on my own, then used AI to extend the list to 50. I reviewed all suggestions and only kept relevant ones. In Part C, AI helped organize my raw interview notes into the required insight format. In Part D, AI was used to search for related work for the literature review. All sources were checked before including them and some I could not verify were removed.
