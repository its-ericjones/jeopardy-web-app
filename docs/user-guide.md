# User Guide

## Overview

The Jeopardy web app lets you build, edit, export, and play a local 5 by 5 Jeopardy-style game board. It runs entirely in the browser. There is no account, server, database, or install step beyond opening `jeopardy.html`.

The app supports three main starting paths:

- `Create`: Build a new game from a blank form.
- `Edit`: Open a draft or complete game file for editing.
- `Play`: Open a complete game file and start the board.

## Requirements

- A modern desktop browser.
- Local access to the project folder.
- A `.txt` game file if you want to use `Edit` or `Play`.

Safari is supported and is currently the preferred browser for saving the answer key as a PDF because the app uses the browser print dialog.

## Open The App

1. Open the project folder.
2. Open `jeopardy.html` in your browser.
3. Choose `Create`, `Edit`, or `Play`.

No local server is required for normal use.

## Create A New Game

1. Click `Create`.
2. Enter a game title.
3. Fill in 5 categories.
4. Fill in 5 clues and 5 correct responses for each category.
5. Add one or more teams.

Each category has these point values:

- `100`
- `200`
- `300`
- `400`
- `500`

The clue is what players see first. The response is the correct answer shown after clicking `Show Answer`.

## Create A Game With An LLM

You can use [Game Board Generation Prompt.md](<../Game Board Generation Prompt.md>) with an LLM to draft a complete game from uploaded source material.

The basic workflow is:

1. Upload [Game Board Generation Prompt.md](<../Game Board Generation Prompt.md>) to the LLM.
2. Upload the source files the game should be based on.
3. Ask the LLM to use the prompt file as instructions and the other files as sources.
4. Save the generated output as a `.txt` file.
5. Open it with `Edit` in the Jeopardy app.
6. Review and correct the board before using `Export Game` or `Play`.

See [LLM-Assisted Game Generation](llm-assisted-generation.md) for the full workflow.

## Save An Incomplete Draft

While the form is partially complete, the export button says `Export Draft`.

Use `Export Draft` when:

- You are still writing the game.
- You want to move the draft to another computer.
- You want a backup copy outside the browser.

The exported draft file is a `.txt` file. It starts with `[JEOPARDY DRAFT]` and can be opened later with `Edit`.

## Finish And Export A Complete Game

When the form is complete:

- The `Create` button appears.
- `Export Draft` changes to `Export Game`.

Use `Export Game` when you want to save the finished `.txt` game file and then open the printable answer key.

The complete export flow is:

1. Click `Export Game`.
2. Allow the browser download if prompted.
3. Click `Open Answer Key`.
4. Use the browser print dialog to print the answer key or save it as a PDF.

## Start The Playable Board

Click `Create` when the form is complete and you are ready to start the game in the browser.

The app shows a confirmation first because starting the game hides the editor. If you want a reusable game file and answer key, use `Export Game` before continuing.

## Edit A Draft Or Game File

1. Click `Edit`.
2. Choose a draft or complete `.txt` game file.
3. The app fills the create form with the file content.
4. Continue editing.
5. Use `Export Draft` or `Export Game` depending on whether the form is complete.

`Edit` is the right path for incomplete files, draft files, and complete files that need changes.

## Play From An Existing Game File

1. Click `Play`.
2. Choose a complete `.txt` game file.
3. Add teams.
4. Click `Continue to Game`.

The `Play` path expects a complete game file with a title, 5 categories, and 5 clues per category. If the file is incomplete, use `Edit` instead.

## During Gameplay

1. Click a point value on the board.
2. Read the clue to the players.
3. Click `Show Answer` when ready.
4. Choose the team from the dropdown.
5. Click `Add Points` or `Subtract Points`.

After points are awarded or subtracted, the selected board cell is marked as used.

## Scores

The score table appears when a game board is loaded. Scores are saved in the browser during the session. Team names can be edited directly in the score table.

## Reset The Board

Use `Reset Board` to clear the current game state and return to the starting screen.

Resetting clears stored game state in the browser, including:

- Current board
- Used cells
- Teams and scores
- Saved form draft
- Saved title
