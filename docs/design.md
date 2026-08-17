# NexusEd Design System

NexusEd aims to provide a premium, modern, and highly engaging user experience. Since it is an AI-Powered, Event-Driven E-Learning Platform, the design heavily leans into a high-tech "SaaS" aesthetic while maintaining the accessibility and visual richness of top consumer platforms.

## Core Aesthetic: The "Modern AI SaaS"
*Inspired by: **Linear.app** and **Vercel***

The foundational layer of NexusEd is built on a dark-mode first, high-contrast, and deeply immersive aesthetic.

* **Color Palette:** 
  * Deep, true blacks and dark grays for backgrounds (e.g., `#000000`, `#0A0A0A`).
  * High-contrast white (`#EDEDED` to `#FFFFFF`) for primary typography.
  * Subtle, glowing accent colors (e.g., Neon Blue, Purple, or Emerald Green) to signify AI interactions and primary actions.
* **Typography:**
  * Clean, geometric sans-serif fonts (e.g., *Inter*, *Geist*, or *Roboto*).
  * Highly structured hierarchy with distinct tracking (letter-spacing) on smaller uppercase labels.
* **Components:**
  * Use of glassmorphism (translucent backgrounds with background-blur) for sticky headers and modals.
  * Very subtle 1px borders (`rgba(255, 255, 255, 0.1)`) to separate sections instead of heavy drop shadows.

## Course Browsing & Discovery
*Inspired by: **Airbnb***

When students are browsing for courses, the UI needs to be visually striking and easy to scan.

* **Layout:**
  * Edge-to-edge image thumbnails in a responsive grid.
  * Clean, rounded corners on cards (e.g., `border-radius: 12px` or `16px`).
* **Interactions:**
  * Smooth scale-up micro-animations on hover (`transform: scale(1.02)`).
  * Hovering over a course thumbnail reveals subtle overlay actions (like "Bookmark" or a quick preview video).

## The Learning Experience (Course Viewer)
*Inspired by: **Spotify** (Media) and **Notion** (Content)*

Once a student enters a course, distractions must be minimized. The focus shifts entirely to the content.

* **Media Consumption (Spotify-like):**
  * The video player takes center stage, surrounded by deep dark UI to prevent eye strain.
  * Current progress and modules are displayed in a clean, scrollable sidebar tracklist.
* **Text & Resources (Notion-like):**
  * For reading assignments, quizzes, and documentation, the UI transitions to a highly readable, document-centric layout.
  * Monospaced blocks for code snippets, clear blockquotes for key takeaways, and minimal side margins to keep the reading width optimal (around 65-75 characters wide).

## Implementation Strategy
When building the Next.js frontend, we will:
1. Initialize a global `app/globals.css` that sets up the dark mode variables.
2. Build reusable foundational components (Buttons, Inputs, Cards) adhering strictly to the Linear/Vercel styling.
3. Construct the Course Grid utilizing the Airbnb spacing principles.
4. Build the immersive Course Player leveraging the Spotify layout structure.
