# Linguify - Product Specification

## Overview

Linguify is a modern, AI-powered interactive space for language learners. It empowers users to expand their vocabulary topics and organize custom courses entirely within a single, beautifully animated interface. Integrating the capabilities of Gemini AI, Linguify enriches the vocabulary experience with automated definition guides, phonetic spelling Lookups, and dynamic quizzes, turning standard flashcards into highly engaging and memorable learning sprints.

## Goals

1. **Provide Structured Courses**: Allow users to browse lessons, watch syllabus video modules, review dynamic content summaries, and track overall syllabus completion.
2. **Dynamic Course Builder**: Let users add custom courses and insert new lesson pathways, specifying titles, media streaming links, and lesson descriptions.
3. **Immersive Vocabulary Cards**: Let users study organized semantic topics and review core words, audio-synthesized pronunciations, and multiple contextual examples.
4. **Interactive Practice Suites**: Allow users to test themselves using multi-mode practice modules including interactive translation tests, voice dictation, vocabulary quizzes, and matching card games.
5. **Enriched AI Integrations**: Integrate the Gemini API to automatically discover word families, retrieve International Phonetic Alphabet (IPA) guides, and translate/enrich vocabulary with a single click.
6. **Robust Offline-First State**: Retain all courses, vocabulary modifications, topic expansions, and custom notes instantly in browser storage with fallback defaults.

## Core User Flow

1. **Dashboard Entry**: The user lands on the dashboard, tracking core features (Word Families, Audio Guides, Games) and exploring current courses and topics.
2. **Course Progression**:
   - User goes to `/courses` and selects a custom or prebuilt language path.
   - User reviews the syllabus list, clicks "Play", watches video instruction of active lessons, and marks individual sessions as complete.
   - Dynamic progress meters adjust in real time.
3. **Vocabulary Study**:
   - User explores a semantic group (e.g., Greetings, Food) on `/vocabulary`.
   - User browses lists of words and clicks to read definitions, part of speech types, and listen to voice-synthesized English pronunciations.
   - User triggers "AI Assistant" triggers to pull IPA notations, Vietnamese definitions, and multiple contextual examples.
4. **Gamified Sprints**:
   - Inside any vocabulary topic page, the user switches the active tab or view mode to Games.
   - User picks a study structure:
     - **Flashcards**: Standard flip-interaction and swipe guides.
     - **Quiz**: Multiple-choice testing with scores.
     - **Translation**: Translating back and forth with score checking.
     - **Match**: Connect terms with meanings in a memory grid.

## Features

### Course Management
- Displays interactive course thumbnail banners.
- Includes expandable syllabi.
- Offers lesson descriptions, duration stats, video viewing capabilities, and persistent progress bars toggling live upon task completion.
- Interactive **Add Course Modal** allow designing courses with multiple lesson grids, titles, descriptions, and duration trackers.

### Vocabulary Workspace
- Categorizes words into distinct semantic topics.
- Audio guide button leverages native cross-browser text-to-speech engine instantly.
- Detailed listing of each term features parts of speech (Nouns, Verbs, Phrases) alongside list filters.
- **Add Vocabulary Modal**: Supports expanding existing topics with custom-created terms, meaning inputs, and optional multi-row examples.

### AI Cognitive Workspace
- Fully integrated Gemini-powered AI service leveraging client-friendly asynchronous flows.
- **Auto-Enrichment**: Generates correct English explanations, phonetic spellings, accurate definition translation, and illustrative example sentences.
- **Word Families explorer**: Pulls surrounding grammatical derivatives, helping users contextualize vocabulary clusters.

### Practice Arcade
- **Flip Cards deck**: Real-world interactive cards rendered with 3D turn animations.
- **Multiple-Choice Quiz**: Custom options layout randomized from existing vocab definitions.
- **Word Matching board**: A responsive card grid rewarding quick coordination.

## Scope

### In Scope
- Client-side React 19 + Vite site router configuration.
- HSL theme shifting (Light/Dark profiles).
- Detailed courses creation engine supporting descriptions for each individual lesson.
- Semantic vocabulary topic grouping and multi-example sentences support.
- Gamified practice interfaces spanning Flashcards, Quizzes, Match games, and Translation blocks with scoring loops.
- Gemini API integrations including pronunciation (IPA) guides and Vietnamese translations.
- Speech Synthesis integration for pronunciation audio feedback.
- Clean responsive layouts with robust screen density support.

### Out Of Scope
- Cloud synchronization across user systems (real database).
- Social multiplayer games and public leaderboards.
- Video uploads to custom bucket providers (all video URLs are linked directly from static media files or external mock links).
- Enterprise user account settings or payment integrations.

## Success Criteria

1. **Flawless State Continuation**: User-created lesson lists, marked boxes, or word lists must persist perfectly on hard browser refreshes.
2. **Accurate Voice Synthesis**: Speech audio pronunciations must trigger immediately when the audio button is tapped.
3. **Zero-Delay UI**: Flip animation, matching card flips, and layout screens should transition without layout shifts.
4. **Intuitive Form Control**: Course and lesson creation interfaces must remain structured, with validation disabling save buttons until basic values exist.
5. **Graceful Degradation**: If the developer's Gemini API Key is missing, AI buttons should disable/fade out elegantly instead of crashing the site.
