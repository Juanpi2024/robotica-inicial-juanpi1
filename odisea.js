// GAME STATE
const state = {
    level: 1, 
    coins: 0,
    roverColor: '#cccccc',
    hasHat: false,
    workspaceBlocks: [],
    simRunning: false,
    gridSize: 55,
    rover: { x: 1, y: 1, dir: 0, visX: 1, visY: 1, visDir: 0 }, 
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
    } else if (type === 'move') {
        osc.type = 'square'; osc.frequency.setValueAtTime(100, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime); gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
        osc.start(); osc.stop(ctx.currentTime + 0.15);
    }
};

// LEVELS
const levels = {
    1: {
        title: "1. Laberinto de Rocas",
        blocks: [
            { id: 'fwd', class: 'block-move', text: 'Avanzar 1 Paso' },
            { id: 'right', class: 'block-turn', text: 'Girar Derecha' },
            { id: 'left', class: 'block-turn', text: 'Girar Izquierda' }
        ],
        map: [
            [1,1,1,1,1,1,1,1,1],
            [1,0,0,1,0,0,0,2,1],
            [1,1,0,1,0,1,1,1,1],
            [1,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1]
        ],
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
            [1,1,1,1,1,1,1,1,1],
            [1,0,0,0,1,2,1,1,1],
            [1,1,1,0,1,0,1,1,1],
            [1,0,0,0,0,0,1,1,1],
            [1,1,1,1,1,1,1,1,1]
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
        ],
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
    requestAnimationFrame(renderLoop); // Start fluid render loop
};

const loadLevel = (lvl) => {
    state.level = lvl;
    const lData = levels[lvl];
    document.getElementById('current-level-display').textContent = lData.title;
    document.getElementById('sim-status').textContent = "Esperando comandos...";
    
    const storm = document.getElementById('sandstorm-overlay');
    if (lData.sandstorm) storm.classList.remove('hidden');
    else storm.classList.add('hidden');
    
    const pal = document.getElementById('block-palette');
    pal.innerHTML = '';
    lData.blocks.forEach(b => {
        const el = document.createElement('div');
        el.className = `code-block ${b.class}`;
        el.textContent = b.text;
        el.onclick = () => addBlockToWorkspace(b);
        pal.appendChild(el);
    });
    
    state.map = JSON.parse(JSON.stringify(lData.map));
    state.rover = { ...lData.start, visX: lData.start.x, visY: lData.start.y, visDir: lData.start.dir };
    state.workspaceBlocks = [];
    document.getElementById('workspace').innerHTML = '<div class="workspace-placeholder">Haz clic en los bloques</div>';
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
    document.getElementById('workspace').innerHTML = '<div class="workspace-placeholder">Haz clic en los bloques</div>';
};

// SMOOTH RENDERING LOOP
const renderLoop = () => {
    // Interpolate visual position towards target position
    state.rover.visX += (state.rover.x - state.rover.visX) * 0.15;
    state.rover.visY += (state.rover.y - state.rover.visY) * 0.15;
    
    // Interpolate rotation smoothly
    let dDir = state.rover.dir - state.rover.visDir;
    if (dDir > 2) dDir -= 4;
    if (dDir < -2) dDir += 4;
    state.rover.visDir += dDir * 0.15;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const s = state.gridSize;
    const offsetX = (canvas.width - state.map[0].length * s) / 2;
    const offsetY = (canvas.height - state.map.length * s) / 2;
    
    // Draw Floor Grid
    for (let y = 0; y < state.map.length; y++) {
        for (let x = 0; x < state.map[y].length; x++) {
            const tile = state.map[y][x];
            const px = offsetX + x * s;
            const py = offsetY + y * s;
            
            ctx.fillStyle = '#2a1111'; ctx.fillRect(px, py, s, s);
            ctx.strokeStyle = '#4a1f1f'; ctx.lineWidth = 1; ctx.strokeRect(px, py, s, s);
            
            if (tile === 1) { // Rock (Beautiful Gradient)
                const grad = ctx.createRadialGradient(px+s/2, py+s/2, 5, px+s/2, py+s/2, s/2);
                grad.addColorStop(0, '#ff4747'); grad.addColorStop(1, '#8b2a2a');
                ctx.fillStyle = grad;
                ctx.beginPath(); ctx.arc(px+s/2, py+s/2, s/2.4, 0, Math.PI*2); ctx.fill();
            } else if (tile === 2) { // Goal
                ctx.fillStyle = '#10b981'; ctx.shadowColor = '#10b981'; ctx.shadowBlur = 15;
                ctx.fillRect(px+8, py+8, s-16, s-16); ctx.shadowBlur = 0;
            } else if (tile === 3) { // Crystal
                ctx.fillStyle = '#00f3ff'; ctx.shadowColor = '#00f3ff'; ctx.shadowBlur = 10;
                ctx.beginPath(); ctx.moveTo(px+s/2, py+10); ctx.lineTo(px+s-10, py+s/2); ctx.lineTo(px+s/2, py+s-10); ctx.lineTo(px+10, py+s/2); ctx.fill();
                ctx.shadowBlur = 0;
            }
        }
    }
    
    // Draw Rover
    const rx = offsetX + state.rover.visX * s + s/2;
    const ry = offsetY + state.rover.visY * s + s/2;
    
    ctx.save();
    ctx.translate(rx, ry);
    ctx.rotate(state.rover.visDir * Math.PI/2);
    
    // Chassis
    ctx.fillStyle = state.roverColor;
    ctx.shadowColor = state.roverColor; ctx.shadowBlur = 10;
    ctx.fillRect(-18, -14, 36, 28);
    ctx.shadowBlur = 0;
    
    // Wheels
    ctx.fillStyle = '#111';
    ctx.fillRect(-12, -18, 8, 4); ctx.fillRect(4, -18, 8, 4);
    ctx.fillRect(-12, 14, 8, 4); ctx.fillRect(4, 14, 8, 4);
    
    // Eye/Sensor
    ctx.fillStyle = '#00f3ff';
    ctx.fillRect(10, -6, 8, 12);
    
    if (state.hasHat) {
        ctx.fillStyle = '#ffea00';
        ctx.fillRect(-5, -20, 10, 40); // Simple wing/hat
    }
    ctx.restore();
    
    requestAnimationFrame(renderLoop);
};

// EXECUTION
const moveRover = (dx, dy) => {
    const nx = state.rover.x + dx;
    const ny = state.rover.y + dy;
    if (state.map[ny][nx] !== 1) { 
        state.rover.x = nx; state.rover.y = ny;
        playSound('move');
    } else {
        playSound('ouch');
        return false;
    }
    return true;
};

document.getElementById('btn-run').onclick = async () => {
    if (state.simRunning || state.workspaceBlocks.length === 0) return;
    state.simRunning = true;
    document.getElementById('sim-status').textContent = "Ejecutando secuencia... 🚀";
    
    // Reset pos for run
    const start = levels[state.level].start;
    state.rover.x = start.x; state.rover.y = start.y; state.rover.dir = start.dir;
    await new Promise(r => setTimeout(r, 300)); // wait for visual snap if we wanted it
    
    let execBlocks = [...state.workspaceBlocks];
    if (state.level === 3 && execBlocks[0] === 'loop-10') {
        const loopContent = execBlocks.slice(1);
        execBlocks = [];
        for(let i=0; i<10; i++) execBlocks.push(...loopContent);
    }
    
    for (let i = 0; i < execBlocks.length; i++) {
        const b = execBlocks[i];
        const dx = state.rover.dir === 0 ? 1 : state.rover.dir === 2 ? -1 : 0;
        const dy = state.rover.dir === 1 ? 1 : state.rover.dir === 3 ? -1 : 0;
        
        if (b === 'fwd') {
            if (!moveRover(dx, dy)) break;
        } else if (b === 'right') {
            state.rover.dir = (state.rover.dir + 1) % 4; playSound('move');
        } else if (b === 'left') {
            state.rover.dir = (state.rover.dir + 3) % 4; playSound('move');
        } else if (b === 'collect') {
            if (state.map[state.rover.y][state.rover.x] === 3) {
                state.map[state.rover.y][state.rover.x] = 0;
                playSound('coin'); state.coins += 5;
                document.getElementById('coin-count').textContent = state.coins;
            }
        } else if (b.startsWith('if-rock')) {
            const nx = state.rover.x + dx; const ny = state.rover.y + dy;
            if (state.map[ny][nx] === 1) { 
                if (b === 'if-rock-right') state.rover.dir = (state.rover.dir + 1) % 4;
                if (b === 'if-rock-left') state.rover.dir = (state.rover.dir + 3) % 4;
            }
        }
        await new Promise(r => setTimeout(r, 600)); // Wait for animation interpolation to catch up
    }
    
    if (state.map[state.rover.y][state.rover.x] === 2) {
        playSound('win');
        state.coins += 50;
        document.getElementById('coin-count').textContent = state.coins;
        document.getElementById('sim-status').textContent = "¡Misión Exitosa! 🎉";
        
        setTimeout(() => {
            if (state.level < 3) {
                alert("¡Nivel Completado! +50 Monedas");
                loadLevel(state.level + 1);
            } else {
                document.getElementById('boss-modal').classList.add('active');
            }
        }, 800);
    } else {
        document.getElementById('sim-status').textContent = "¡Desviado! Revisa tu código.";
        setTimeout(() => {
            alert("¡Misión fallida! El rover no llegó al objetivo. Intenta de nuevo.");
            const start = levels[state.level].start;
            state.rover.x = start.x; state.rover.y = start.y; state.rover.dir = start.dir;
        }, 500);
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
            state.coins -= price; document.getElementById('coin-count').textContent = state.coins;
            playSound('coin');
            const type = item.getAttribute('data-type');
            if (type === 'color') state.roverColor = item.getAttribute('data-val');
            if (type === 'hat') state.hasHat = true;
            alert("¡Compra exitosa! Equipado en Rover-X.");
        } else {
            playSound('ouch'); alert("¡No tienes suficientes monedas!");
        }
    };
});

// BOSS UPLOAD & DIPLOMA
document.getElementById('boss-upload').addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        playSound('win');
        document.getElementById('boss-modal').classList.remove('active');
        document.getElementById('diploma-modal').classList.add('active');
        
        const dc = document.getElementById('diploma-canvas'); const dCtx = dc.getContext('2d');
        dCtx.fillStyle = '#05010a'; dCtx.fillRect(0,0,dc.width,dc.height);
        dCtx.strokeStyle = '#00f3ff'; dCtx.lineWidth = 6; dCtx.strokeRect(15,15,dc.width-30, dc.height-30);
        dCtx.fillStyle = '#ff007f'; dCtx.font = "30px 'Space Grotesk'"; dCtx.textAlign = "center";
        dCtx.fillText("ACADEMIA DE ASTRO-INGENIERÍA", dc.width/2, 80);
        dCtx.fillStyle = '#fff'; dCtx.font = "20px 'Outfit'";
        dCtx.fillText("Certifica que el Astro-Ingeniero ha superado el", dc.width/2, 140);
        dCtx.fillStyle = '#00f3ff'; dCtx.font = "bold 28px 'Space Grotesk'";
        dCtx.fillText("NIVEL 3: EXPERTO EN LÓGICA Y MECÁNICA", dc.width/2, 200);
        dCtx.fillStyle = 'rgba(255,255,255,0.7)'; dCtx.font = "15px 'Outfit'";
        dCtx.fillText("Demostrando un excelente uso de bucles y construccionismo físico.", dc.width/2, 260);
    }
});

document.getElementById('btn-download-diploma').onclick = () => {
    const dc = document.getElementById('diploma-canvas');
    const link = document.createElement('a');
    link.download = `Diploma_Nivel3_Odisea.png`;
    link.href = dc.toDataURL(); link.click();
};
