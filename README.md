# Jeopardy Game

A web-based Jeopardy game for group presentations and interactive gameplay. Build custom game boards through an intuitive form interface or upload existing text files for quick setup.

## Screenshots
![Jeopardy Game Board](screenshots/game-board-early2000s.png)

*Main game board with categories and point values*

![Question Modal](screenshots/question-modal-early2000s.png)

*Question display with team selection and scoring controls*

## Project Structure

### Core Files

- **`jeopardy.html`** - Main HTML structure with game board layout, scoring table, and modal elements
- **`css/jeopardy.css`** - Stylesheet with responsive design and large fonts optimized for group presentations
- **`js/jeopardy.js`** - Game logic handling file uploads, board generation, team management, and persistent storage

### Sample Content

- **`jeopardy.txt`** - Example game file demonstrating the text format for creating custom Jeopardy boards

## Getting Started

1. **Open the game**: Download the ZIP folder containing all files, and open `jeopardy.html` in a web browser

    ![Upload Screen](screenshots/homepage.png)

2. **Create or use a game board**:
   
   **Option A: Create a new board**
   - Click "Create Board Manually" on the home screen
   - Fill in the form with your game title, five categories, and five questions/answers per category
   - When complete, click either:
     - "Create Game Board" to generate your game, or
     - "Create and Download" to also save a text file for future use

    ![Game Board Creation](screenshots/board-creation-early2000s.png)

   **Option B: Use an existing board**
   - Click "Upload Text File" and select your previously saved game file
   - The board will be automatically created and displayed

3. **Add teams**: Use the "Add Team" button to create participating teams

4. **Play the game**: Click on values to reveal answers, show questions, and award points

    ![Board Gameplay](screenshots/board-gameplay-early2000s.png)

## Exported Text File Breakdown

1. **Title Line** (optional): `Title: Your Game Title`
2. **Category Headers**: `Category: Category Name Here`
3. **Questions**: `POINTS|ANSWER|QUESTION`
   - Points: 100, 200, 300, 400, 500
   - Answer: The Jeopardy-style answer (what contestants say)
   - Question: The actual question being asked
4. **Five Categories**: Each with exactly 5 questions (100-500 points)
5. **Blank Lines**: Ignored by the parser

### Example
```
Title: Early 2000s Pop Culture

Category: Blockbuster Movies
100|What is Gladiator?|The 2000 film that won Best Picture and starred Russell Crowe as a Roman general turned slave.
200|What is The Lord of the Rings?|This fantasy trilogy began in 2001 and concluded in 2003 with The Return of the King.
300|What is Avatar?|James Cameron directed this 2009 sci-fi epic, which became the highest-grossing film of the decade.
400|What is The Dark Knight?|Heath Ledger posthumously won an Oscar for playing the Joker in this 2008 superhero film.
500|What is The Bourne Identity?|This 2002 thriller, directed by Doug Liman and based on a Robert Ludlum novel, launched a successful action franchise starring Matt Damon as a trained assassin suffering from amnesia.
```

## Gameplay Features

- **Team Scoring System**: Add multiple teams, track and edit scores in real-time
- **Flexible Creation**: Build boards through forms or upload existing files
- **Optional Download**: Save boards as text files for future games
- **Persistent Storage**: Game state saves automatically between browser sessions
- **Interactive Reveal**: Click values → show question → show answer → award points
- **Form Validation**: Real-time feedback ensures all required fields are completed
- **Responsive Design**: Works on desktop and mobile devices

## Data Persistence

The game automatically saves:
- Current game board content
- Team names and scores  
- Used/completed questions
- Game title

Data persists between browser sessions until manually reset by the `Reset Board` button or by clearing browser cache.

## Technical Notes

- **No server required**: Runs entirely in the browser
- **Modern browsers**: Uses ES6+ JavaScript features
- **File uploads**: Processes local text files with FileReader API
- **Responsive**: CSS Grid and Flexbox for layout
- **Modular**: Separated HTML/CSS/JS for maintainability

---

Copyright (c) 2025 Eric Jones

Licensed under the MIT License. See LICENSE.md for details.