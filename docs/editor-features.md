# Sermon Editor — Technical Features

Open Sermon's editor is built on **TipTap 2.x**, customized for the specific needs of sermon preparation.

## Block-Based Content

Content is modeled as a set of semantic blocks:
- **Heading**: H1 to H3.
- **Normal Text**: Standard paragraph.
- **Bible Verse**: Specialized block with reference, version, and text.
- **Illustration**: Contextual note for storytelling.
- **Application**: Practical takeaways for the congregation.
- **Key Point**: Enumerated sermon points.
- **Intro / Conclusion**: Dedicated bookends for the sermon structure.
- **Callout**: Notion-style highlight box for important notes.

## Notion-Style Interactions

### 1. Slash Command Menu (`components/editor/block-menu.tsx`)
- Trigger: Pressing `/` at the start of an empty line.
- Content: Lists all available block types with icons and descriptions.
- Navigation: Fully keyboard-accessible (arrows + enter).
- i18n: Menu items and descriptions are translated via `next-intl`.

### 2. Drag and Drop Handle
- Custom TipTap extension for block dragging.
- Handle appears only on hover or selection (on desktop).
- Positioned to the right of the editor canvas to maintain a clean writing flow.

### 3. Block Selection & Multi-Delete
- Click checkboxes (or long-press on mobile) to select multiple blocks.
- Floating toolbar appears when blocks are selected.
- Quick actions: **Delete** all selected blocks.

## Mobile Responsiveness
- **Checkboxes**: Hidden on mobile to maximize horizontal space.
- **Long-Press**: Triggers multi-selection on touch devices.
- **Native Context Menus**: Minimized to allow the editor's custom tools to shine.

## Data Persistence
- **Autosave**: Changes are pushed to Supabase when the user stops typing (using `useSermon` hook).
- **Optimistic UI**: React-Query updates the local cache immediately while the background save is in progress.
- **Server Actions**: `lib/sermon-actions.ts` handles the heavy lifting of updating the database JSONB columns.

## Bible Integration
- Real-time searching of verses via `app/api/bible/route.ts`.
- Integrated `VerseBlock` component that renders the text with proper attribution.
- Intelligent caching (Redis/React-Query) for rapid performance.
