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
Title: Technology Trivia

Category: Modern Tech
100|What is Face ID?|A facial recognition system for securely unlocking iPhones.
200|What is spatial audio in visionOS?|A technology that provides immersive 3D sound.
300|What is machine learning?|The field of AI that enables computers to learn from data.
400|What is quantum computing?|Computing using quantum bits that can exist in multiple states.
500|What is blockchain?|A distributed ledger technology behind cryptocurrencies.
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