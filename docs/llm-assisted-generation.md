# LLM-Assisted Game Generation

## Overview

The app supports manual game creation, but you can also use an LLM to draft a complete game board from source material.

This workflow is useful when you already have reference material, training notes, product documentation, study guides, or other text that you want to turn into a Jeopardy-style game.

The project includes a reusable prompt file:

[Game Board Generation Prompt.md](<../Game Board Generation Prompt.md>)

That prompt tells the LLM how to write categories, clues, responses, point values, and output formatting so the result can be used by the Jeopardy app.

## When To Use This Workflow

Use LLM-assisted generation when:

- You have source material but do not want to write every clue manually.
- You want a first draft that can be reviewed and edited in the app.
- You need a game board for training, review, onboarding, or study.
- You want the output to match the app's plain text game file format.

Use manual creation when:

- You already know every category, clue, and response.
- You want full control over wording from the start.
- The topic requires careful human judgment and you do not want generated draft content.

## What To Upload To The LLM

Upload:

- [Game Board Generation Prompt.md](<../Game Board Generation Prompt.md>)
- Any source files the game should be based on

Source files might include:

- Product notes
- Training documents
- Study guides
- Policy summaries
- Event notes
- Lesson material

The LLM should use the source files as the factual basis for the game.

## Prompt To Use

After uploading the prompt file and source files, use this message:

```text
Using "Game Board Generation Prompt.md" as your instructions, use the additional uploaded text files as your sources.
```

The LLM should return only the game board text, with no extra explanation.

## Expected Output

The output should look like this:

```text
Title: Example Training Game

Category: Category Name
100|Clue text|What is the response?
200|Clue text|What is the response?
300|Clue text|What is the response?
400|Clue text|What is the response?
500|Clue text|What is the response?
```

A complete playable file needs:

- One `Title:` line
- 5 categories
- 5 clues per category
- Point values `100`, `200`, `300`, `400`, and `500`
- A clue and response on every clue line
- Pipe separators between point value, clue, and response

## Save The Generated Board

1. Copy the LLM's generated game board text.
2. Save it as a plain text `.txt` file.
3. Open the Jeopardy app.
4. Click `Edit`.
5. Select the generated `.txt` file.
6. Review every category, clue, and response.
7. Make corrections in the form if needed.
8. Use `Export Game` when the board is ready.

Reviewing the generated board in `Edit` is recommended even if the file looks complete. It gives you a chance to catch formatting issues, wording problems, or source material mistakes before running the game.

## Play The Generated Board

After reviewing the generated board:

1. Click `Export Game` to save a clean complete game file.
2. Save or print the facilitator answer key when prompted.
3. Use `Play` to load the complete game file for a session.

If the app rejects the file in `Play`, open it with `Edit` first. The generated file may be missing a required field or may contain formatting that needs cleanup.

## Accuracy Guidance

Generated clues should always be checked by a person before use.

Review for:

- Factual accuracy
- Clarity
- Appropriate difficulty
- Duplicate clues
- Responses that begin with `What is` or `What are`
- Categories with exactly 5 clues
- Clues based only on the uploaded sources

## Adapting The Prompt

The included prompt is currently tuned for retail product training. You can edit a copy of the prompt for other topics by changing the role, writing style, or topic guidance while keeping the output format rules intact.

Keep these rules stable:

- Include a single `Title:` line at the top.
- Use `Category:` for category headings.
- Use `POINTS|CLUE|RESPONSE` for clue lines.
- Do not add extra commentary.
- Keep 5 categories and 5 clues per category for complete playable games.
