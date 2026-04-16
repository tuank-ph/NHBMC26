const canvas = document.getElementById('graph-canvas');
const ctx = canvas.getContext('2d');

let cw = window.innerWidth;
let ch = window.innerHeight;
canvas.width = cw;
canvas.height = ch;

window.addEventListener('resize', () => {
    cw = window.innerWidth;
    ch = window.innerHeight;
    canvas.width = cw;
    canvas.height = ch;
    render();
});

const X_MIN = -10, X_MAX = 10, Y_MIN = -10, Y_MAX = 10;

// UI Elements
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const finalScoreEl = document.getElementById('final-score');
const formulaInput = document.getElementById('formula-input');
const runBtn = document.getElementById('run-btn');
const pointsDisplay = document.getElementById('points-display');
const msgEl = document.getElementById('message');
const taskDesc = document.getElementById('task-desc');

// Menus
const mainMenu = document.getElementById('main-menu-overlay');
const rulesMenu = document.getElementById('rules-overlay');
const gameOverMenu = document.getElementById('game-over-overlay');
const gameHeader = document.getElementById('game-header');
const gameMain = document.getElementById('game-main');

document.getElementById('btn-rules').addEventListener('click', () => {
    mainMenu.classList.add('hidden');
    rulesMenu.classList.remove('hidden');
});
document.getElementById('btn-back-menu').addEventListener('click', () => {
    rulesMenu.classList.add('hidden');
    mainMenu.classList.remove('hidden');
});
document.getElementById('btn-play').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', startGame);

// Game State
let score = 0;
let currentTargets = [];
let shieldParabola = null;
let currentA = 1;
let gameState = 'IDLE'; 
let currentPath = []; 
let carAnimationIndex = 0;
let timeLeft = 120; // 2 phút
let timerInterval = null;
let isPlaying = false;
let hiddenMode = 2; // 0: Hiện hết, 1: Giấu 1 điểm, 2: Giấu cả 2 điểm

function mapX(x) { return ((x - X_MIN) / (X_MAX - X_MIN)) * cw; }
function mapY(y) { return ch - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * ch; }

// --- HỆ THỐNG SINH CÂU HỎI TRỘN LẪN ---
function generateLevel() {
    formulaInput.value = '';
    formulaInput.focus();
    hideMessage();
    
    const a_options = [1, -1, 2, -2];
    currentA = a_options[Math.floor(Math.random() * a_options.length)];
    shieldParabola = math.compile(`${currentA} * x^2`);
    let equationStr = currentA === 1 ? 'x²' : currentA === -1 ? '-x²' : `${currentA}x²`;

    // Sinh nghiệm x1, x2 (Tránh số 0 để không lỗi chia khi tính Vi-ét khuyết)
    let x1, x2;
    do {
        x1 = Math.floor(Math.random() * 8) - 4;
        if(x1 === 0) x1 = 1;
        x2 = Math.floor(Math.random() * 8) - 4;
        if(x2 === 0) x2 = 2;
    } while (x1 === x2 || Math.abs(x1 - x2) < 2);

    let y1 = shieldParabola.evaluate({ x: x1 });
    let y2 = shieldParabola.evaluate({ x: x2 });
    currentTargets = [{ x: x1, y: y1 }, { x: x2, y: y2 }];

    let S = x1 + x2;
    let P = x1 * x2;
    
    // TUNG XÚC XẮC CHỌN CHẾ ĐỘ (50% Dễ - 50% Khó)
    let isHardMode = Math.random() > 0.5;

    if (!isHardMode) {
        // CHẾ ĐỘ DỄ: Cấp sẵn S và P
        hiddenMode = 2; // Tàng hình cả 2
        taskDesc.innerHTML = `
            <div style="margin-bottom: 10px;">Lá chắn: <b>y = ${equationStr}</b> (Hệ số <b style="color:#fce366;">a = ${currentA}</b>)</div>
            <div style="color: #5cfc66;">✔️ Tín hiệu DỄ (Cấp đủ):<br>Tổng <b>S = ${S}</b> | Tích <b>P = ${P}</b></div>
        `;
        pointsDisplay.innerHTML = `<div class="point-item" style="border-left-color: #5cfc66;"><b>Nhắc bài:</b> m = a*S, n = -a*P</div>`;
    } else {
        // CHẾ ĐỘ KHÓ: Lộ 1 điểm, chỉ cho Tích P
        hiddenMode = 1; // Chỉ tàng hình 1 kẻ địch
        taskDesc.innerHTML = `
            <div style="margin-bottom: 10px;">Lá chắn: <b>y = ${equationStr}</b> (Hệ số <b style="color:#fce366;">a = ${currentA}</b>)</div>
            <div style="color: #ff007f;">⚠️ Tín hiệu KHÓ (Bị nhiễu):<br>
            • Địch 1 bị lộ tại hoành độ: <b>x₁ = ${x1}</b><br>
            • Địch 2 tàng hình. Radar báo Tích: <b>P = ${P}</b></div>
        `;
        pointsDisplay.innerHTML = `
            <div class="point-item" style="border-left-color: #ff007f;">
                <b>Giải mã 3 bước:</b><br>
                1. Tìm x₂ = P / x₁<br>
                2. Tính S = x₁ + x₂<br>
                3. Tính m = a*S, n = -a*P
            </div>
        `;
    }

    gameState = 'IDLE';
    currentPath = [];
    render();
}

function showMessage(text, isError = false) {
    msgEl.innerText = text;
    msgEl.className = `message show ${isError ? 'error' : 'success'}`;
}
function hideMessage() { msgEl.className = 'message'; }

function validateFunction(compiledEq) {
    for (const pt of currentTargets) {
        try {
            if (Math.abs(compiledEq.evaluate({ x: pt.x }) - pt.y) > 0.05) return false;
        } catch (e) { return false; }
    }
    return true;
}

runBtn.addEventListener('click', () => {
    if (gameState !== 'IDLE' || !isPlaying) return;

    const formula = formulaInput.value.trim();
    if (!formula) { showMessage("Chưa nạp đạn!", true); return; }

    let compiledEq;
    try {
        compiledEq = math.compile(formula);
        compiledEq.evaluate({x: 0});
    } catch (e) { showMessage("Lỗi cú pháp toán học!", true); return; }

    if (validateFunction(compiledEq)) {
        showMessage("Chính xác! Đường đạn đã khóa mục tiêu!", false);
        hiddenMode = 0; // Bắn trúng thì hiện nguyên hình kẻ địch
        startSuccessAnimation(compiledEq);
    } else {
        showMessage("Trượt! Cẩn thận dấu âm/dương khi nhân nhé.", true);
        drawFailedAttempt(compiledEq);
    }
});

formulaInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') runBtn.click();
});

function startGame() {
    mainMenu.classList.add('hidden');
    rulesMenu.classList.add('hidden');
    gameOverMenu.classList.add('hidden');
    gameHeader.classList.remove('hidden');
    gameMain.classList.remove('hidden');

    score = 0;
    scoreEl.innerText = score;
    timeLeft = 120;
    updateTimeDisplay();
    isPlaying = true;
    runBtn.disabled = false;
    formulaInput.disabled = false;
    
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimeDisplay();
        if (timeLeft <= 0) endGame();
    }, 1000);
    
    generateLevel();
}

function endGame() {
    clearInterval(timerInterval);
    isPlaying = false;
    runBtn.disabled = true;
    formulaInput.disabled = true;
    finalScoreEl.innerText = score;
    gameOverMenu.classList.remove('hidden');
    gameHeader.classList.add('hidden');
    gameMain.classList.add('hidden');
}

function updateTimeDisplay() {
    let m = Math.floor(timeLeft / 60);
    let s = timeLeft % 60;
    timeEl.innerText = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// Render logic
function renderGrid() {
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = X_MIN; i <= X_MAX; i++) {
        const x = mapX(i);
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, ch); ctx.stroke();
    }
    for (let i = Y_MIN; i <= Y_MAX; i++) {
        const y = mapY(i);
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cw, y); ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(102, 252, 241, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(mapX(0), 0); ctx.lineTo(mapX(0), ch); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, mapY(0)); ctx.lineTo(cw, mapY(0)); ctx.stroke();
    
    ctx.fillStyle = 'rgba(102, 252, 241, 0.8)';
    ctx.font = '14px Orbitron';
    for (let i = X_MIN; i <= X_MAX; i++) {
        if (i !== 0 && i % 2 === 0) ctx.fillText(i, mapX(i) - 5, mapY(0) + 15);
    }
    for (let i = Y_MIN; i <= Y_MAX; i++) {
        if (i !== 0 && i % 2 === 0) ctx.fillText(i, mapX(0) + 10, mapY(i) + 5);
    }
}

function renderParabolaShield() {
    if (!shieldParabola) return;
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 0, 127, 0.3)';
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 10]); 
    
    let first = true;
    for (let x = X_MIN; x <= X_MAX; x += 0.2) {
        const y = shieldParabola.evaluate({ x });
        if (first) { ctx.moveTo(mapX(x), mapY(y)); first = false; } 
        else { ctx.lineTo(mapX(x), mapY(y)); }
    }
    ctx.stroke();
    ctx.setLineDash([]);
}

function renderPoints() {
    ctx.shadowBlur = 15;
    
    // Nếu hiddenMode = 2, không vẽ gì (Giấu hết)
    // Nếu hiddenMode = 1, chỉ vẽ điểm đầu tiên (x1)
    // Nếu hiddenMode = 0, vẽ tất cả
    
    for (let i = 0; i < currentTargets.length; i++) {
        if (hiddenMode === 2) continue; // Giấu hoàn toàn
        if (hiddenMode === 1 && i === 1) continue; // Giấu kẻ địch thứ 2

        const pt = currentTargets[i];
        const px = mapX(pt.x);
        const py = mapY(pt.y);
        
        ctx.fillStyle = (i === 0 && hiddenMode === 1) ? '#ff007f' : '#fc66fc'; // Màu đỏ cho kẻ lộ diện
        ctx.shadowColor = ctx.fillStyle;
        
        ctx.beginPath();
        ctx.arc(px, py, 7, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.shadowBlur = 0;
}

function renderLaserHead(x, y, angle) {
    ctx.save();
    ctx.translate(mapX(x), mapY(y));
    ctx.rotate(angle);
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#5cfc66';
    ctx.fillStyle = '#5cfc66';
    ctx.beginPath();
    ctx.moveTo(15, 0);       
    ctx.lineTo(-10, 6);      
    ctx.lineTo(-5, 0);       
    ctx.lineTo(-10, -6);     
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

let tempPath = [];
function drawFailedAttempt(compiledEq) {
    tempPath = [];
    for (let x = X_MIN; x <= X_MAX; x += 0.1) {
        try {
            const y = compiledEq.evaluate({ x });
            tempPath.push({ x, y });
        } catch (e) {}
    }
    setTimeout(() => { tempPath = []; render(); }, 2000);
    render();
}

function renderFunctionPath(pointsArray, color, shadowColor, lengthLimit = pointsArray.length) {
    if (pointsArray.length === 0) return;
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.shadowBlur = 15;
    ctx.shadowColor = shadowColor;
    ctx.lineJoin = 'round';
    
    let first = true;
    for (let i = 0; i < lengthLimit; i++) {
        const p = pointsArray[i];
        if (p.y > Y_MAX * 2 || p.y < Y_MIN * 2) { first = true; continue; }
        const px = mapX(p.x);
        const py = mapY(p.y);
        if (first) { ctx.moveTo(px, py); first = false; } 
        else { ctx.lineTo(px, py); }
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
}

function render() {
    ctx.clearRect(0, 0, cw, ch);
    renderGrid();
    renderParabolaShield(); 
    
    if (tempPath.length > 0) {
        renderFunctionPath(tempPath, 'rgba(252, 102, 102, 0.8)', 'rgba(252, 102, 102, 0.5)', tempPath.length);
    }

    renderPoints();

    if (gameState === 'ANIMATING') {
        renderFunctionPath(currentPath, '#5cfc66', '#00ff00', carAnimationIndex);
        
        if (carAnimationIndex > 0 && carAnimationIndex < currentPath.length) {
            const p = currentPath[carAnimationIndex - 1];
            let angle = 0;
            if (carAnimationIndex < currentPath.length) {
                const nextP = currentPath[carAnimationIndex];
                const dxCanvas = mapX(nextP.x) - mapX(p.x);
                const dyCanvas = mapY(nextP.y) - mapY(p.y);
                angle = Math.atan2(dyCanvas, dxCanvas);
            }
            renderLaserHead(p.x, p.y, angle);
        }
    }
}

let reqId;
function startSuccessAnimation(compiledEq) {
    gameState = 'ANIMATING';
    runBtn.disabled = true;
    formulaInput.disabled = true;

    currentPath = [];
    for (let x = X_MIN; x <= X_MAX; x += 0.2) {
        try {
            const y = compiledEq.evaluate({ x });
            if (y > Y_MIN * 3 && y < Y_MAX * 3) {
                currentPath.push({ x, y });
            }
        } catch (e) {}
    }

    carAnimationIndex = 0;
    animate();
}

function animate() {
    render();
    carAnimationIndex += 2;

    if (carAnimationIndex >= currentPath.length) {
        cancelAnimationFrame(reqId);
        completeLevel();
        return;
    }
    reqId = requestAnimationFrame(animate);
}

function completeLevel() {
    score += 1;
    scoreEl.innerText = score;
    scoreEl.style.transform = 'scale(1.5)';
    setTimeout(() => scoreEl.style.transform = 'scale(1)', 300);

    setTimeout(() => {
        if (!isPlaying) return;
        runBtn.disabled = false;
        formulaInput.disabled = false;
        generateLevel();
    }, 1500);
}

render();