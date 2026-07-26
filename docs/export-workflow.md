# Export Workflow

## Overview

The export workflow is designed around two different needs:

- Save an incomplete editable draft.
- Save a complete game file and produce a facilitator answer key.

The app uses one export button whose label changes based on form completion.

## Form Completion State

The app checks whether the form has:

- A game title
- 5 categories
- A name for every category
- 5 clues per category
- A clue and response for every point value

When the form is incomplete:

- The action button says `Export Draft`.
- The helper text says `Save your progress as an editable draft.`
- The `Create` button is hidden.

When the form is complete:

- The `Create` button appears.
- The export button says `Export Game`.
- The helper text says `Save the game file, then print or save the answer key.`

## Export Draft

`Export Draft` creates a `.txt` draft file from the current form state.

The draft can include incomplete fields. It is meant for saving progress, not for direct play.

The default filename is based on the title:

```text
game-title-draft.txt
```

If the title is blank, the app uses:

```text
jeopardy-draft.txt
```

## Export Game

`Export Game` is available when the form is complete.

The flow is:

1. Build a complete game text file.
2. Download the game file as `.txt`.
3. Show an intermediate prompt.
4. Wait for the user to click `Open Answer Key`.
5. Open the browser print dialog for the answer key.

The intermediate prompt prevents the browser download permission dialog from being hidden behind the print dialog.

## Answer Key Printing

The app does not directly generate the final PDF file. Instead, it creates temporary answer key HTML and lets the browser print dialog produce the PDF.

This approach was chosen because direct in-browser PDF generation produced blank PDFs in the user's viewer during testing, while Safari's print dialog produced reliable output.

## Print Styling

The answer key is inserted into the page as:

```html
<section id="answer-key-print-area">
```

The app injects print-only CSS that:

- Sets the page to letter portrait.
- Uses a half-inch page margin.
- Hides the rest of the app during printing.
- Shows only the answer key print area.
- Prevents categories and clue rows from breaking awkwardly when possible.
- Uses simple row dividers.
- Removes the divider after the final clue in each category.

## Suggested PDF Filename

Before opening the print dialog, the app temporarily changes the browser document title to:

```text
Game Title - Answer Key
```

Safari often uses the document title as the suggested filename when saving a PDF from the print dialog. This is a browser behavior, not a guaranteed file-system API.

## Why The App Cannot Save Both Files To The Same Chosen Folder Automatically

Browser security prevents a normal web page from freely writing multiple files into a user-selected folder. A browser can trigger downloads, but it cannot reliably choose or remember the user's folder for a second file.

The app previously explored bundling files into a zip. That required generating the answer key PDF directly in JavaScript. Because that direct PDF appeared blank in the user's actual viewer, the app returned to the browser print dialog.

## Related Files

- `jeopardy.html`: action buttons and helper text.
- `js/jeopardy.js`: form state, draft export, game export, answer key HTML, and print flow.
- `css/jeopardy.css`: visible app styling for the form actions.

