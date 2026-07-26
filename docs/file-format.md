# File Format Reference

## Overview

The app stores game content in plain text files. This makes games easy to save, share, inspect, and edit without a database.

There are two practical file types:

- Draft files
- Complete game files

Both use `.txt`.

## Complete Game File

A complete game file is used by the `Play` flow. It should start with a title, then include exactly 5 categories with exactly 5 clues each.

### Structure

```text
Title: Game Title

Category: Category Name
100|Clue text|Correct response
200|Clue text|Correct response
300|Clue text|Correct response
400|Clue text|Correct response
500|Clue text|Correct response
```

Repeat the category block 5 times.

### Required Rules

- The first line should start with `Title:`.
- Each category line should start with `Category:`.
- Each clue line should start with a point value followed by `|`.
- Each clue line needs 3 parts:
  - Point value
  - Clue
  - Correct response
- A complete playable file needs 5 categories.
- Each category needs 5 completed clue lines.

## Draft File

A draft file is used by the `Edit` flow. It can be incomplete.

Draft files exported by the app start with:

```text
[JEOPARDY DRAFT]
```

### Structure

```text
[JEOPARDY DRAFT]
Title: Game Title
Created: 2026-07-25T12:00:00.000Z
Teams: Team 1, Team 2

Category: Category Name
100|Clue text|Correct response
200||
300||
400||
500||
```

Draft files may contain blank fields. The app can reload them into the edit form.

## Field Definitions

### `Title:`

The title is the game name. It is shown at the top of the playable board and used when generating default export names.

Example:

```text
Title: 2000s Pop Culture
```

### `Category:`

The category name shown across the top of the board.

Example:

```text
Category: Blockbuster Movies
```

### Clue Line

The clue line uses pipe separators:

```text
POINTS|CLUE|RESPONSE
```

Example:

```text
100|The 2000 film that won Best Picture and starred Russell Crowe as a Roman general turned slave.|What is Gladiator?
```

## Pipe Characters In Responses

The parser splits clue lines on `|`.

The first part is the point value. The second part is the clue. Any remaining parts are joined back into the response. This means a response can contain a pipe character more safely than a clue can.

Best practice: avoid using `|` in clues and responses unless necessary.

## Blank Lines

Blank lines are ignored by the parser. They are useful for making files easier to read.

## Metadata Lines

The parser ignores these draft metadata lines when building boards or answer keys:

- `[JEOPARDY DRAFT]`
- `Created:`
- `Teams:`

## Validation Behavior

The `Play` flow is strict:

- Draft files are rejected.
- Files without a `Title:` first line are rejected.
- Incomplete files are rejected.

The `Edit` flow is permissive:

- Draft files are accepted.
- Complete game files are accepted.
- Incomplete game-like files are accepted as editable drafts.

## Example Complete File

```text
Title: Early 2000s Pop Culture

Category: Blockbuster Movies
100|The 2000 film that won Best Picture and starred Russell Crowe as a Roman general turned slave.|What is Gladiator?
200|This fantasy trilogy began in 2001 and concluded in 2003 with The Return of the King.|What is The Lord of the Rings?
300|James Cameron directed this 2009 sci-fi epic, which became the highest-grossing film of the decade.|What is Avatar?
400|Heath Ledger posthumously won an Oscar for playing the Joker in this 2008 superhero film.|What is The Dark Knight?
500|This 2002 thriller, directed by Doug Liman and based on a Robert Ludlum novel, launched an action franchise starring Matt Damon.|What is The Bourne Identity?
```

