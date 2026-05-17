// GAME STATE
const state = {
    level: 1, // 1: Maze, 2: Sandstorm, 3: Loops
    coins: 0,
    roverColor: '#cccccc',
    hasHat: false,
    workspaceBlocks: [],
    simRunning: false,
    gridSize: 50,
    rover: { x: 1, y: 1, dir: 0 }, // dir: 0=Right, 1=Down, 2=Left, 3=Up
    map: [],
    target: { x: 5, y: 5 },
    crystalsCollected: 0
};

// AUDIO
const playSound = (type) => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    
    if (type === 'ouch') {
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.2, ctx.currentTime); gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
        osc.start(); osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'coin') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime); gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
        osc.start(); osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'win') {
        osc.type = 'triangle'; osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.setValueAtTime(600, ctx.currentTime + 0.1); osc.frequency.setValueAtTime(800, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.2, ctx.currentTime); gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
        osc.start(); osc.stop(ctx.currentTime + 0.4);
    }
};

// LEVEL DESIGNS
const levels = {
    1: {
        title: "1. Laberinto de Rocas",
        blocks: [
            { id: 'fwd', class: 'block-move', text: 'Avanzar 1 Paso' },
            { id: 'right', class: 'block-turn', text: 'Girar Derecha' },
            { id: 'left', class: 'block-turn', text: 'Girar Izquierda' }
        ],
        map: [
            [1,1,1,1,1,1,1,1],
            [1,0,0,1,0,0,2,1],
            [1,1,0,1,0,1,1,1],
            [1,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1]
        ], // 0: path, 1: rock, 2: goal
        start: { x: 1, y: 1, dir: 1 },
        sandstorm: false
    },
    2: {
        title: "2. Tormenta de Arena",
        blocks: [
            { id: 'fwd', class: 'block-move', text: 'Avanzar' },
            { id: 'if-rock-left', class: 'block-sensor', text: 'SI Roca -> Girar Izq' },
            { id: 'if-rock-right', class: 'block-sensor', text: 'SI Roca -> Girar Der' }
        ],
        map: [
            [1,1,1,1,1,1,1,1],
            [1,0,0,0,1,2,1,1],
            [1,1,1,0,1,0,1,1],
            [1,0,0,0,0,0,1,1],
            [1,1,1,1,1,1,1,1]
        ],
        start: { x: 1, y: 3, dir: 0 },
        sandstorm: true
    },
    3: {
        title: "3. Recolección Infinita",
        blocks: [
            { id: 'loop-10', class: 'block-loop', text: 'REPETIR 10 VECES:' },
            { id: 'fwd', class: 'block-move', text: 'Avanzar' },
            { id: 'collect', class: 'block-move', text: 'Recolectar Cristal' }
        ],
        map: [
            [1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,3,3,3,3,3,3,3,3,3,2],
            [1,1,1,1,1,1,1,1,1,1,1,1]
        ], // 3: crystal
        start: { x: 1, y: 1, dir: 0 },
        sandstorm: false
    }
};

// INIT
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

document.getElementById('btn-start-game').onclick = () => {
    document.getElementById('intro-modal').classList.remove('active');
    loadLevel(1);
};

const loadLevel = (lvl) => {
    state.level = lvl;
    const lData = levels[lvl];
    document.getElementById('current-level-display').textContent = lData.title;
    
    // Setup Sandstorm
    const storm = document.getElementById('sandstorm-overlay');
    if (lData.sandstorm) storm.classList.remove('hidden');
    else storm.classList.add('hidden');
    
    // Setup Palette
    const pal = document.getElementById('block-palette');
    pal.innerHTML = '';
    lData.blocks.forEach(b => {
        const el = document.createElement('div');
        el.className = `code-block ${b.class}`;
        el.textContent = b.text;
        el.onclick = () => addBlockToWorkspace(b);
        pal.appendChild(el);
    });
    
    // Setup Map & Rover
    state.map = JSON.parse(JSON.stringify(lData.map)); // deep copy
    state.rover = { ...lData.start };
    state.workspaceBlocks = [];
    document.getElementById('workspace').innerHTML = '<div class="workspace-placeholder">Arrastra/Haz clic en los bloques</div>';
    
    drawGame();
};

const addBlockToWorkspace = (b) => {
    state.workspaceBlocks.push(b.id);
    const ws = document.getElementById('workspace');
    if(ws.querySelector('.workspace-placeholder')) ws.innerHTML = '';
    
    const el = document.createElement('div');
    el.className = `code-block ${b.class}`;
    el.textContent = b.text;
    ws.appendChild(el);
};

document.getElementById('btn-clear').onclick = () => {
    state.workspaceBlocks = [];
    document.getElementById('workspace').innerHTML = '<div class="workspace-placeholder">Arrastra/Haz clic en los bloques</div>';
};

// RENDERING
const drawGame = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const s = state.gridSize;
    const offsetX = (canvas.width - state.map[0].length * s) / 2;
    const offsetY = (canvas.height - state.map.length * s) / 2;
    
    for (let y = 0; y < state.map.length; y++) {
        for (let x = 0; x < state.map[y].length; x++) {
            const tile = state.map[y][x];
            const px = offsetX + x * s;
            const py = offsetY + y * s;
            
            // Draw floor
            ctx.fillStyle = '#4a2f2f'; ctx.fillRect(px, py, s, s);
            ctx.strokeStyle = '#2a1111'; ctx.strokeRect(px, py, s, s);
            
            if (tile === 1) { // Rock
                ctx.fillStyle = '#8b5a2b';
                ctx.beginPath(); ctx.arc(px+s/2, py+s/2, s/2.5, 0, Math.PI*2); ctx.fill();
            } else if (tile === 2) { // Goal (Panel)
                ctx.fillStyle = '#10b981'; ctx.fillRect(px+5, py+5, s-10, s-10);
            } else if (tile === 3) { // Crystal
                ctx.fillStyle = '#00f3ff';
                ctx.beginPath(); ctx.moveTo(px+s/2, py+5); ctx.lineTo(px+s-5, py+s/2); ctx.lineTo(px+s/2, py+s-5); ctx.lineTo(px+5, py+s/2); ctx.fill();
            }
        }
    }
    
    // Draw Rover
    const rx = offsetX + state.rover.x * s + s/2;
    const ry = offsetY + state.rover.y * s + s/2;
    
    ctx.save();
    ctx.translate(rx, ry);
    ctx.rotate(state.rover.dir * Math.PI/2);
    
    ctx.fillStyle = state.roverColor;
    ctx.fillRect(-15, -15, 30, 30);
    ctx.fillStyle = '#00f3ff'; // Eye
    ctx.fillRect(5, -5, 10, 10);
    
    if (state.hasHat) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(-10, -20, 20, 5); // Hat
    }
    
    ctx.restore();
};

// EXECUTION
const moveRover = (dx, dy) => {
    const nx = state.rover.x + dx;
    const ny = state.rover.y + dy;
    if (state.map[ny][nx] !== 1) { // Not rock
        state.rover.x = nx; state.rover.y = ny;
    } else {
        playSound('ouch');
        return false;
    }
    return true;
};

document.getElementById('btn-run').onclick = async () => {
    if (state.simRunning || state.workspaceBlocks.length === 0) return;
    state.simRunning = true;
    
    // Reset rover pos for run
    state.rover = { ...levels[state.level].start };
    drawGame();
    
    let execBlocks = [...state.workspaceBlocks];
    
    // If level 3 loop optimization
    if (state.level === 3 && execBlocks[0] === 'loop-10') {
        const loopContent = execBlocks.slice(1);
        execBlocks = [];
        for(let i=0; i<10; i++) execBlocks.push(...loopContent);
    }
    
    for (let i = 0; i < execBlocks.length; i++) {
        const b = execBlocks[i];
        
        // Direction vectors: 0:R, 1:D, 2:L, 3:U
        const dx = state.rover.dir === 0 ? 1 : state.rover.dir === 2 ? -1 : 0;
        const dy = state.rover.dir === 1 ? 1 : state.rover.dir === 3 ? -1 : 0;
        
        if (b === 'fwd') {
            const success = moveRover(dx, dy);
            if (!success) break;
        } else if (b === 'right') {
            state.rover.dir = (state.rover.dir + 1) % 4;
        } else if (b === 'left') {
            state.rover.dir = (state.rover.dir + 3) % 4;
        } else if (b === 'collect') {
            if (state.map[state.rover.y][state.rover.x] === 3) {
                state.map[state.rover.y][state.rover.x] = 0;
                playSound('coin');
                state.coins += 5;
                document.getElementById('coin-count').textContent = state.coins;
            }
        } else if (b.startsWith('if-rock')) {
            const nx = state.rover.x + dx; const ny = state.rover.y + dy;
            if (state.map[ny][nx] === 1) { // Sensor detected rock!
                if (b === 'if-rock-right') state.rover.dir = (state.rover.dir + 1) % 4;
                if (b === 'if-rock-left') state.rover.dir = (state.rover.dir + 3) % 4;
            }
        }
        
        drawGame();
        await new Promise(r => setTimeout(r, 400));
    }
    
    // Check Win
    if (state.map[state.rover.y][state.rover.x] === 2) {
        playSound('win');
        state.coins += 50;
        document.getElementById('coin-count').textContent = state.coins;
        
        if (state.level < 3) {
            alert("¡Nivel Completado! +50 Monedas");
            loadLevel(state.level + 1);
        } else {
            // BOSS LEVEL TIME!
            document.getElementById('boss-modal').classList.add('active');
        }
    } else {
        alert("¡Misión fallida! El rover no llegó al objetivo. Intenta de nuevo.");
        state.rover = { ...levels[state.level].start };
        drawGame();
    }
    
    state.simRunning = false;
};

// SHOP LOGIC
document.getElementById('btn-shop').onclick = () => document.getElementById('shop-modal').classList.add('active');
document.getElementById('close-shop').onclick = () => document.getElementById('shop-modal').classList.remove('active');

document.querySelectorAll('.shop-item').forEach(item => {
    item.onclick = () => {
        const price = parseInt(item.getAttribute('data-price'));
        if (state.coins >= price) {
            state.coins -= price;
            document.getElementById('coin-count').textContent = state.coins;
            playSound('coin');
            
            const type = item.getAttribute('data-type');
            if (type === 'color') state.roverColor = item.getAttribute('data-val');
            if (type === 'hat') state.hasHat = true;
            
            drawGame();
            alert("¡Compra exitosa! Equipado en Rover-X.");
        } else {
            playSound('ouch');
            alert("¡No tienes suficientes monedas! Supera niveles o recolecta cristales.");
        }
    };
});

// BOSS UPLOAD & DIPLOMA
document.getElementById('boss-upload').addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        playSound('win');
        document.getElementById('boss-modal').classList.remove('active');
        
        // Show Diploma
        const dModal = document.getElementById('diploma-modal');
        dModal.classList.add('active');
        
        const dc = document.getElementById('diploma-canvas');
        const dCtx = dc.getContext('2d');
        dCtx.fillStyle = '#111'; dCtx.fillRect(0,0,dc.width,dc.height);
        dCtx.strokeStyle = '#ff4747'; dCtx.lineWidth = 5; dCtx.strokeRect(10,10,dc.width-20, dc.height-20);
        dCtx.fillStyle = '#ff4747'; dCtx.font = "30px 'Space Grotesk'"; dCtx.textAlign = "center";
        dCtx.fillText("AGENCIA ESPACIAL DE ROBÓTICA", dc.width/2, 80);
        dCtx.fillStyle = '#fff'; dCtx.font = "20px 'Outfit'";
        dCtx.fillText("Certifica que el Astro-Ingeniero ha superado el", dc.width/2, 140);
        dCtx.fillStyle = '#00f3ff'; dCtx.font = "bold 25px 'Space Grotesk'";
        dCtx.fillText("NIVEL 3: EXPERTO EN LÓGICA Y MECÁNICA", dc.width/2, 200);
        dCtx.fillStyle = '#fff'; dCtx.font = "15px 'Outfit'";
        dCtx.fillText("Demostrando dominio en bucles, condicionales y construcción física.", dc.width/2, 260);
    }
});

document.getElementById('btn-download-diploma').onclick = () => {
    const dc = document.getElementById('diploma-canvas');
    const link = document.createElement('a');
    link.download = `Diploma_Nivel3_Odisea.png`;
    link.href = dc.toDataURL();
    link.click();
};
