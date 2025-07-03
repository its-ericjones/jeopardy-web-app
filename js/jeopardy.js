/* ────────────────────────────────────────────────────────────────
  Jeopardy — game logic
  Created:  2025-06-07

  Copyright (c) 2025 Eric Jones
  Licensed under the MIT License. See LICENSE.md for details.

  Purpose:  Builds a 5×5 Jeopardy board from a plain-text file, 
            handles scoring, and persists state in localStorage.
──────────────────────────────────────────────────────────────── */

// Hide stats table and clear board title immediately when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    setStatsVisibility(false);
    clearBoardTitle();
    
    // Check if there's a draft but no active game loaded
    const savedDraft = storage.load('jeopardyFormDraft');
    const savedBoard = loadBoardText();
    
    if (savedDraft && !savedBoard) {
        // Suggest opening the form to continue working on the draft
        const notificationDiv = document.createElement('div');
        notificationDiv.id = 'draft-notification';
        notificationDiv.className = 'draft-notification';
        notificationDiv.innerHTML = `
            <div>You have an unsaved game board draft. 
            <button id="continue-draft-btn">Continue Editing</button>
            <button id="close-notification-btn" class="close-btn">&times;</button></div>
        `;
        document.body.insertBefore(notificationDiv, document.body.firstChild);
        
        // Set up click handler for the continue button
        document.getElementById('continue-draft-btn').addEventListener('click', function() {
            showCreateFormBtn.click();
            notificationDiv.remove();
        });
        
        // Set up click handler for the close button
        document.getElementById('close-notification-btn').addEventListener('click', function() {
            notificationDiv.remove();
        });
    }
});

// --- Utility Functions ---
// Generic localStorage helper
const storage = {
    save: (key, data) => localStorage.setItem(key, JSON.stringify(data)),
    load: (key, defaultValue = null) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
    },
    remove: (key) => localStorage.removeItem(key),
    clear: (...keys) => keys.forEach(key => localStorage.removeItem(key))
};

// Utility function to manage stats table visibility
function setStatsVisibility(visible) {
    const statsElement = document.getElementById('stats');
    if (statsElement) {
        statsElement.style.display = visible ? 'block' : 'none';
    }
}

// Board iteration helper
function forEachBoardCell(callback) {
    for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
        const cell = document.getElementById(`tq${row}${col}`);
        if (cell) callback(cell, row, col);
    }
    }
}

// --- Persistent Storage Helpers ---
function saveBoardState() {
    const used = [];
    forEachBoardCell((cell) => {
    if (cell.classList.contains('used')) {
        used.push(cell.id);
    }
    });
    storage.save('jeopardyUsedCells', used);
}

function loadBoardState() {
    const used = storage.load('jeopardyUsedCells', []);
    used.forEach(id => {
    const cell = document.getElementById(id);
    if (cell) cell.classList.add('used');
    });
}

function saveTeams() {
    storage.save('jeopardyTeams', teams);
}

function loadTeams() {
    teams = storage.load('jeopardyTeams', []);
    renderStats();
}

function saveBoardText(text) {
    storage.save('jeopardyBoard', text);
}

function loadBoardText() {
    return storage.load('jeopardyBoard');
}

function saveTitle(title) {
    storage.save('jeopardyTitle', title);
}

function loadTitle() {
    return storage.load('jeopardyTitle', '');
}

function clearAllStorage() {
    storage.clear('jeopardyBoard', 'jeopardyUsedCells', 'jeopardyTeams', 'jeopardyTitle');
}

// Clear the board title both in the UI and storage
function clearBoardTitle() {
    const boardTitleInput = document.getElementById('board-title');
    if (boardTitleInput && boardTitleInput.value) {
        console.log('Clearing board title value:', boardTitleInput.value);
        boardTitleInput.value = '';
    }
    saveTitle(''); // Also clear from storage
}

// Try to grab a Title: ... line from the uploaded file
function parseTitleFromText(text) {
    const match = text.match(/^[\s\t]*title\s*:(.*)$/im);
    return match ? match[1].trim() : '';
}

// --- File upload and board population ---
// When a file is uploaded, read it and fill the board
document.getElementById('jeopardy-upload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
    // Parse title from file if present
    const fileText = evt.target.result;
    const parsedTitle = parseTitleFromText(fileText);
    const title = parsedTitle;
    saveTitle(title);
    saveBoardText(fileText);
    
    // Hide the create form if it's visible
    createFormDiv.classList.add('hide');
    
    // Instead of immediately showing the board, show team setup first
    document.getElementById('file-teams-setup').classList.remove('hide');
    
    // Save the file text for later use when continuing to the game
    window.uploadedFileText = fileText;
    };
    reader.readAsText(file);
});

// Parse the uploaded text file and fill the board with categories, questions, and answers
function populateJeopardyBoardFromText(text) {
    // Generate the board structure first
    generateGameBoard();
    
    const lines = text.split(/\r?\n/);
    let categories = [];
    let questions = [];
    let currentCategory = null;
    let currentQuestions = [];
    for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    // Detect new category
    if (line.toLowerCase().startsWith('category:')) {
        if (currentCategory) {
        categories.push(currentCategory);
        questions.push(currentQuestions);
        }
        currentCategory = line.substring(9).trim();
        currentQuestions = [];
    } else if (/^\d+\|/.test(line)) {
        // Parse value|clue|response line
        const parts = line.split('|');
        if (parts.length >= 3) {
        currentQuestions.push({
            value: parts[0].trim(),
            // File format is: value|clue|response
            // - question: the clue shown first to players
            // - answer: the correct response revealed with "Show Answer" (in question form)
            question: parts[1].trim(), // This is shown first (Jeopardy clue)
            answer: parts.slice(2).join('|').trim() // This is shown after "Show Answer"
        });
        }
    }
    }
    // Push last category/questions
    if (currentCategory) {
    categories.push(currentCategory);
    questions.push(currentQuestions);
    }
    // Populate category headers
    const ths = document.querySelectorAll('#game thead th');
    ths.forEach((th, i) => {
    if (categories[i]) th.textContent = categories[i];
    });
    // Populate each cell with value, question, and answer
    for (let col = 0; col < questions.length; col++) {
    for (let row = 0; row < questions[col].length; row++) {
        const q = questions[col][row];
        const cellId = `tq${row}${col}`;
        const qId = `q${row}${col}`;
        const aId = `aq${row}${col}`;
        const cell = document.getElementById(cellId);
        if (cell) {
        cell.querySelector('h3').textContent = q.value;
        cell.querySelector(`#${qId}`).textContent = q.question;
        cell.querySelector(`#${aId}`).textContent = q.answer;
        }
    }
    }
    document.getElementById('game').classList.remove('hide');
    addCellClickHandlers();
    document.getElementById('upload-controls').style.display = 'none';
    // Show the stats table when board is displayed
    setStatsVisibility(true);
    // Always show reset button container after board is loaded
    const resetContainer = document.getElementById('reset-board-container');
    if (resetContainer) resetContainer.style.display = 'block';
}

// Generate the game board HTML structure
function generateGameBoard() {
    const gameBody = document.getElementById('game-body');
    gameBody.innerHTML = '';
    
    for (let row = 0; row < 5; row++) {
    const tr = document.createElement('tr');
    for (let col = 0; col < 5; col++) {
        const value = (row + 1) * 100;
        const td = document.createElement('td');
        td.id = `tq${row}${col}`;
        td.innerHTML = `
        <h3>${value}</h3>
        <div class="hide">
            <div id="q${row}${col}"></div>
            <div id="aq${row}${col}"></div>
        </div>
        `;
        tr.appendChild(td);
    }
    gameBody.appendChild(tr);
    }
}

// On page load, try to restore from localStorage if possible
document.addEventListener('DOMContentLoaded', function() {
    // Ensure stats is hidden by default (only show when board is loaded)
    setStatsVisibility(false);
    
    const saved = loadBoardText();
    // Restore title
    let savedTitle = loadTitle();
    // If no savedTitle, try to parse from saved board text
    if (!savedTitle && saved) {
    savedTitle = parseTitleFromText(saved);
    if (savedTitle) saveTitle(savedTitle);
    }
    const titleElem = document.getElementById('title');
    if (savedTitle) {
    titleElem.textContent = savedTitle;
    titleElem.style.display = 'block';
    } else {
    titleElem.style.display = 'none';
    }
    if (saved) {
    populateJeopardyBoardFromText(saved);
    loadBoardState();
    // Always show reset button container after board is loaded
    const resetContainer = document.getElementById('reset-board-container');
    if (resetContainer) resetContainer.style.display = 'block';
    // Hide initial controls since we're loading from storage
    document.getElementById('upload-controls').style.display = 'none';
    // Show stats table when a saved board is loaded
    setStatsVisibility(true);
    } else {
    // Generate empty board structure even if no saved data
    generateGameBoard();
    // Initially only show the option buttons, not the create form
    createFormDiv.classList.add('hide');
    }
    loadTeams();
});

// Load saved teams or set up an empty array
let fileTeams = []; // Teams for the file upload flow

// --- Scoring Implementation ---
const stats = document.getElementById('stats');
const statsBody = document.getElementById('stats-body');

// Hide stats table initially (if no board is loaded)
if (document.getElementById('game').classList.contains('hide')) {
    setStatsVisibility(false);
}

// Add Team button removed from scoring table
let teams = [];

// Helper function to modify team score
function modifyTeamScore(teamIndex, points) {
    teams[teamIndex].score += points;
    renderStats();
}

// Render the team stats table
function renderStats() {
    statsBody.innerHTML = '';
    teams.forEach((team, idx) => {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="text" value="${team.name}" class="team-name" data-idx="${idx}" style="width:100px;text-align:center;"></td>
        <td><span id="score-${idx}">${team.score}</span></td>
        <td><button class="add-points" data-idx="${idx}">+</button></td>
        <td><button class="subtract-points" data-idx="${idx}">-</button></td>
    `;
    statsBody.appendChild(row);
    });
    updatePromptTeamSelect();
    saveTeams();
}

// Add a new team (default name if not provided)
function addTeam(name = `Team ${teams.length + 1}`) {
    teams.push({ name, score: 0 });
    renderStats();
}

// Add team button handler removed from scoring table

// Handle add/subtract points button clicks in stats table
statsBody.onclick = function(e) {
    const idx = +e.target.getAttribute('data-idx');
    const pointValue = getCurrentCellValue();
    
    if (e.target.classList.contains('add-points')) {
    modifyTeamScore(idx, pointValue);
    } else if (e.target.classList.contains('subtract-points')) {
    modifyTeamScore(idx, -pointValue);
    }
};

// Handle team name edits
statsBody.oninput = function(e) {
    if (e.target.classList.contains('team-name')) {
    const idx = +e.target.getAttribute('data-idx');
    teams[idx].name = e.target.value;
    saveTeams();
    }
};

let lastCellValue = 0;
// Get the value of the last clicked cell (for scoring)
function getCurrentCellValue() {
    return lastCellValue;
}

// Add click handlers to all board cells
function addCellClickHandlers() {
    forEachBoardCell((cell, row, col) => {
    cell.onclick = function() {
        lastCellValue = parseInt(cell.querySelector('h3').textContent, 10) || 0;
        showPrompt(row, col, cell);
    };
    });
}

// --- Prompt Team Selector and Scoring ---
// Update the team selector dropdown in the prompt modal
function updatePromptTeamSelect() {
    const select = document.getElementById('prompt-team-select');
    select.innerHTML = '';
    teams.forEach((team, idx) => {
    const option = document.createElement('option');
    option.value = idx;
    option.textContent = team.name;
    select.appendChild(option);
    });
}

// Update team selector whenever teams change
renderStats = function() {
    statsBody.innerHTML = '';
    teams.forEach((team, idx) => {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="text" value="${team.name}" class="team-name" data-idx="${idx}" style="width:100px;text-align:center;"></td>
        <td><span id="score-${idx}">${team.score}</span></td>
        <td><button class="add-points" data-idx="${idx}">+</button></td>
        <td><button class="subtract-points" data-idx="${idx}">-</button></td>
    `;
    statsBody.appendChild(row);
    });
    updatePromptTeamSelect();
    saveTeams();
};

// Helper to handle scoring from prompt modal
function handlePromptScoring(isAdd) {
    const idx = +document.getElementById('prompt-team-select').value;
    const points = isAdd ? getCurrentCellValue() : -getCurrentCellValue();
    modifyTeamScore(idx, points);
    closePromptAndFadeCell();
}

// Add points to selected team from prompt modal
const promptAddBtn = document.getElementById('prompt-add-points');
promptAddBtn.onclick = () => handlePromptScoring(true);

// Subtract points from selected team from prompt modal
const promptSubBtn = document.getElementById('prompt-subtract-points');
promptSubBtn.onclick = () => handlePromptScoring(false);
// Cancel button in prompt modal (do not fade cell)
const promptCancelBtn = document.getElementById('prompt-cancel');
promptCancelBtn.onclick = function() {
    document.getElementById('prompt').style.display = 'none';
    showPrompt.lastCell = null;
};
// Fade out cell and close prompt after scoring
function closePromptAndFadeCell() {
    document.getElementById('prompt').style.display = 'none';
    if (showPrompt.lastCell) {
    showPrompt.lastCell.classList.add('used');
    saveBoardState();
    showPrompt.lastCell = null;
    }
}
// Show the prompt modal for a cell (with question/answer)
function showPrompt(row, col, cellRef) {
    const q = document.getElementById(`q${row}${col}`).textContent;
    const a = document.getElementById(`aq${row}${col}`).textContent;
    document.getElementById('prompt-question').textContent = q;
    document.getElementById('prompt-answer').textContent = a;
    document.getElementById('prompt-answer').style.display = 'none';
    document.getElementById('prompt').style.display = 'flex';
    // Store the cell to fade out after closing
    showPrompt.lastCell = cellRef || document.getElementById(`tq${row}${col}`);
    updatePromptTeamSelect();
}
// Show the answer in the prompt modal
document.getElementById('show-answer').onclick = function() {
    document.getElementById('prompt-answer').style.display = 'block';
};

// On reset, clear all storage and reload the page
document.getElementById('reset-board').onclick = function() {
    document.getElementById('upload-controls').style.display = '';
    // Hide create form and team setup
    createFormDiv.classList.add('hide');
    document.getElementById('file-teams-setup').classList.add('hide');
    
    const resetContainer = document.getElementById('reset-board-container');
    if (resetContainer) resetContainer.style.display = 'none';
    
    // Hide stats table on reset
    setStatsVisibility(false);
    
    // Remove the title from localStorage so it doesn't reappear after reload
    localStorage.removeItem('jeopardyTitle');
    document.getElementById('title').style.display = 'none';
    clearAllStorage();
    
    // Clear any existing categories in the form
    categoriesContainer.innerHTML = '';
    
    location.reload();
};

// File teams functionality
document.getElementById('file-add-team').addEventListener('click', function() {
    const teamName = `Team ${fileTeams.length + 1}`;
    fileTeams.push({ name: teamName, score: 0 });
    renderFileTeams();
});

// Render the teams in the file teams container
function renderFileTeams() {
    const container = document.getElementById('file-teams-container');
    container.innerHTML = '';
    
    fileTeams.forEach((team, index) => {
        const teamDiv = document.createElement('div');
        teamDiv.className = 'team-entry';
        
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = team.name;
        nameInput.placeholder = 'Team Name';
        nameInput.addEventListener('change', function() {
            fileTeams[index].name = this.value;
        });
        
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.className = 'remove-team';
        removeBtn.addEventListener('click', function() {
            fileTeams.splice(index, 1);
            renderFileTeams();
        });
        
        teamDiv.appendChild(nameInput);
        teamDiv.appendChild(removeBtn);
        container.appendChild(teamDiv);
    });
}

// Continue to game after setting up teams
document.getElementById('file-teams-continue').addEventListener('click', function() {
    // Make sure there's at least one team
    if (fileTeams.length === 0) {
        alert('Please add at least one team before continuing.');
        return;
    }
    
    // Update the global teams variable
    teams = fileTeams.map(team => ({ ...team }));
    saveTeams();
    
    // Now process the board with the saved file text
    const fileText = window.uploadedFileText;
    populateJeopardyBoardFromText(fileText);
    
    // Set and show the title
    const title = loadTitle();
    const titleElem = document.getElementById('title');
    titleElem.textContent = title;
    titleElem.style.display = title ? 'block' : 'none';
    
    // Clear used cells for new game
    forEachBoardCell((cell) => cell.classList.remove('used'));
    saveBoardState();
    
    // Hide upload controls and team setup
    document.getElementById('upload-controls').style.display = 'none';
    document.getElementById('file-teams-setup').classList.add('hide');
    
    // Show stats table with the new teams
    renderStats();
    setStatsVisibility(true);
});

// Initialize file teams when needed
function initializeFileTeams() {
    if (fileTeams.length === 0) {
        fileTeams.push({ name: 'Team 1', score: 0 });
        renderFileTeams();
    }
}

// --- Board Creation Form Functionality ---
// Initialize form elements
const showUploadBtn = document.getElementById('show-upload');
const showCreateFormBtn = document.getElementById('show-create-form');
const createFormDiv = document.getElementById('create-form');
const generateBoardBtn = document.getElementById('generate-board');
const generateDownloadBtn = document.getElementById('generate-download');
const categoriesContainer = document.getElementById('categories-container');

// Default values for new categories and questions
const DEFAULT_CATEGORY = "New Category";
const DEFAULT_VALUES = [100, 200, 300, 400, 500];
const DEFAULT_QUESTIONS = Array(5).fill().map(() => ({ value: "", question: "", answer: "" }));

// Trigger the file dialog when Upload Text File button is clicked
showUploadBtn.addEventListener('click', function() {
    // Hide the create form if it's visible
    createFormDiv.classList.add('hide');
    
    // Hide the team setup until file is selected
    document.getElementById('file-teams-setup').classList.add('hide');
    
    // Keep stats table hidden until a game board is actually loaded
    setStatsVisibility(false);
    
    // Initialize file teams for the team setup screen
    fileTeams = [];
    initializeFileTeams();
    
    // Remove draft notification if present
    const draftNotification = document.getElementById('draft-notification');
    if (draftNotification) {
        draftNotification.remove();
    }
    
    // Programmatically click the file input to open file dialog
    document.getElementById('jeopardy-upload').click();
});

// Show create form option
showCreateFormBtn.addEventListener('click', function() {
    createFormDiv.classList.remove('hide');
    
    // Hide the file teams setup if it's visible
    document.getElementById('file-teams-setup').classList.add('hide');
    
    // Hide stats table when form is shown
    setStatsVisibility(false);
    
    // Remove the draft notification banner if it exists
    const draftNotification = document.getElementById('draft-notification');
    if (draftNotification) {
        draftNotification.remove();
    }
    
    try {
        // Check if there's a saved draft
        const savedDraft = storage.load('jeopardyFormDraft');
        
        if (savedDraft) {
            // Ask user if they want to restore their draft
            const restoreDraft = confirm('We found a saved draft of your game board. Would you like to restore it?');
            
            if (restoreDraft) {
                // Initialize a clean form first to ensure proper structure
                reinitializeForm();
                
                // Then try to load the draft data
                if (!loadFormDraft()) {
                    // If loading failed, we already have a clean form from reinitializeForm
                    console.error("Failed to load draft, using clean form instead");
                    alert("There was an issue loading your draft. Starting with a fresh form.");
                    discardFormDraft(); // Clear the problematic draft
                }
            } else {
                // User doesn't want to restore, proceed with a new form
                // Clear the draft from storage
                discardFormDraft();
                
                // Create a fresh form
                reinitializeForm();
            }
        } else {
            // No draft found, set up a new form
            reinitializeForm();
        }
    } catch (error) {
        // If anything goes wrong, create a fresh form
        console.error("Error handling create form:", error);
        reinitializeForm();
    }
    
    // Set up draft management functionality regardless of path taken
    setupDraftEventListeners();
    updateLastSavedDisplay();
    
    // Clear any previous validation errors
    document.getElementById('validation-message').style.display = 'none';
    document.querySelectorAll('.validation-error').forEach(field => {
        field.classList.remove('validation-error');
    });
});

// Add a new category to the form
function addCategory() {
    const categoryIndex = document.querySelectorAll('.category-section').length;
    
    // Only allow up to 5 categories (5x5 game board)
    if (categoryIndex >= 5) return;
    
    // Create category container
    const categorySection = document.createElement('div');
    categorySection.className = 'category-section';
    categorySection.dataset.index = categoryIndex;
    
    // Create category header with name input
    const categoryHeader = document.createElement('div');
    categoryHeader.className = 'category-header';
    
    // Create label element safely
    const label = document.createElement('label');
    label.setAttribute('for', `category-${categoryIndex}`);
    label.textContent = `Category ${categoryIndex + 1}:`;
    categoryHeader.appendChild(label);
    
    // Create input element safely
    const input = document.createElement('input');
    input.type = 'text';
    input.id = `category-${categoryIndex}`;
    input.placeholder = 'Enter category name';
    input.className = 'category-name required-field';
    input.required = true;
    categoryHeader.appendChild(input);
    
    // Create questions container
    const questionsContainer = document.createElement('div');
    questionsContainer.className = 'questions-container';
    
    // Add question inputs for this category
    DEFAULT_VALUES.forEach((value, qIndex) => {
        const questionItem = document.createElement('div');
        questionItem.className = 'question-item';
        
        // Create value display
        const valueDiv = document.createElement('div');
        valueDiv.className = 'question-value';
        valueDiv.textContent = value;
        questionItem.appendChild(valueDiv);
        
        // Create question input (what's shown to players first)
        const questionInput = document.createElement('input');
        questionInput.type = 'text';
        questionInput.className = 'question-question required-field';
        questionInput.placeholder = 'Clue (shown to players first)';
        questionInput.setAttribute('data-value', value);
        questionInput.required = true;
        questionItem.appendChild(questionInput);
        
        // Create answer input (what's shown after clicking "Show Answer")
        const answerInput = document.createElement('input');
        answerInput.type = 'text';
        answerInput.className = 'question-answer required-field';
        answerInput.placeholder = 'Correct Response (in question form)';
        answerInput.setAttribute('data-value', value);
        answerInput.required = true;
        questionItem.appendChild(answerInput);
        
        questionsContainer.appendChild(questionItem);
    });
    
    // Assemble and add to form
    categorySection.appendChild(categoryHeader);
    categorySection.appendChild(questionsContainer);
    categoriesContainer.appendChild(categorySection);
    
    // Add validation listeners to the new fields
    categorySection.querySelectorAll('.required-field').forEach(field => {
        // Initialize validation styling
        if (field.value.trim() !== '') {
            field.classList.add('has-content');
            field.classList.remove('validation-error');
        } else {
            field.classList.remove('has-content');
            // Don't add validation-error on initial creation
        }
    });
}

// No longer using addCategoryBtn

// Function to create a game board from form data
function createBoardFromForm(shouldDownload) {
    const boardTitle = document.getElementById('board-title').value.trim();
    
    // Validate board title
    if (!boardTitle) {
        alert("Please enter a game title.");
        document.getElementById('board-title').focus();
        return null;
    }
    
    const categories = [];
    const allQuestions = [];
    let hasEmptyFields = false;
    let firstEmptyField = null;
    
    // Check if we have exactly 5 categories
    const categoryCount = document.querySelectorAll('.category-section').length;
    if (categoryCount < 5) {
        alert("Please create all 5 categories for a complete game board.");
        return null;
    }
    
    // Collect all category data
    document.querySelectorAll('.category-section').forEach((catSection, catIndex) => {
        if (catIndex >= 5) return; // Only use first 5 categories
        
        const categoryNameInput = catSection.querySelector('.category-name');
        const categoryName = categoryNameInput.value.trim();
        
        // Validate category name
        if (!categoryName) {
            hasEmptyFields = true;
            if (!firstEmptyField) firstEmptyField = categoryNameInput;
            return;
        }
        
        categories.push(categoryName);
        
        const categoryQuestions = [];
        catSection.querySelectorAll('.question-item').forEach((qItem, qIndex) => {
            const value = qItem.querySelector('.question-value').textContent;
            const answerInput = qItem.querySelector('.question-answer');
            const questionInput = qItem.querySelector('.question-question');
            const answer = answerInput.value.trim();
            const question = questionInput.value.trim();
            
            // Validate answer and question
            if (!answer) {
                hasEmptyFields = true;
                if (!firstEmptyField) firstEmptyField = answerInput;
            }
            
            if (!question) {
                hasEmptyFields = true;
                if (!firstEmptyField) firstEmptyField = questionInput;
            }
            
            // Only add to categoryQuestions if this specific item has both answer and question
            // This is a defense in case the validation somehow continues despite empty fields
            if (answer && question) {
                categoryQuestions.push({
                    value: value,
                    answer: answer,
                    question: question
                });
            }
        });
        
        // Make sure this category has all 5 questions complete
        if (categoryQuestions.length < 5) {
            hasEmptyFields = true;
        }
        
        allQuestions.push(categoryQuestions);
    });
    
    // Check for empty fields
    if (hasEmptyFields) {
        const validationMessage = document.getElementById('validation-message');
        validationMessage.textContent = "Please fill out all required fields";
        validationMessage.style.display = 'block';
        
        // Highlight all empty fields
        document.querySelectorAll('.required-field').forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('validation-error');
                field.classList.remove('has-content');
            } else {
                field.classList.remove('validation-error');
                field.classList.add('has-content');
            }
        });
        
        // Focus on the first empty field
        if (firstEmptyField) firstEmptyField.focus();
        return null;
    }
    
    // Clear any validation errors if all fields are filled
    document.getElementById('validation-message').style.display = 'none';
    document.querySelectorAll('.validation-error').forEach(field => {
        field.classList.remove('validation-error');
    });
    
    // Check that we have exactly 5 categories and all questions
    if (categories.length !== 5 || allQuestions.some(categoryQ => categoryQ.length !== 5)) {
        alert("Cannot create game board: Missing categories or questions");
        return null;
    }
    
    // All validation passed, generate text representation of board
    let boardText = `Title: ${boardTitle}\n\n`;
    
    categories.forEach((category, catIndex) => {
        boardText += `Category: ${category}\n`;
        
        allQuestions[catIndex].forEach(q => {
            boardText += `${q.value}|${q.question}|${q.answer}\n`;
        });
        
        boardText += '\n';
    });
    
    // Save board to localStorage
    saveTitle(boardTitle);
    saveBoardText(boardText);
    
    // Clear the form draft since we've successfully created a board
    discardFormDraft();
    
    // Create game board
    populateJeopardyBoardFromText(boardText);
    
    // Hide form
    document.getElementById('upload-controls').style.display = 'none';
    
    // Show reset button
    const resetContainer = document.getElementById('reset-board-container');
    if (resetContainer) resetContainer.style.display = 'block';
    
    // Set and show title
    const titleElem = document.getElementById('title');
    titleElem.textContent = boardTitle;
    
    // Transfer teams from form to game
    if (formTeams.length > 0) {
        teams = [...formTeams]; // Copy teams from form
        formTeams = []; // Clear form teams
        renderStats(); // Update the stats display
    } else {
        // If no teams were added in the form, add a default team
        if (teams.length === 0) {
            addTeam();
        }
    }
    titleElem.style.display = 'block';
    
    // Return the board text and title for potential download
    return {
        text: boardText,
        title: boardTitle
    };
}

// Pre-validate form fields before submission
function validateFormBeforeSubmission() {
    let hasEmptyFields = false;
    let firstEmptyField = null;
    
    // Check all required fields
    document.querySelectorAll('.required-field').forEach(field => {
        if (!field.value.trim()) {
            hasEmptyFields = true;
            field.classList.add('validation-error');
            field.classList.remove('has-content');
            
            if (!firstEmptyField) {
                firstEmptyField = field;
            }
        }
    });
    
    if (hasEmptyFields) {
        // Show validation message
        const validationMessage = document.getElementById('validation-message');
        validationMessage.textContent = "Please fill out all required fields";
        validationMessage.style.display = 'block';
        
        // Focus on the first empty field
        if (firstEmptyField) {
            firstEmptyField.focus();
        }
        
        return false;
    }
    
    return true;
}

// Generate jeopardy board from form data (without download)
generateBoardBtn.addEventListener('click', function() {
    if (validateFormBeforeSubmission()) {
        createBoardFromForm(false);
    }
});

// Generate jeopardy board from form data and download the file
generateDownloadBtn.addEventListener('click', function() {
    if (validateFormBeforeSubmission()) {
        const boardData = createBoardFromForm(true);
        if (boardData) {
            // Download the generated board as a text file
            downloadBoardFile(boardData.text, `${boardData.title.replace(/\s+/g, '-').toLowerCase()}.txt`);
        }
    }
});

// Download generated board as a text file
function downloadBoardFile(content, filename) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// Add input event listeners to clear validation styling
function addValidationListeners() {
    document.querySelectorAll('.required-field').forEach(field => {
        // Initially check if field has content and apply styling
        if (field.value.trim() !== '') {
            field.classList.add('has-content');
            field.classList.remove('validation-error');
        } else {
            field.classList.remove('has-content');
            // We'll only add validation-error when field is modified and becomes empty
            // This prevents showing error styling on initial load
        }
        
        // Add event listener for input changes
        field.addEventListener('input', function() {
            if (this.value.trim() !== '') {
                this.classList.remove('validation-error');
                this.classList.add('has-content');
                
                // Hide validation message if all fields are filled
                const emptyFields = Array.from(document.querySelectorAll('.required-field')).filter(f => !f.value.trim());
                if (emptyFields.length === 0) {
                    document.getElementById('validation-message').style.display = 'none';
                }
            } else {
                // If field is emptied, remove has-content class and mark as invalid
                this.classList.remove('has-content');
                this.classList.add('validation-error');
                
                // Show validation message when fields are emptied
                document.getElementById('validation-message').textContent = "Please fill out all required fields";
                document.getElementById('validation-message').style.display = 'block';
            }
        });
        
        // Also add blur (focus lost) event to catch when users tab away from fields
        field.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                this.classList.remove('has-content');
                this.classList.add('validation-error');
                
                // Show validation message
                document.getElementById('validation-message').textContent = "Please fill out all required fields";
                document.getElementById('validation-message').style.display = 'block';
            }
        });
    });
}

// --- Team Management in Create Form ---
const formTeamsContainer = document.getElementById('form-teams-container');
const formAddTeamBtn = document.getElementById('form-add-team');

// Initialize form teams array
let formTeams = [];

// Add a new team to the form
function addFormTeam(name = `Team ${formTeams.length + 1}`) {
    formTeams.push({ name, score: 0 });
    renderFormTeams();
}

// Render teams in the form
function renderFormTeams() {
    if (!formTeamsContainer) return;
    
    formTeamsContainer.innerHTML = '';
    
    if (formTeams.length === 0) {
        const noTeamsMsg = document.createElement('p');
        noTeamsMsg.textContent = 'No teams added yet. Click "Add Team" to create teams.';
        noTeamsMsg.style.fontStyle = 'italic';
        noTeamsMsg.style.color = '#666';
        formTeamsContainer.appendChild(noTeamsMsg);
        return;
    }
    
    formTeams.forEach((team, idx) => {
        const teamRow = document.createElement('div');
        teamRow.className = 'team-item';
        teamRow.innerHTML = `
            <input type="text" value="${team.name}" class="form-team-name" data-idx="${idx}" placeholder="Team name">
            <button class="remove-team" data-idx="${idx}">Remove</button>
        `;
        formTeamsContainer.appendChild(teamRow);
    });
}

// Add team button handler for form
if (formAddTeamBtn) {
    formAddTeamBtn.onclick = () => addFormTeam();
}

// Handle team removal and name changes in form
if (formTeamsContainer) {
    formTeamsContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-team')) {
            const idx = +e.target.getAttribute('data-idx');
            formTeams.splice(idx, 1);
            renderFormTeams();
        }
    });
    
    formTeamsContainer.addEventListener('input', function(e) {
        if (e.target.classList.contains('form-team-name')) {
            const idx = +e.target.getAttribute('data-idx');
            formTeams[idx].name = e.target.value;
        }
    });
}

// --- Form Draft Functionality ---
// Save the current state of the form to localStorage
function saveFormDraft() {
    try {
        const boardTitle = document.getElementById('board-title');
        const formData = {
            title: boardTitle ? boardTitle.value : '',
            categories: [],
            teams: formTeams || [],
            lastModified: new Date().toISOString()
        };
        
        // Verify categories container exists
        if (!categoriesContainer) {
            console.error('Categories container not found, cannot save draft');
            return false;
        }
        
        // Gather all category data
        document.querySelectorAll('.category-section').forEach((catSection, catIndex) => {
            const categoryNameInput = catSection.querySelector('.category-name');
            const categoryName = categoryNameInput ? categoryNameInput.value : '';
            const clues = [];
            
            // Gather all questions for this category
            catSection.querySelectorAll('.question-item').forEach((qItem) => {
                const valueElement = qItem.querySelector('.question-value');
                const answerInput = qItem.querySelector('.question-answer');
                const questionInput = qItem.querySelector('.question-question');
                
                const value = valueElement ? valueElement.textContent : '';
                const answer = answerInput ? answerInput.value : '';
                const question = questionInput ? questionInput.value : '';
                
                clues.push({
                    value,
                    answer, 
                    question
                });
            });
            
            formData.categories.push({
                name: categoryName,
                clues: clues
            });
        });
        
        // Make sure we have the right number of categories
        if (formData.categories.length === 0) {
            console.warn('No categories found when saving draft');
        }
        
        // Save to localStorage
        storage.save('jeopardyFormDraft', formData);
        
        // Update last saved timestamp display
        updateLastSavedDisplay();
        return true;
    } catch (error) {
        console.error('Error saving form draft:', error);
        return false;
    }
}

// Load form draft from localStorage
function loadFormDraft() {
    const savedDraft = storage.load('jeopardyFormDraft');
    if (!savedDraft) return false;
    
    // Set title
    if (savedDraft.title) {
        document.getElementById('board-title').value = savedDraft.title;
        // Mark as having content for validation
        document.getElementById('board-title').classList.add('has-content');
    }
    
    // Clear existing categories
    categoriesContainer.innerHTML = '';
    
    try {
        // Basic safety check
        if (!categoriesContainer) {
            console.error("Categories container not found");
            return false;
        }
        
        // Make sure we have the right number of categories (5)
        const categoryCount = savedDraft.categories ? Math.min(savedDraft.categories.length, 5) : 0;
        const categoriesToCreate = Math.max(5 - categoryCount, 0);
        
        // First create empty categories to ensure proper structure
        for (let i = 0; i < 5; i++) {
            addCategory();
        }
        
        // Then populate with saved data
        if (savedDraft.categories && savedDraft.categories.length > 0) {
            // Get all created category sections
            const categorySections = document.querySelectorAll('.category-section');
            if (categorySections.length !== 5) {
                console.error(`Expected 5 categories, but found ${categorySections.length}`);
            }
            
            // Update each category with saved data
            savedDraft.categories.forEach((category, index) => {
                if (index >= 5) return; // Only handle the first 5 categories
                
                const catSection = categorySections[index];
                if (!catSection) {
                    console.error(`Category section ${index} not found`);
                    return;
                }
                
                // Set category name
                const catNameInput = catSection.querySelector('.category-name');
                if (catNameInput) {
                    catNameInput.value = category.name || '';
                    if (category.name) {
                        catNameInput.classList.add('has-content');
                    }
                } else {
                    console.error(`Category ${index} name input not found`);
                }
                
                // Set question/answer values
                const questionItems = catSection.querySelectorAll('.question-item');
                if (category.clues) {
                    category.clues.forEach((clue, qIndex) => {
                        if (qIndex >= questionItems.length) return;
                        
                        const qItem = questionItems[qIndex];
                        const answerInput = qItem.querySelector('.question-answer');
                        const questionInput = qItem.querySelector('.question-question');
                        
                        if (answerInput) {
                            answerInput.value = clue.answer || '';
                            if (clue.answer) answerInput.classList.add('has-content');
                        }
                        
                        if (questionInput) {
                            questionInput.value = clue.question || '';
                            if (clue.question) questionInput.classList.add('has-content');
                        }
                    });
                }
            });
        }
        
        // Apply validation styling to all fields
        document.querySelectorAll('.required-field').forEach(field => {
            if (field.value.trim() !== '') {
                field.classList.add('has-content');
                field.classList.remove('validation-error');
            } else {
                field.classList.remove('has-content');
                field.classList.add('validation-error');
            }
        });
        
        // Log form structure for debugging
        console.log('Form restored from draft');
        debugFormStructure();
    } catch (error) {
        console.error('Error loading form draft:', error);
        
        // Emergency reset of form
        reinitializeForm();
        return false;
    }
    
    // Load teams if any
    if (savedDraft.teams && savedDraft.teams.length > 0) {
        formTeams = [...savedDraft.teams];
        renderFormTeams();
    } else {
        // Ensure at least one default team
        if (formTeams.length === 0) {
            addFormTeam();
        }
    }
    
    // Update last saved display
    updateLastSavedDisplay();
    
    return true;
}

// Function to completely reinitialize the form when there are issues
function reinitializeForm() {
    console.log("Reinitializing form due to structure issues");
    
    // Clear the entire form
    categoriesContainer.innerHTML = '';
    
    // Add 5 fresh categories
    for (let i = 0; i < 5; i++) {
        addCategory();
    }
    
    // Reset teams
    formTeams = [];
    addFormTeam();
    renderFormTeams();
    
    // Clear title
    const titleInput = document.getElementById('board-title');
    if (titleInput) {
        titleInput.value = '';
        titleInput.classList.remove('has-content');
    }
    
    // Re-add validation listeners
    addValidationListeners();
    
    // Hide validation messages
    const validationMessage = document.getElementById('validation-message');
    if (validationMessage) {
        validationMessage.style.display = 'none';
    }
}

// Discard the form draft
function discardFormDraft() {
    storage.remove('jeopardyFormDraft');
    updateLastSavedDisplay();
}

// Update the display showing when the form was last saved
// Manual saves occur when the user clicks the "Save Now" button
// Timestamp includes seconds to provide more precise save time feedback
function updateLastSavedDisplay() {
    const savedDraft = storage.load('jeopardyFormDraft');
    const lastSavedDisplay = document.getElementById('last-saved-display');
    
    if (!lastSavedDisplay) return;
    
    if (savedDraft && savedDraft.lastModified) {
        const date = new Date(savedDraft.lastModified);
        
        // Format date in the style: M/D/YYYY, h:MM:SS AM/PM
        const month = date.getMonth() + 1; // getMonth() is 0-indexed
        const day = date.getDate();
        const year = date.getFullYear();
        
        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // Convert 0 to 12 for 12 AM
        
        const formattedDate = `${month}/${day}/${year}, ${hours}:${minutes}:${seconds} ${ampm}`;
        
        lastSavedDisplay.textContent = `Last saved: ${formattedDate}`;
        lastSavedDisplay.style.display = 'block';
        
        // Show discard button when we have a saved draft
        const discardBtn = document.getElementById('discard-draft-btn');
        if (discardBtn) discardBtn.style.display = 'block';
    } else {
        lastSavedDisplay.textContent = 'No draft saved';
        lastSavedDisplay.style.display = 'block';
        
        // Hide discard button if no draft
        const discardBtn = document.getElementById('discard-draft-btn');
        if (discardBtn) discardBtn.style.display = 'none';
    }
}

// --- Draft Management Event Listeners ---
// Modified setupDraftEventListeners to handle dynamic elements
function setupDraftEventListeners() {
    const discardDraftBtn = document.getElementById('discard-draft-btn');
    const saveDraftBtn = document.getElementById('save-draft-btn');
    const exportDraftBtn = document.getElementById('export-draft-btn');
    const importDraftBtn = document.getElementById('import-draft-btn');
    const draftFileInput = document.getElementById('draft-file-input');
    
    // Setup manual save button
    if (saveDraftBtn) {
        // Clone and replace to remove any existing event listeners
        const newSaveBtn = saveDraftBtn.cloneNode(true);
        saveDraftBtn.parentNode.replaceChild(newSaveBtn, saveDraftBtn);
        
        // Add a single event listener to the new save button
        newSaveBtn.addEventListener('click', function() {
            // Save immediately
            if (saveFormDraft()) {
                // Show brief feedback
                const originalText = this.textContent;
                this.textContent = "Saved!";
                this.disabled = true;
                
                // Reset button after 1.5 seconds
                setTimeout(() => {
                    this.textContent = originalText;
                    this.disabled = false;
                }, 1500);
            }
        });
    }
    
    // Remove any existing event listeners from discard button to prevent duplicates
    if (discardDraftBtn) {
        // Clone and replace to remove all event listeners
        const newDiscardBtn = discardDraftBtn.cloneNode(true);
        discardDraftBtn.parentNode.replaceChild(newDiscardBtn, discardDraftBtn);
        
        // Add a single event listener to the new button
        newDiscardBtn.addEventListener('click', function() {
            const confirmed = confirm('Are you sure you want to discard this draft? This cannot be undone.');
            if (confirmed) {
                discardFormDraft();
                // Reset the form
                document.getElementById('board-title').value = '';
                document.getElementById('board-title').classList.remove('has-content');
                
                categoriesContainer.innerHTML = '';
                for (let i = 0; i < 5; i++) {
                    addCategory();
                }
                formTeams = [];
                addFormTeam();
                renderFormTeams();
                alert('Draft discarded.');
            }
        });
    }
    
    // Setup export draft button - Remove duplicate listeners
    if (exportDraftBtn) {
        // Clone and replace to remove any existing event listeners
        const newExportBtn = exportDraftBtn.cloneNode(true);
        exportDraftBtn.parentNode.replaceChild(newExportBtn, exportDraftBtn);
        
        // Add a single event listener to the new button
        newExportBtn.addEventListener('click', function() {
            exportFormDraft();
        });
    }
    
    // Setup import draft button and file input
    if (importDraftBtn && draftFileInput) {
        // Clone and replace to remove any existing event listeners
        const newImportBtn = importDraftBtn.cloneNode(true);
        importDraftBtn.parentNode.replaceChild(newImportBtn, importDraftBtn);
        
        newImportBtn.addEventListener('click', function() {
            draftFileInput.click();
        });
        
        draftFileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                importFormDraft(file);
                // Clear the file input so the same file can be selected again
                e.target.value = '';
            }
        });
    }
    
    // Set up validation for the board title (no auto-save)
    const boardTitle = document.getElementById('board-title');
    
    // Set up delegation for category container to catch all dynamic elements
    categoriesContainer.addEventListener('input', function(e) {
        const target = e.target;
        
        // Check if the input is from one of our form fields and handle validation
        if (
            target.classList.contains('category-name') ||
            target.classList.contains('question-answer') ||
            target.classList.contains('question-question')
        ) {
            // Handle validation styling for required fields
            if (target.classList.contains('required-field')) {
                if (target.value.trim() !== '') {
                    target.classList.remove('validation-error');
                    target.classList.add('has-content');
                } else {
                    target.classList.remove('has-content');
                    target.classList.add('validation-error');
                }
            }
        }
    });
}

// Auto-save functionality has been removed in favor of manual save only

// Setup draft event listeners on page load
// Add event listener to fix any potential form rendering issues
document.addEventListener('DOMContentLoaded', function() {
    setupDraftEventListeners();
    
    // Make sure categories container always exists
    if (!categoriesContainer) {
        console.error('Categories container not found, cannot set up draft functionality');
    }
});

// Debug function to help diagnose form issues
function debugFormStructure() {
    console.log('---- Form Structure Debug ----');
    console.log('Board title:', document.getElementById('board-title') ? 'exists' : 'missing');
    console.log('Categories container:', categoriesContainer ? 'exists' : 'missing');
    
    const categoryCount = document.querySelectorAll('.category-section').length;
    console.log('Category sections:', categoryCount);
    
    document.querySelectorAll('.category-section').forEach((cat, i) => {
        console.log(`Category ${i+1} name input:`, cat.querySelector('.category-name') ? 'exists' : 'missing');
        console.log(`Category ${i+1} question items:`, cat.querySelectorAll('.question-item').length);
    });
}

// --- Draft File Import/Export Functionality ---
// Export current form draft to a downloadable file
function exportFormDraft() {
    try {
        // Get current form data (same as saveFormDraft but for export)
        const boardTitle = document.getElementById('board-title');
        const formData = {
            isDraft: true, // Special marker to identify draft files
            title: boardTitle ? boardTitle.value : '',
            categories: [],
            teams: formTeams || [],
            lastModified: new Date().toISOString(),
            exportedAt: new Date().toISOString()
        };
        
        // Verify categories container exists
        if (!categoriesContainer) {
            alert('Cannot export draft: Form not ready');
            return false;
        }
        
        // Gather all category data
        document.querySelectorAll('.category-section').forEach((catSection, catIndex) => {
            const categoryNameInput = catSection.querySelector('.category-name');
            const categoryName = categoryNameInput ? categoryNameInput.value : '';
            const clues = [];
            
            // Gather all questions for this category
            catSection.querySelectorAll('.question-item').forEach((qItem) => {
                const valueElement = qItem.querySelector('.question-value');
                const answerInput = qItem.querySelector('.question-answer');
                const questionInput = qItem.querySelector('.question-question');
                
                const value = valueElement ? valueElement.textContent : '';
                const answer = answerInput ? answerInput.value : '';
                const question = questionInput ? questionInput.value : '';
                
                clues.push({
                    value,
                    answer, 
                    question
                });
            });
            
            formData.categories.push({
                name: categoryName,
                clues: clues
            });
        });
        
        // Create file content in a special draft format
        let draftContent = `[JEOPARDY DRAFT]\n`;
        draftContent += `Title: ${formData.title}\n`;
        draftContent += `Created: ${formData.exportedAt}\n`;
        draftContent += `Teams: ${formData.teams.map(t => t.name).join(', ')}\n\n`;
        
        // Add categories and clues
        formData.categories.forEach((category, catIndex) => {
            draftContent += `Category: ${category.name}\n`;
            category.clues.forEach(clue => {
                draftContent += `${clue.value}|${clue.question}|${clue.answer}\n`;
            });
            draftContent += '\n';
        });
        
        // Download the file
        const filename = formData.title ? 
            `${formData.title.replace(/\s+/g, '-').toLowerCase()}-draft.txt` : 
            'jeopardy-draft.txt';
            
        downloadDraftFile(draftContent, filename);
        return true;
    } catch (error) {
        console.error('Error exporting form draft:', error);
        alert('Error exporting draft. Please try again.');
        return false;
    }
}

// Import draft from a file
function importFormDraft(file) {
    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            const fileContent = evt.target.result;
            
            // Parse any text file as a draft (no need to distinguish between draft and complete files)
            const lines = fileContent.split(/\r?\n/);
            let title = '';
            let teams = [];
            let categories = [];
            let currentCategory = null;
            let currentClues = [];
            
            for (let line of lines) {
                line = line.trim();
                if (!line || line === '[JEOPARDY DRAFT]') continue;
                
                if (line.toLowerCase().startsWith('title:')) {
                    title = line.substring(6).trim();
                } else if (line.toLowerCase().startsWith('teams:')) {
                    const teamNames = line.substring(6).trim();
                    if (teamNames) {
                        teams = teamNames.split(',').map(name => ({
                            name: name.trim(),
                            score: 0
                        }));
                    }
                } else if (line.toLowerCase().startsWith('created:')) {
                    // Skip the created timestamp line from exported drafts
                    continue;
                } else if (line.toLowerCase().startsWith('category:')) {
                    // Save previous category if it exists
                    if (currentCategory) {
                        categories.push({
                            name: currentCategory,
                            clues: currentClues
                        });
                    }
                    currentCategory = line.substring(9).trim();
                    currentClues = [];
                } else if (/^\d+\|/.test(line)) {
                    // Parse value|question|answer line
                    const parts = line.split('|');
                    if (parts.length >= 3) {
                        currentClues.push({
                            value: parts[0].trim(),
                            question: parts[1].trim(),
                            answer: parts.slice(2).join('|').trim()
                        });
                    }
                }
            }
            
            // Save last category
            if (currentCategory) {
                categories.push({
                    name: currentCategory,
                    clues: currentClues
                });
            }
            
            // If no teams were found in the file, add a default team
            if (teams.length === 0) {
                teams = [{ name: 'Team 1', score: 0 }];
            }
            
            // Apply the imported data to the form
            applyImportedDraftToForm(title, categories, teams);
            
        } catch (error) {
            console.error('Error importing draft:', error);
            alert('Error importing draft file. Please check the file format.');
        }
    };
    reader.readAsText(file);
}

// Apply imported draft data to the form
function applyImportedDraftToForm(title, categories, teams) {
    try {
        // Set title
        const titleInput = document.getElementById('board-title');
        if (titleInput) {
            titleInput.value = title || '';
            if (title) {
                titleInput.classList.add('has-content');
            } else {
                titleInput.classList.remove('has-content');
            }
        }
        
        // Clear and rebuild form
        categoriesContainer.innerHTML = '';
        
        // Create 5 categories (pad with empty ones if needed)
        for (let i = 0; i < 5; i++) {
            addCategory();
        }
        
        // Populate categories with imported data
        const categorySections = document.querySelectorAll('.category-section');
        categories.forEach((category, index) => {
            if (index >= 5) return; // Only handle first 5 categories
            
            const catSection = categorySections[index];
            if (!catSection) return;
            
            // Set category name
            const catNameInput = catSection.querySelector('.category-name');
            if (catNameInput) {
                catNameInput.value = category.name || '';
                if (category.name) {
                    catNameInput.classList.add('has-content');
                } else {
                    catNameInput.classList.remove('has-content');
                }
            }
            
            // Set questions/answers
            const questionItems = catSection.querySelectorAll('.question-item');
            category.clues.forEach((clue, qIndex) => {
                if (qIndex >= questionItems.length) return;
                
                const qItem = questionItems[qIndex];
                const answerInput = qItem.querySelector('.question-answer');
                const questionInput = qItem.querySelector('.question-question');
                
                if (answerInput) {
                    answerInput.value = clue.answer || '';
                    if (clue.answer) {
                        answerInput.classList.add('has-content');
                    } else {
                        answerInput.classList.remove('has-content');
                    }
                }
                
                if (questionInput) {
                    questionInput.value = clue.question || '';
                    if (clue.question) {
                        questionInput.classList.add('has-content');
                    } else {
                        questionInput.classList.remove('has-content');
                    }
                }
            });
        });
        
        // Set teams
        formTeams = teams && teams.length > 0 ? [...teams] : [{ name: 'Team 1', score: 0 }];
        renderFormTeams();
        
        // Save as localStorage draft
        saveFormDraft();
        
        alert('Draft imported successfully!');
        
    } catch (error) {
        console.error('Error applying imported draft:', error);
        alert('Error applying imported draft to form.');
    }
}

// Download draft file
function downloadDraftFile(content, filename) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}