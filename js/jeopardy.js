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
    } else {
    // Generate empty board structure even if no saved data
    generateGameBoard();
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
    const resetContainer = document.getElementById('reset-board-container');
    if (resetContainer) resetContainer.style.display = 'none';
    // Remove the title from localStorage so it doesn't reappear after reload
    localStorage.removeItem('jeopardyTitle');
    document.getElementById('title').style.display = 'none';
    clearAllStorage();
    location.reload();
};