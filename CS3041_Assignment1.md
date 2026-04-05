# CS 3041: Human-Computer Interaction
## Assignment 1: Ideation, User Research & Analysis

---

# Part A: Problem Finding

## Problem Statement

Competitive sailors need a better way to learn when racing rules apply because tools like Quizlet and flashcards only test memorization, not real-situation judgment. I know this is real because my sister made her own flashcard system but still struggles to know which rules apply when she is actually racing.

## Key Assumption Statement

My key assumption is that sailors struggle not because they can't memorize rules, but because they can't tell which rule applies in a real situation. If that's wrong — if memorization is actually the main issue — then a better flashcard app would be enough, and I'd need to change direction.

## Arrival Note

I listed 16 frustrations from my own life and people I know, then grouped them into clusters. My sister's struggle with sailing rules stood out most and became its own cluster. When I pressure-tested it, I found she had already tried flashcards but they didn't help on the water. That confirmed the problem is real and showed the key gap: memorization tools exist, but nothing helps sailors apply rules in the moment.

---

# Part B: Brainstorming

*Ideas 1–20 were generated on my own before any AI help. Ideas 21–50 were generated with AI assistance and reviewed for relevance. Ideas 46, 47, and 48 are hedge ideas — still useful if my key assumption turns out to be wrong.*

1. Animated diagram of two boats approaching with the correct rule highlighted
2. Drag-and-drop tool where you set up a scenario and the app shows which rule applies
3. Quiz mode where you pick the correct rule for a given scenario
4. "Judgment mode" where you explain what you'd do and AI checks your reasoning
5. Progress tracker showing which rules you keep getting wrong
6. Personalized summary of weak spots after each session
7. Custom boat colors so practice boats look like your real boat
8. A racing game where wrong rule calls slow you down or get you penalized
9. "Rule of the day" mode for quick daily review
10. Flashcard mode for users who prefer traditional studying
11. Audio narration of rules to listen to while rigging or on the water
12. Voice lookup — describe a situation out loud and the app finds the rule
13. Multiplayer mode where two sailors each control a boat and decide who has right of way
14. Team study room where a coach loads scenarios for the whole team to answer
15. Offline mode with downloadable rules and scenarios for use without cell service
16. "Dock mode" — simple big-button layout for quick rule lookup before a race
17. GPS replay tool where you trace a race and the app flags rule violations
18. Post-race review where you log what happened and see which rules applied
19. Coach dashboard showing which rules each team member struggles with
20. Race-type filter so only the rules for your specific format (fleet, team, match) are shown
21. A "choose your own adventure" race where you make rule calls at each conflict
22. Slow-motion scenario replay showing exactly when a rule kicks in
23. "What went wrong" mode — see a collision outcome and identify the rule that was broken
24. Side-by-side comparison of two similar scenarios with different outcomes
25. Timed pressure mode where scenarios speed up as your skill improves
26. Leaderboard where teammates compete on accuracy scores
27. "Challenge a friend" — send a tricky scenario to a teammate and see if they get it right
28. Community scenario library where experienced sailors share real situations
29. Mentorship mode where an experienced sailor annotates a scenario and sends it to a newer one
30. Debate mode where two users argue which rule applies and an AI decides
31. AI that generates new unique scenarios so you never repeat the same one
32. Plain-English rule search — type a situation and the app finds the rule
33. AI coach that spots patterns in your wrong answers and explains what you're missing
34. Photo upload where you take a picture of a race situation and AI identifies the rules
35. AI that rewrites rules in simpler language based on your experience level
36. Overhead map view where you drag boats and animate their paths
37. Color-coded rules so right-of-way rules are one color, mark-rounding rules another
38. Diagram showing how rules connect and override each other
39. AR mode where you point your phone at boats on the water and see rule overlays
40. Timeline showing exactly when during an approach a rule becomes active
41. Bookmarks for rules you always forget
42. Weekly rule notification with a scenario example
43. Glossary with plain-English definitions for sailing terms in the rulebook
44. Side-by-side view of the official rulebook text and a plain-English version
45. Quick-reference card generator that pulls your weakest rules into a printable sheet
46. ⭐ **[HEDGE]** Spaced repetition flashcards with scenario images attached to each rule
47. ⭐ **[HEDGE]** Structured rule course broken into modules by category with quizzes
48. ⭐ **[HEDGE]** Mnemonic generator that creates memorable phrases to help remember rules
49. A podcast where each episode walks through a real race incident and the rules involved
50. A physical card game version of the scenario quiz for use on the dock without a screen

---

# Part C: Initial User Research

## Research Brief

**Participants & Method**

I interviewed two competitive collegiate sailors over video call. Each session was about 15–20 minutes. I used five prepared questions focused on how they currently study rules and where that breaks down. At least one question was designed to test my key assumption.

**Key Insights**

1. *Sailors need situational judgment, not just memorization, because tools like Quizlet only test recall without showing when a rule actually applies.*

2. *Sailors need to understand rule nuances because simple rules have subtle details that are easy to miss until you're in a real situation.*

3. *Sailors need to know rules strategically because the protest system means you can use rules as a competitive tool — or get penalized if you don't know them.*

4. *Sailors need a tool that reflects different race types because fleet, team, and match racing have different rules and no current tool separates them.*

5. *Sailors need realistic scenario practice because passive studying doesn't build the quick recognition needed during a real race.*

**Supporting Quotes**

- *"Quizlet doesn't help with actual situational relationships — it's just multiple choice and doesn't help with reinforcement."*
- *"The simple rules have nuances so it's good to know those — it's harder to notice from the outside vs. in person."*

## Assumption Check

My assumption was that the main problem is situational recognition, not memorization. The research supports this. Both participants said tools like Quizlet fail because they test recall without context. I also learned that the protest system makes this more serious than I expected — knowing rules isn't just about avoiding mistakes, it's a competitive skill.

---

# Part D: Project Proposal

## Idea Refinement

**Building on an idea:** Starting from idea #8 (a racing game where wrong rule calls get you penalized), I extended it into something bigger: a full race simulation mode where you sail a course, encounter real rule conflicts at different points, and have to make the right call to stay in contention. The original idea was just a penalty mechanic, but this version adds a full race narrative — you're not just answering questions, you're trying to win a race. That makes the stakes feel real and connects rule knowledge directly to race outcomes.

**Combining two ideas:** I combined idea #2 (drag-and-drop scenario tool) with idea #31 (AI that generates new scenarios) into one core feature: an interactive whiteboard where you position boats and step through a scenario, paired with an AI coach that creates new situations based on what you get wrong. This is better than either idea alone because the whiteboard gives visual context while the AI keeps the challenge matched to your weak spots.

**Revisiting the key assumption:** If my assumption is right (situational judgment is the barrier), the scenario trainer, AI coach, and race simulation are the most valuable features. If it's wrong (memorization is the barrier), the spaced repetition mode and structured rule modules take priority. The platform supports both, so it stays useful either way.

---

## (1) Project Title

**Race Ready: An Interactive Platform for Mastering Sailing Racing Rules Through Situational Training**

---

## (2) Problem Description

Competitive sailors in fleet, team, and match racing have to make fast decisions based on the Racing Rules of Sailing (RRS). Most sailors study using Quizlet, flashcards, or a PDF of the rulebook. These tools only test memorization — they don't help sailors recognize which rule applies in a real race. This matters because the protest system means getting a rule wrong can cost you a race or result in a penalty. Research with two collegiate sailors confirmed that the problem is not remembering rules in isolation — it's knowing when they apply. Existing tools are either static references like the RYA eBook, or basic quizzes like the Finckh Quiz and Dave Perry's 100 Quizzes. None combine AI coaching, scenario training, gamification, and a rule reference in one place. Race Ready fills that gap with scenario-based training, an AI coach, an interactive whiteboard, a clickable rule library, quiz modes, and a coach dashboard for tracking team progress.

---

## (3) User Analysis

The main users are competitive collegiate sailors in fleet, team, and match racing preparing for regattas. They are typically 18–22 years old and have 3–10 years of sailing experience. They understand boat handling, points of sail, and basic racing tactics, but their rule knowledge is still developing — they know rules exist but struggle to apply them quickly and correctly under pressure. They are comfortable with technology and use apps regularly for studying and communication. Their main goal is to know rules well enough to apply them instinctively and use them strategically in protests. Key constraints include limited study time due to academics and athletics, unreliable internet at sailing venues, and the need to use the platform on both phone and laptop. Secondary users are coaches who need to track team progress, assign drills, and run team study sessions. A third group is the broader collegiate sailing community, including race officials, who benefit when sailors arrive at regattas with stronger rule knowledge.

---

## (4) UX and Usability Goals

**Full list of relevant goals:** situational accuracy, learnability, engagement, memorability, error tolerance, efficiency, cross-device usability, customization, and collaborative use.

**The three most important:**

### 1. Situational Accuracy
This is the most important goal because it is the whole point of the platform. Every other goal — engagement, learnability, efficiency — only matters if the platform actually works. If Race Ready doesn't improve a sailor's ability to apply rules correctly in new situations, it has failed no matter how fun or easy to use it is. It ranks above engagement because a platform can be engaging without being effective, and above learnability because even a hard-to-learn tool is worth using if it produces real results.
- Does quiz accuracy improve after three sessions compared to a baseline score?
- Can a user correctly identify the right rule in a scenario they've never seen before?
- Do users report feeling more confident applying rules during actual races after using the platform?

### 2. Engagement and Motivation
This is the second most important goal because learning only happens if users come back. Quizlet already failed to keep sailors engaged despite being functional — which proves that a tool can be accurate and still unused. Engagement ranks above learnability because a sailor who finds the platform fun will figure out how to use it, but a sailor who finds it boring won't return even if it's easy to navigate.
- Do users come back more than once a week without being told to?
- Do users finish full sessions or drop off early — and if so, where?
- Do users say Race Ready is more engaging than what they used before?

### 3. Learnability
This is the third most important goal because Race Ready has several features — a whiteboard, AI chat, scenario trainer, and rule library — and sailors are busy. If the platform isn't intuitive from the start, people won't invest the time to learn it. It ranks below accuracy and engagement because it is a barrier to entry rather than a measure of success — once users are past the learning curve, learnability no longer matters.
- Can a new user finish their first scenario quiz within two minutes with no help?
- Do users need to look up help to use the whiteboard?
- How many wrong clicks does a first-time user make before finding what they need?

---

## (5) Literature Review and Review of Existing Systems

### Existing Tools

The World Sailing website provides the official RRS text, Case Book, and Call Book but has no interactive learning features (World Sailing, 2025, https://www.sailing.org/inside-world-sailing/rules-regulations/racingrules/). The World Sailing Rules App was retired in 2024 and replaced by a paid RYA eBook — a useful reference but not a learning tool (RYA, 2024). SailZing offers animated scenarios, video summaries, and quizzes and is one of the best free resources available (SailZing, https://sailzing.com/). The Finckh Rules Quiz Game is a browser-based quiz with illustrated scenarios and rule citations — the closest thing to Race Ready currently — but it has no personalization or AI features (Finckh, http://game.finckh.net/). The US Sailing app has a searchable rulebook and a basic whiteboard, and Dave Perry's *100 Best Racing Rules Quizzes* (2025) is the standard for scenario-based rule education, but both are static with no adaptive features (US Sailing, 2025). No academic research was found on interactive technology for teaching racing rules — a clear gap.

### Situated Cognition and Learning Theory

Brown, Collins, and Duguid (1989) argued that knowledge only makes sense in context — you can't separate what you know from where you learned it ("Situated Cognition and the Culture of Learning," *Educational Researcher*, 18(1), 32–42). A sailor who can recite Rule 10 may still get it wrong in a real race. Lave and Wenger (1991) showed that real skill develops through practice in real situations, not abstract drill (*Situated Learning*, Cambridge University Press). Mayer (2002) drew a clear line between memorizing something and actually being able to use it in new situations — the second is what Race Ready is designed to build ("Rote Versus Meaningful Learning," *Theory into Practice*, 41(4), 226–232). Kolb's *Experiential Learning* (1984, Prentice-Hall) describes a four-step learning cycle — experience, reflect, understand, apply — that maps directly to how Race Ready works: try a scenario, get feedback, study the rule, then try a new one.

### Gamification

Multiple studies show gamification improves learning. Sailer and Homner (2020) found meaningful effects on knowledge, motivation, and behavior (*Educational Psychology Review*, 32, 77–112). Bai, Hew, and Huang (2020) found a medium overall effect and noted that learners like feedback and goals but dislike forced competition (*Educational Research Review*, 30, 100322). Tahir et al. (2023) found a large overall effect in *Frontiers in Psychology* (14, 1253549). Sailer et al. (2017) showed that badges and progress graphs help users feel competent, while team features and real choices support motivation (*Computers in Human Behavior*, 69, 371–380). Kapp's *The Gamification of Learning and Instruction* (2012, Pfeiffer/Wiley) covers gamification specifically for rules-based knowledge — directly relevant here.

### Sports Decision Training

Referee training research is the closest model to Race Ready. The Perception4Perfection platform (https://www.perception4perfection.eu), built with UEFA, trains referees using real match clips and scenario feedback — and showed 23–25% improvement in on-field accuracy. Arikan et al. (2016) showed a serious game for football referees outperformed paper-based training on both rules knowledge and decision-making (*SpringerPlus*, 5, 1927). Schweizer et al. (2011) found that simple scenario-plus-feedback loops were enough to improve accuracy (*Journal of Applied Sport Psychology*, 23(4), 429–442). In sailing specifically, Araújo et al. (2015) found that racing decisions are shaped by the constant interaction between boats, wind, and context — not isolated rule recall — supporting a scenario-based design (*European Journal of Sport Science*, 15(3), 195–202).

### AI Tutoring

Ma et al. (2014) found that AI tutoring systems perform as well as one-on-one human tutoring and better than classroom instruction (*Journal of Educational Psychology*, 106(4), 901–918). Kestin et al. (2025) found that a custom GPT tutor at Harvard outperformed in-class active learning (*Scientific Reports*, 15, 17458). Liu et al. (2025) showed that AI systems grounded in a specific document set (RAG) are more accurate and reliable — this approach would work well for Race Ready, where the AI coach would be grounded in the official RRS text to avoid giving wrong rule answers (*PeerJ Computer Science*, 11, e2991). Labadze et al. (2023) reviewed 67 studies and found AI chatbots work best when they act as coaches, not just answer machines (*International Journal of Educational Technology in Higher Education*, 20, 68).

### Summary

Race Ready fills a real gap. Existing sailing tools are either static references or basic quizzes. No tool combines adaptive AI coaching, scenario simulation, gamification, and a rule reference in one place. No academic research specifically covers interactive technology for teaching racing rules. Three design principles stand out: ground all AI responses in the official RRS text to prevent wrong answers; show the same rule across many different scenario types to build real transfer; and structure learning around Kolb's cycle — experience, reflect, understand, apply.

---

# AI Use Statement

Claude (Anthropic) was used throughout this assignment. In Part A, Claude helped draft and refine the problem statement and key assumption based on my experience. I reviewed everything to confirm it matched my reasoning. In Part B, I generated the first 20 ideas on my own, then used Claude to extend the list to 50. I reviewed all suggestions and only kept the ones that were relevant. In Part C, Claude helped organize my interview notes into the required format. All insights came from real participant responses. In Part D, Claude helped find and summarize related work for the literature review. I checked sources before including them and removed any I couldn't verify. Claude also helped draft the proposal sections based on my decisions throughout the process. I reviewed and edited all content to make sure it accurately reflects my project.
