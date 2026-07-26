# Known Limitations

## Browser Download Permissions

Browsers may ask for permission before allowing downloads from the local page. This is expected.

The app uses an intermediate prompt before opening the answer key so the download permission dialog is less likely to be hidden behind the print dialog.

## PDF Folder Selection

The app cannot automatically save the game file and answer key PDF to the same user-selected folder.

Reason: browser security prevents a normal static web page from freely writing multiple files to arbitrary folders on the user's computer.

## Answer Key PDF Generation

The app uses the browser print dialog for answer key PDFs. It does not directly write a PDF file.

This is intentional. A direct JavaScript-generated PDF approach was tested, but the resulting PDF appeared blank in the user's actual PDF viewer.

## Default PDF Filename

The app temporarily changes the document title before printing so Safari can suggest a filename such as:

```text
Game Title - Answer Key.pdf
```

The browser controls the final save dialog. The app cannot guarantee the final filename in every browser.

## Local Storage Is Browser-Specific

Saved state is stored in the browser that opened the app. It does not sync across browsers or devices.

For reliable long-term storage, export a `.txt` draft or game file.

## Drafts Are Not Playable From The Play Flow

Draft files are intentionally rejected by `Play`. Use `Edit` to open drafts.

## Complete Games Require A 5 By 5 Board

The current app is built around exactly:

- 5 categories
- 5 point values per category
- 25 total clues

Changing the board size would require updates to form generation, validation, board generation, scoring assumptions, file validation, documentation, and screenshots.

## Plain Text Format Constraints

The file format uses pipe characters as separators:

```text
POINTS|CLUE|RESPONSE
```

Avoid pipe characters in clues and responses unless necessary. The parser handles extra pipes in responses better than extra pipes in clues.

## No Multi-User Synchronization

The app runs locally in one browser. It does not synchronize state between multiple devices, browsers, or players.

## No Built-In Timer

The app tracks board state and scores, but it does not include a gameplay timer.

## No Automated Test Suite

The project currently relies on manual browser testing. If the app grows, adding automated checks for parsing, validation, and export text generation would reduce regression risk.

