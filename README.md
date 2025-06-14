# Jeopardy Game

A web-based Jeopardy game built for group presentations and interactive gameplay. Upload custom question sets with text files and manage team scoring in real-time.

## Screenshots
![Jeopardy Game Board](screenshots/game-board.png)

*Main game board with categories and point values*

![Question Modal](screenshots/question-modal.png)

*Question display with team selection and scoring controls*

## Project Structure

### Core Files

- **`jeopardy.html`** - Main HTML structure with game board layout, scoring table, and modal elements
- **`css/jeopardy.css`** - Stylesheet with responsive design
- **`js/jeopardy.js`** - Game logic handling file uploads, board generation, team management, and persistent storage

### Sample Content

- **`jeopardy.txt`** - Example game file demonstrating the text format for creating custom Jeopardy boards

## Getting Started

1. **Open the game**: Download the ZIP file from the green dropdown button at the top of the page, then open `jeopardy.html` in a web browser

    ![Upload Screen](screenshots/upload-screen.png)
2. **Upload content**: Click "Browse..." and select the `.txt` file (see below for how to customize)

    ![Game Board Loaded](screenshots/board-loaded.png)
3. **Add teams**: Use the "Add Team" button to create participating teams (you can do this before or after uploading the `.txt` file)
    
    ![Teams Added](screenshots/teams-added.png)
4. **Play**: Click question values to reveal questions, show answers, and award/subtract points

    ![Board Gameplay](screenshots/board-gameplay.png)

## Creating Custom Game Files

### File Format

Modify the existing plain text file (`.txt`) - with the following structure:

```
Title: Your Game Title Here

Category: First Category Name
100|What is the answer?|This is the question text
200|What is another answer?|This is a harder question
300|What is a third answer?|This is an even harder question
400|What is a fourth answer?|This is a difficult question
500|What is a fifth answer?|This is the hardest question

Category: Second Category Name
100|What is the answer?|This is the question text
200|What is another answer?|This is a harder question
300|What is a third answer?|This is an even harder question
400|What is a fourth answer?|This is a difficult question
500|What is a fifth answer?|This is the hardest question

Category: Third Category Name
...continue pattern...
```

### Format Rules

1. **Title Line** (optional): `Title: Your Game Title`
2. **Category Headers**: `Category: Category Name Here`
3. **Questions**: `POINTS|ANSWER|QUESTION`
   - Points: 100, 200, 300, 400, 500
   - Answer: The Jeopardy-style answer (what contestants say)
   - Question: The actual question being asked
4. **Five Categories**: Each with exactly 5 questions (100-500 points)
5. **Blank Lines**: Ignored by the parser

### Example Entry
```
Category: Technology
100|What is Face ID?|A facial recognition system for securely unlocking iPhones.
200|What is spatial audio in visionOS?|A technology that provides immersive 3D sound.
```

## Gameplay Features

- **Persistent Storage**: Game state saves automatically to browser localStorage
- **Team Management**: Add multiple teams, edit names, track scores
- **Question Reveal**: Click values → show question → show answer → award points
- **Score Tracking**: Add/subtract points with automatic calculation
- **Board Reset**: Clear all data and start fresh
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

**Created**: 2025-06-07

Copyright (c) 2025 Eric Jones
  
Licensed under the MIT License. See LICENSE.md for details.
