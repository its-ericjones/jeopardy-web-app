# Maintenance Guide

## Purpose

Use this guide when changing the app, updating screenshots, preparing a release, or checking that the game creation and export flows still work.

## Project Structure

```text
.
├── README.md
├── jeopardy.html
├── css/
│   └── jeopardy.css
├── js/
│   └── jeopardy.js
├── screenshots/
├── docs/
└── 2000s-pop-culture.txt
```

## Change Safety Checklist

Before changing behavior, identify which workflow is affected:

- Create a new game
- Export a draft
- Export a complete game
- Print or save an answer key
- Edit an existing draft
- Play from a complete game file
- Score a game
- Reset a game

After changing behavior, test the matching workflow end to end.

## Manual Test Checklist

### Create Form

- Open `jeopardy.html`.
- Click `Create`.
- Confirm the form creates 5 categories.
- Confirm each category has point values 100 through 500.
- Confirm `Export Draft` appears while the form is incomplete.
- Fill all fields.
- Confirm `Create` appears.
- Confirm `Export Draft` changes to `Export Game`.

### Draft Export And Edit

- Fill part of the form.
- Click `Export Draft`.
- Confirm a `-draft.txt` file downloads.
- Click `Edit`.
- Select the draft file.
- Confirm the form restores the entered content.

### Game Export And Answer Key

- Complete the form.
- Click `Export Game`.
- Confirm a `.txt` game file downloads.
- Confirm the intermediate prompt appears.
- Click `Open Answer Key`.
- Confirm the browser print dialog opens.
- Save as PDF.
- Confirm the PDF is not blank.
- Confirm point values do not include dollar signs.
- Confirm the final clue in each category does not have an extra divider below it.

### Play Flow

- Click `Play`.
- Select a complete game file.
- Add teams.
- Click `Continue to Game`.
- Confirm the board appears.
- Click a point value.
- Confirm the clue modal appears.
- Click `Show Answer`.
- Award or subtract points.
- Confirm the score changes.
- Confirm the cell is marked as used.

### Reset Flow

- Load or create a game.
- Click `Reset Board`.
- Confirm the app returns to the starting state.
- Refresh the page.
- Confirm the old board does not return.

## Screenshot Maintenance

README screenshots should match the current user-facing workflow.

Update these screenshots after the export workflow change:

- `screenshots/updated-game-complete-form.png`: should show `Create`, `Export Game`, and helper text.
- `screenshots/updated-manual-game-creation.png`: should show the partial form state with `Export Draft` and helper text if the README uses it to explain draft export.

Optional screenshot:

- A prompt screenshot after clicking `Export Game`, showing the `Open Answer Key` step.

These screenshots do not need updates unless their screens change:

- `screenshots/updated-main-page.png`
- `screenshots/updated-import-draft-file.png`
- `screenshots/updated-loading-game-file.png`
- `screenshots/game-board-gameplay.png`
- `screenshots/game-board-question-modal.png`

## Documentation Maintenance

When behavior changes:

1. Update the README if the quick-start flow changes.
2. Update the relevant file in `docs/`.
3. Update screenshots if visible labels, layouts, or workflows changed.
4. Add a short note to the change summary if one is being maintained.

## Code Areas To Watch

### `jeopardy.html`

Change this when adding or removing structural UI elements, buttons, modals, or page sections.

### `css/jeopardy.css`

Change this when adjusting layout, visible app styling, responsive behavior, or button presentation.

### `js/jeopardy.js`

Change this when adjusting:

- File import
- File validation
- Form generation
- Form completion state
- Draft export
- Game export
- Answer key printing
- Gameplay
- Scoring
- Local storage
- Dialog behavior

## Browser-Specific Checks

Always test answer key export in Safari if changing print behavior. Safari's download and print dialogs were central to the current export design.

Also test in at least one Chromium-based browser when possible, because download permission and print dialog behavior can differ.

## Suggested Release Notes Format

Use a short, user-facing summary:

```text
Changed
- Updated the create form workflow so incomplete games export as drafts and complete games export as playable game files.
- Added a print-dialog answer key flow for facilitators.

Fixed
- Avoided blank generated answer key PDFs by returning to browser-managed PDF printing.
```

## Commit Message Style

Use concise, imperative commit messages:

```text
Update export workflow documentation
Document answer key print behavior
Refresh README screenshot guidance
```

