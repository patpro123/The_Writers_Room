Here's the complete plan we put together — saved here for reference before development begins.

The Writer's Room
A complete product plan for an Oxbridge-bound 14–17 year old fiction & essay writer

The North Star
The app should feel like a brilliant, warm literary mentor — not a tutor, not a grader. It pushes her thinking, holds her to a high standard, and never does the work for her. Every feature serves one goal: making her a more conscious, precise, and original writer.

Pillar 1 — Daily Spark
The creative ignition, every morning

One question per day, rotating across three types:

Observation lens — "Find a moment today where silence said more than words."
Character / narrative — "What does your most flawed character refuse to admit?"
Essay thinking — "Pick a belief you hold strongly. What's the best argument against it?"
She can respond in a private journal within the app — or just let it sit. No pressure, no scoring. This builds the habit of noticing.

Pillar 2 — The Craft Corner (Weekly)
Technique, deepened one question at a time

One craft concept per week, tied to what Oxbridge tutors actually look for:

Narrative distance & point of view
The unreliable narrator
Essay structure: argument vs. assertion
Imagery and specificity (not decoration)
The shape of a paragraph
Voice vs. style — what's the difference?
How writers handle time (compression, expansion, flashback)
Thesis clarity in personal essays
Pillar 3 — Literary Deep Dives (The Oxbridge Engine)
The academic core

A curated library of 15–20 works Oxbridge commonly references — Woolf, Fitzgerald, Shakespeare, Shelley, Atwood, Baldwin, Eliot, and more. For each work, three quiz modes:

Passage Analysis Quiz — She's shown a passage and answers: What technique? What effect? How does it connect to the work's central argument?
Thematic Debate Cards — She picks a position on a literary claim and writes 3–5 lines. The app responds with a counter-argument to wrestle with.
Comparative Thinking — Two works side by side with an Oxbridge-style question linking form, argument, and theme.
Progress tracked as: Not Started / Exploring / Deep Dived.

Pillar 4 — Essay & Piece Review
The literary expert mentor, not a grammar bot

She pastes a piece of writing — fiction or essay — and receives feedback across five lenses:

Lens	What it looks at
Argument & Clarity	Does the essay know what it's trying to say? Is the thesis earned or assumed?
Voice & Originality	Does this sound like a person with a distinct point of view?
Evidence & Specificity	Are claims grounded? Are images precise or generic?
Structure & Rhythm	Does the piece move with intention? Where does it sag or rush?
Craft Awareness	Is the writer making conscious choices — or just writing?
Feedback is delivered as questions and observations, never corrections or rewrites.

Pillar 5 — The Substack Bridge
Connecting her public writing to her private growth

She pastes the title or theme of a Substack post and gets back 3 thoughtful reader questions — the kind a critical reader would push back with. This prepares her for Oxbridge-style interrogation of her own ideas and makes her a more self-aware essayist.

Pillar 6 — Streak & Rhythm Tracker
Lightweight, not punishing

Not word counts. She tracks: Did I think deeply about writing today? + a mood tag (Restless / Curious / Stuck / Flowing / Sharp) + one line of reflection. Over weeks, she sees her own creative seasons.

Three User Journeys
Morning (5–10 min): Daily Spark arrives → she reads it, maybe responds, logs her mood.
Deep Work (30–60 min): Literary Deep Dive → passage analysis or debate card. Or paste a draft for Essay Review.
On-Demand: Craft Corner when stuck, Substack Bridge after publishing.
Technical Plan
Layer	Decision
Frontend	React (single artifact, runs in browser)
Storage	Browser localStorage for journal entries, progress, streaks
AI layer	Claude API (Sonnet) — only for Essay Review + Substack Bridge
Literary content	Curated, hand-written questions and passages — not AI-generated
Login	None needed — everything lives locally on her device
Build Order
Phase 1 — Shell: navigation, warm UI, mood tracker, Daily Spark (30 hand-crafted questions)
Phase 2 — Literary Deep Dives: 3–4 works fully built with passage quizzes + debate cards
Phase 3 — Essay Review: Claude API with literary mentor persona
Phase 4 — Craft Corner + Substack Bridge
Why This Works for Oxbridge
Oxbridge interviews test three things above all:

Can you argue a position and defend it under pressure? → Debate Cards
Can you read an unseen passage and say something intelligent? → Passage Analysis
Do you have a genuine literary identity? → Daily Spark + Essay Review
The app trains all three, quietly, every day.