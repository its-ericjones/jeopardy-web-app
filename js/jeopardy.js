/* ────────────────────────────────────────────────────────────────
  Jeopardy — game logic
  Author:   Eric Jones
  Created:  2025-06-07
  License:  MIT
  Purpose:
    Builds a 5×5 Jeopardy board from a plain-text file, handles
    scoring, and persists state in localStorage.
──────────────────────────────────────────────────────────────── */
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
    populateJeopardyBoardFromText(fileText);
    // Set and show the title
    const titleElem = document.getElementById('title');
    titleElem.textContent = title;
    titleElem.style.display = title ? 'block' : 'none';
    // Clear used cells ONLY on new upload
    forEachBoardCell((cell) => cell.classList.remove('used'));
    saveBoardState();
    // Hide upload controls
    document.getElementById('upload-controls').style.display = 'none';
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
        // Parse question/answer/value line
        const parts = line.split('|');
        if (parts.length >= 3) {
        currentQuestions.push({
            value: parts[0].trim(),
            // SWAP: question is now the answer, answer is now the question
            question: parts.slice(2).join('|').trim(),
            answer: parts[1].trim()
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
    } else {
    // Generate empty board structure even if no saved data
    generateGameBoard();
    // Initially only show the option buttons, not the create form
    createFormDiv.classList.add('hide');
    }
    loadTeams();
});

// --- Scoring Implementation ---
const stats = document.getElementById('stats');
const statsBody = document.getElementById('stats-body');
const addTeamBtn = document.getElementById('add-team');
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

// Add team button handler
addTeamBtn.onclick = () => addTeam();

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

// Show stats bar
stats.style.display = 'block';

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
    // Hide create form
    createFormDiv.classList.add('hide');
    
    const resetContainer = document.getElementById('reset-board-container');
    if (resetContainer) resetContainer.style.display = 'none';
    
    // Remove the title from localStorage so it doesn't reappear after reload
    localStorage.removeItem('jeopardyTitle');
    document.getElementById('title').style.display = 'none';
    clearAllStorage();
    
    // Clear all form fields
    categoriesContainer.innerHTML = '';
    document.getElementById('board-title').value = '';
    
    location.reload();
};

// --- Board Creation Form Functionality ---
// Initialize form elements
const showUploadBtn = document.getElementById('show-upload');
const showCreateFormBtn = document.getElementById('show-create-form');
const createFormDiv = document.getElementById('create-form');
const generateBoardBtn = document.getElementById('generate-board');
const cancelCreateBtn = document.getElementById('cancel-create');
const categoriesContainer = document.getElementById('categories-container');

// Default values for new categories and questions
const DEFAULT_CATEGORY = "New Category";
const DEFAULT_VALUES = [100, 200, 300, 400, 500];
const DEFAULT_QUESTIONS = Array(5).fill().map(() => ({ value: "", question: "", answer: "" }));

// Trigger the file dialog when Upload Text File button is clicked
showUploadBtn.addEventListener('click', function() {
    // Hide the create form if it's visible
    createFormDiv.classList.add('hide');
    
    // Programmatically click the file input to open file dialog
    document.getElementById('jeopardy-upload').click();
});

// Show create form option
showCreateFormBtn.addEventListener('click', function() {
    createFormDiv.classList.remove('hide');
    
    // Always clear the title field to ensure it starts empty
    document.getElementById('board-title').value = '';
    
    // Initialize form if it's empty
    if (categoriesContainer.children.length === 0) {
        for (let i = 0; i < 5; i++) {
            addCategory();
        }
    }
    
    // Add validation listeners and process initial field values
    addValidationListeners();
    
    // Process any fields that already have content (like default category names)
    document.querySelectorAll('.required-field').forEach(field => {
        if (field.value.trim() !== '') {
            field.classList.add('has-content');
        }
    });
    
    // Clear any previous validation errors
    document.getElementById('validation-message').style.display = 'none';
    document.querySelectorAll('.validation-error').forEach(field => {
        field.classList.remove('validation-error');
    });
});

// Cancel creation and return to options
cancelCreateBtn.addEventListener('click', function() {
    createFormDiv.classList.add('hide');
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
    categoryHeader.innerHTML = `
        <label for="category-${categoryIndex}">Category ${categoryIndex + 1}:</label>
        <input type="text" id="category-${categoryIndex}" placeholder="Enter category name" class="category-name required-field" required>
    `;
    
    // Create questions container
    const questionsContainer = document.createElement('div');
    questionsContainer.className = 'questions-container';
    
    // Add question inputs for this category
    DEFAULT_VALUES.forEach((value, qIndex) => {
        const questionItem = document.createElement('div');
        questionItem.className = 'question-item';
        questionItem.innerHTML = `
            <div class="question-value">${value}</div>
            <input type="text" class="question-answer required-field" placeholder="Answer (shown to players)" data-value="${value}" required>
            <input type="text" class="question-question required-field" placeholder="Question (correct response)" data-value="${value}" required>
        `;
        questionsContainer.appendChild(questionItem);
    });
    
    // Assemble and add to form
    categorySection.appendChild(categoryHeader);
    categorySection.appendChild(questionsContainer);
    categoriesContainer.appendChild(categorySection);
}

// No longer using addCategoryBtn

// Generate jeopardy board from form data
generateBoardBtn.addEventListener('click', function() {
    const boardTitle = document.getElementById('board-title').value.trim();
    
    // Validate board title
    if (!boardTitle) {
        alert("Please enter a game title.");
        document.getElementById('board-title').focus();
        return;
    }
    
    const categories = [];
    const allQuestions = [];
    let hasEmptyFields = false;
    let firstEmptyField = null;
    
    // Check if we have exactly 5 categories
    const categoryCount = document.querySelectorAll('.category-section').length;
    if (categoryCount < 5) {
        alert("Please create all 5 categories for a complete game board.");
        return;
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
            
            categoryQuestions.push({
                value: value,
                answer: answer,
                question: question
            });
        });
        
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
        return;
    }
    
    // Clear any validation errors if all fields are filled
    document.getElementById('validation-message').style.display = 'none';
    document.querySelectorAll('.validation-error').forEach(field => {
        field.classList.remove('validation-error');
    });
    
    // All validation passed, generate text representation of board
    let boardText = `Title: ${boardTitle}\n\n`;
    
    categories.forEach((category, catIndex) => {
        boardText += `Category: ${category}\n`;
        
        allQuestions[catIndex].forEach(q => {
            boardText += `${q.value}|${q.answer}|${q.question}\n`;
        });
        
        boardText += '\n';
    });
    
    // Save board to localStorage
    saveTitle(boardTitle);
    saveBoardText(boardText);
    
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
    titleElem.style.display = 'block';
    
    // Offer file download
    downloadBoardFile(boardText, `${boardTitle.replace(/\s+/g, '-').toLowerCase()}.txt`);
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
        } else {
            field.classList.remove('has-content');
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
                // If field is emptied, remove has-content class
                this.classList.remove('has-content');
            }
        });
    });
}