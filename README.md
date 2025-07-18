# Jeopardy Web App

An interactive web application for the game of Jeopardy that runs locally on your computer. Build custom game boards through a form or upload existing text files for quick setup.

## Gameplay Screenshots
![Jeopardy Game Board](screenshots/game-board-gameplay.png)

*Main game board with categories and point values*

![Question Modal](screenshots/game-board-question-modal.png)

*Question and answer screen with team selection and scoring controls*

## Getting Started

1. **Open the game**: 
    - Download the ZIP folder containing all files (green button at the top of this page)
    - Open `jeopardy.html` in a web browser (the default when double clicking any .html file)

    ![Main Screen](screenshots/main-page.png)

2. **Create new game, upload a draft in progress, or use an existing game board**:
   
   **Option A: Create new game**
   - Click 'Create Board Manually' on the home screen
   - Fill in the form with your game title, five categories, five questions/answers per category and teams
   - Save a draft at anytime by clicking 'Save Draft' to store it in your browser's storage - this allows you to resume where you left off if the page is accidentally closed

  ![Game Board Creation](screenshots/manual-game-creation.png)

   - If you're done editing for an extended period, click 'Download Game File' to save a backup to resume where you left off later
   - When complete, click either:
     - 'Create Game Board' to generate your game
     - 'Download Game File' to also save a copy for future use

  ![Game Board Complete Form](screenshots/manual-game-complete-form.png)

   **Option B: Upload a draft in progress**
   - Click 'Upload Draft File' on the home screen to use a partially created game board file

  ![Draft File Upload](screenshots/import-draft-file.png) 
    
   **Option C: Use an existing game board**
   - Click 'Upload Text File' and select your previously saved game file
   - Add teams
   - Click 'Continue to Game' and the board will be automatically created and displayed

  *To see a demo, upload the included `2000s-pop-culture.txt` file*

  ![Loading Game File](screenshots/loading-game-file.png)

3. **Play the game**: Click on values to reveal answers, show questions, and award points

![Jeopardy Game Board](screenshots/game-board-gameplay.png)

## Gameplay Features

- **Team Scoring System**: Add multiple teams, track and edit scores in real-time (score editing is automatically mapped to previous cell points)
- **Flexible Creation**: Build boards through forms or upload existing files
- **Optional Download**: Save boards as text files for future games
- **Persistent Storage**: Game state saves automatically between browser sessions
- **Form Validation**: Form validation ensures all required fields are completed before the game board can be created

## Technical Notes 

- **No server required**: Runs entirely in the browser
- **Modern browsers**: Uses ES6+ JavaScript features
- **File uploads**: Processes local text files with FileReader API
- **Responsive**: CSS Grid and Flexbox for layout
- **Modular**: Separated HTML/CSS/JS for maintainability

## Project Structure

### Core Files

- **`jeopardy.html`** - Main HTML structure with game board layout, scoring table, and modal elements
- **`css/jeopardy.css`** - Stylesheet with responsive design for desktop and mobile devices
- **`js/jeopardy.js`** - Game logic handling file uploads, board generation, team management, and persistent storage

## Exported Text File Breakdown

1. **Title Line** (optional): `Title: Your Game Title`
2. **Category Headers**: `Category: Category Name Here`
3. **Questions**: `POINTS|CLUE|RESPONSE`
   - Points: 100, 200, 300, 400, 500
   - Clue: The statement shown to players first
   - Response: The correct answer in question form
4. **Five Categories**: Each with exactly 5 questions (100-500 points)
5. **Blank Lines**: Ignored by the parser

### Example
```
Title: Early 2000s Pop Culture

Category: Blockbuster Movies
100|The 2000 film that won Best Picture and starred Russell Crowe as a Roman general turned slave.|What is Gladiator?
200|This fantasy trilogy began in 2001 and concluded in 2003 with The Return of the King.|What is The Lord of the Rings?
300|James Cameron directed this 2009 sci-fi epic, which became the highest-grossing film of the decade.|What is Avatar?
400|Heath Ledger posthumously won an Oscar for playing the Joker in this 2008 superhero film.|What is The Dark Knight?
500|This 2002 thriller, directed by Doug Liman and based on a Robert Ludlum novel, launched a successful action franchise starring Matt Damon as a trained assassin suffering from amnesia.|What is The Bourne Identity?
```

---

Copyright (c) 2025 Eric Jones

Licensed under the MIT License. See LICENSE.md for details.