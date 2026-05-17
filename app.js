/**
 * MISIÓN: CONSTRUCTOR DE ROBOTS GALÁCTICOS 🚀
 * Core Logic & Interactive Educational Engines
 * Dedicated to Cadete Juanpi (8 years old)
 */

// ==========================================================================
// 1. GLOBAL STATE & SOUND SYNTHESIZER ENGINE (Web Audio API)
// ==========================================================================
const state = {
    currentSection: 'intro',
    childName: 'Juanpi',
    drawingSaved: null,
    uploadedPhoto: null,
    
    // Phase 2 Hardware states
    motorSpeed: 0,
    spheroExpressionIndex: 0,
    asteroidDistance: 300,
    sensorBeepInterval: null,
    
    // Phase 3 Workspace coding blocks sequence
    codingSequence: [],
    simRunning: false,
    simTimeout: null,
    
    // Phase 4 Project states
    soccerLeverPower: 0,
    soccerPowerCharging: false,
    soccerPowerInterval: null,
};

// Advanced Web Audio API Space Sound Synthesizer
const SpaceSynth = {
    ctx: null,
    
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },
    
    playBeep(freq = 800, duration = 0.08, type = 'sine') {
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },
    
    playSuccess() {
        this.init();
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // Bright ascending arpeggio C major
        const now = this.ctx.currentTime;
        
        notes.forEach((freq, idx) => {
            const time = now + idx * 0.08;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, time);
            
            gain.gain.setValueAtTime(0.12, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start(time);
            osc.stop(time + 0.35);
        });
    },
    
    playError() {
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.25);
        
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(now + 0.25);
    },
    
    playLaser() {
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1500, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.15);
        
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(now + 0.15);
    },
    
    playStatic(duration = 0.5) {
        this.init();
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1000;
        filter.Q.value = 2;
        
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        
        noise.start();
    },
    
    playMotorHum(speed) {
        this.init();
        if (speed === 0) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(45 + speed * 15, this.ctx.currentTime); // Low engine pitch
        
        const lp = this.ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 120;
        
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
        
        osc.connect(lp);
        lp.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.5);
    },
    
    playAlarmSirena(active) {
        if (!active) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.linearRampToValueAtTime(800, now + 0.2);
        osc.frequency.linearRampToValueAtTime(500, now + 0.4);
        
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(now + 0.4);
    }
};

// ==========================================================================
// 2. SPA NAVIGATION TAB ROUTER
// ==========================================================================
const initNavigation = () => {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.mission-section');
    
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            SpaceSynth.playBeep(440, 0.05); // low tap
            
            navButtons.forEach(b => b.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active-section'));
            
            btn.classList.add('active');
            
            const activeSection = document.getElementById(`sect-${target}`);
            if (activeSection) {
                activeSection.classList.add('active-section');
                state.currentSection = target;
                
                // Initialize specific views on activate
                if (target === 'fase1') {
                    resizeCanvas();
                } else if (target === 'fase3') {
                    initMarsSim();
                } else if (target === 'fase4') {
                    initPhysicsKicker();
                    initCertificatePreview();
                }
            }
        });
    });
};

// ==========================================================================
// 3. VOICE ENGINE: MISSION NARRATOR (Web Speech Synthesis)
// ==========================================================================
const initVoiceCommander = () => {
    const listenBtn = document.getElementById('btn-listen-msg');
    const waveEl = document.getElementById('audio-wave');
    
    listenBtn.addEventListener('click', () => {
        listenBtn.blur();
        SpaceSynth.playStatic(0.8);
        
        // Timeout to simulate radio-static crackle before commander speaks
        setTimeout(() => {
            if ('speechSynthesis' in window) {
                // Cancel existing speech
                window.speechSynthesis.cancel();
                
                const welcomeText = `¡Hola, ${state.childName}! La NASA está explorando lo desconocido en el espacio y necesita tu ayuda para construir los exploradores del futuro. Los robots son máquinas increíbles que pueden hacer tareas muy peligrosas o repetitivas por nosotros, ¡como caminar sobre la Luna o Marte! ¡Misión unete a mi flota espacial!`;
                
                const utterance = new SpeechSynthesisUtterance(welcomeText);
                utterance.lang = 'es-ES';
                utterance.rate = 0.95; // Slightly slower, highly friendly
                utterance.pitch = 1.0;  // Standard tone
                
                // Fetch Spanish voices if loaded
                const voices = window.speechSynthesis.getVoices();
                const preferredVoice = voices.find(v => v.lang.startsWith('es') && (v.name.includes('Google') || v.name.includes('Microsoft')));
                if (preferredVoice) {
                    utterance.voice = preferredVoice;
                }
                
                utterance.onstart = () => {
                    waveEl.classList.add('playing');
                };
                
                utterance.onend = () => {
                    waveEl.classList.remove('playing');
                };
                
                utterance.onerror = () => {
                    waveEl.classList.remove('playing');
                };
                
                window.speechSynthesis.speak(utterance);
            } else {
                alert("La voz robótica no es compatible con este navegador, ¡pero puedes leer los mensajes de la misión!");
            }
        }, 600);
    });
};

// ==========================================================================
// 4. FASE 1: DRAWING BLUEPRINT BOARD (Blueprint Paint Canvas)
// ==========================================================================
let paintCanvas, paintCtx;
let isDrawing = false;
let drawColor = '#00f3ff';
let drawSize = 5;
let drawTool = 'pencil'; // pencil, brush, eraser

const initDrawingBoard = () => {
    paintCanvas = document.getElementById('blueprint-canvas');
    paintCtx = paintCanvas.getContext('2d');
    
    // Set line endings
    paintCtx.lineCap = 'round';
    paintCtx.lineJoin = 'round';
    
    // Touch & Mouse Listeners
    paintCanvas.addEventListener('mousedown', startPaint);
    paintCanvas.addEventListener('mousemove', drawPaint);
    paintCanvas.addEventListener('mouseup', stopPaint);
    paintCanvas.addEventListener('mouseleave', stopPaint);
    
    paintCanvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = paintCanvas.getBoundingClientRect();
        startPaint({
            clientX: touch.clientX,
            clientY: touch.clientY
        });
    });
    
    paintCanvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        drawPaint({
            clientX: touch.clientX,
            clientY: touch.clientY
        });
    });
    
    paintCanvas.addEventListener('touchend', stopPaint);
    
    // Tool buttons select
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            drawColor = btn.getAttribute('data-color');
            if (drawTool === 'eraser') {
                drawTool = 'pencil';
                document.getElementById('tool-pencil').classList.add('active');
                document.getElementById('tool-eraser').classList.remove('active');
            }
            SpaceSynth.playBeep(600, 0.05);
        });
    });
    
    const setTool = (tool, btnId) => {
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(btnId).classList.add('active');
        drawTool = tool;
        SpaceSynth.playBeep(600, 0.05);
    };
    
    document.getElementById('tool-pencil').addEventListener('click', () => setTool('pencil', 'tool-pencil'));
    document.getElementById('tool-brush').addEventListener('click', () => setTool('brush', 'tool-brush'));
    document.getElementById('tool-eraser').addEventListener('click', () => setTool('eraser', 'tool-eraser'));
    
    // Brush size slider
    const sizeSlider = document.getElementById('brush-size');
    const sizeDisplay = document.getElementById('brush-size-val');
    sizeSlider.addEventListener('input', (e) => {
        drawSize = e.target.value;
        sizeDisplay.textContent = `${drawSize}px`;
    });
    
    // Clear blueprint canvas
    document.getElementById('paint-clear').addEventListener('click', () => {
        if(confirm("¿Quieres borrar todo tu boceto para empezar de nuevo?")) {
            paintCtx.clearRect(0, 0, paintCanvas.width, paintCanvas.height);
            SpaceSynth.playError();
        }
    });
    
    // Save to Bitácora local storage
    document.getElementById('paint-save').addEventListener('click', () => {
        state.drawingSaved = paintCanvas.toDataURL();
        SpaceSynth.playSuccess();
        alert("🚀 ¡Plano guardado con éxito en tu bitácora estelar!");
        initCertificatePreview();
    });
    
    // PNG Blueprint download
    document.getElementById('paint-download').addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = `plano_robot_${state.childName}.png`;
        link.href = paintCanvas.toDataURL();
        link.click();
        SpaceSynth.playBeep(900, 0.1);
    });
};

const resizeCanvas = () => {
    // Only adjust visually. Since it's fixed 700x450 internally, scale handles are responsive.
};

const startPaint = (e) => {
    isDrawing = true;
    const rect = paintCanvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * paintCanvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * paintCanvas.height;
    
    paintCtx.beginPath();
    paintCtx.moveTo(x, y);
    SpaceSynth.playBeep(200, 0.02, 'triangle');
};

const drawPaint = (e) => {
    if (!isDrawing) return;
    const rect = paintCanvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * paintCanvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * paintCanvas.height;
    
    paintCtx.lineTo(x, y);
    
    if (drawTool === 'eraser') {
        paintCtx.strokeStyle = '#07071e';
        paintCtx.lineWidth = drawSize * 1.5;
        paintCtx.shadowBlur = 0;
    } else {
        paintCtx.strokeStyle = drawColor;
        paintCtx.lineWidth = drawSize;
        
        if (drawTool === 'brush') {
            paintCtx.shadowColor = drawColor;
            paintCtx.shadowBlur = 8;
        } else {
            paintCtx.shadowBlur = 0; // crisp thin pencil
        }
    }
    
    paintCtx.stroke();
};

const stopPaint = () => {
    isDrawing = false;
};

// ==========================================================================
// 5. FASE 2: HARDWARE TOYS & PROXIMITY SENSOR
// ==========================================================================
const initHardwareToys = () => {
    
    // A. MOTOR WE DO SPEED ADJUSTER
    const speedButtons = document.querySelectorAll('.btn-speed');
    const gear1 = document.getElementById('motor-gear-1');
    const gear2 = document.getElementById('motor-gear-2');
    
    speedButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            speedButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const speed = parseInt(btn.getAttribute('data-speed'));
            state.motorSpeed = speed;
            
            // Adjust spin speeds in CSS
            if (speed === 0) {
                gear1.style.animationDuration = '0s';
                gear2.style.animationDuration = '0s';
            } else if (speed === 1) {
                gear1.style.animationDuration = '3s';
                gear2.style.animationDuration = '3s';
            } else if (speed === 3) {
                gear1.style.animationDuration = '0.5s';
                gear2.style.animationDuration = '0.5s';
            }
            
            SpaceSynth.playMotorHum(speed);
        });
    });
    
    // B. SPHERO BOLT LED MATRIX
    const matrixContainer = document.getElementById('led-matrix');
    
    // Render 8x8 pixel dots
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const pixel = document.createElement('div');
            pixel.className = 'led-pixel';
            pixel.setAttribute('data-row', r);
            pixel.setAttribute('data-col', c);
            matrixContainer.appendChild(pixel);
        }
    }
    
    // Led expressions definitions
    const expressions = [
        // 😄 SMILE
        [
            "00111100",
            "01000010",
            "10100101",
            "10000001",
            "10100101",
            "10011001",
            "01000010",
            "00111100"
        ],
        // ❤️ HEART
        [
            "01100110",
            "11111111",
            "11111111",
            "01111110",
            "00111100",
            "00011000",
            "00000000",
            "00000000"
        ],
        // 😮 SURPRISE
        [
            "00111100",
            "01000010",
            "10100101",
            "10000001",
            "10011001",
            "10100101",
            "01011010",
            "00111100"
        ],
        // 🤖 ROBOT
        [
            "11111111",
            "10100101",
            "11111111",
            "01111110",
            "01011010",
            "01111110",
            "10000001",
            "11111111"
        ],
        // 😉 WINK
        [
            "00111100",
            "01000010",
            "10100111",
            "10000001",
            "10100101",
            "10011001",
            "01000010",
            "00111100"
        ]
    ];
    
    const drawExpression = (exprArray) => {
        const pixels = matrixContainer.querySelectorAll('.led-pixel');
        pixels.forEach(p => p.classList.remove('active'));
        
        exprArray.forEach((rowStr, rIdx) => {
            for (let cIdx = 0; cIdx < 8; cIdx++) {
                if (rowStr[cIdx] === '1') {
                    const pIndex = rIdx * 8 + cIdx;
                    pixels[pIndex].classList.add('active');
                }
            }
        });
    };
    
    // Draw default smile
    drawExpression(expressions[0]);
    
    document.getElementById('btn-bolt-mood').addEventListener('click', () => {
        state.spheroExpressionIndex = (state.spheroExpressionIndex + 1) % expressions.length;
        drawExpression(expressions[state.spheroExpressionIndex]);
        SpaceSynth.playBeep(880, 0.06);
    });
    
    const orb = document.getElementById('sphero-bolt-orb');
    document.getElementById('btn-bolt-gyro').addEventListener('click', () => {
        orb.style.transition = 'transform 1.2s cubic-bezier(0.25, 0.8, 0.25, 1)';
        orb.style.transform = 'rotateZ(360deg)';
        SpaceSynth.playLaser();
        
        setTimeout(() => {
            orb.style.transition = 'none';
            orb.style.transform = 'rotateZ(0deg)';
        }, 1250);
    });
    
    // C. DRAGGABLE ULTRASONIC RANGE RADAR
    const asteroid = document.getElementById('draggable-asteroid');
    const sensorSim = asteroid.parentElement;
    const waves = document.getElementById('radar-waves');
    const distText = document.getElementById('sensor-distance');
    const statusText = document.getElementById('sensor-status');
    let isDraggingAsteroid = false;
    
    asteroid.addEventListener('mousedown', () => {
        isDraggingAsteroid = true;
        asteroid.style.cursor = 'grabbing';
    });
    
    window.addEventListener('mouseup', () => {
        isDraggingAsteroid = false;
        asteroid.style.cursor = 'grab';
    });
    
    sensorSim.addEventListener('mousemove', (e) => {
        if (!isDraggingAsteroid) return;
        
        const rect = sensorSim.getBoundingClientRect();
        let posX = e.clientX - rect.left - 32; // Half asteroid size
        
        // Boundary check (keep on right side of simulator box)
        if (posX < 80) posX = 80;
        if (posX > rect.width - 70) posX = rect.width - 70;
        
        asteroid.style.right = 'auto';
        asteroid.style.left = `${posX}px`;
        
        // Calculate dynamic proximity distance
        const sensorX = 52; // Sensor centers
        const diffX = posX - sensorX;
        const rawDistance = Math.round(diffX * 1.25); // map scale to 10-350 cm
        state.asteroidDistance = rawDistance;
        
        distText.textContent = rawDistance;
        
        // Proximity audio feedback speed controller
        clearInterval(state.sensorBeepInterval);
        
        if (rawDistance < 80) {
            statusText.textContent = "CRÍTICO 🔴 - ¡Colisión inminente!";
            statusText.className = "alert-status critical";
            waves.style.filter = 'hue-rotate(120deg) saturate(3)'; // turn warning red
            
            // Fast siren alarm beeps
            state.sensorBeepInterval = setInterval(() => {
                SpaceSynth.playBeep(980, 0.05, 'sawtooth');
            }, 180);
        } else if (rawDistance < 180) {
            statusText.textContent = "ADVERTENCIA 🟡 - Cuidado";
            statusText.className = "alert-status";
            statusText.style.color = 'var(--orange-glow)';
            statusText.style.textShadow = '0 0 5px var(--orange-glow)';
            waves.style.filter = 'hue-rotate(60deg) saturate(2)'; // turn orange
            
            // Moderate warning clicks
            state.sensorBeepInterval = setInterval(() => {
                SpaceSynth.playBeep(520, 0.08);
            }, 500);
        } else {
            statusText.textContent = "SEGURO 🟢";
            statusText.className = "alert-status";
            statusText.removeAttribute('style');
            waves.style.filter = 'none'; // cyan
        }
    });
};

// ==========================================================================
// 6. FASE 3: MARS BLOCK PROGRAMMING IDE SIMULATOR
// ==========================================================================
let marsCanvas, marsCtx;
let robotSimX = 50;
let simProgress = 0.0;
const challengeSequence = ['mover', 'esperar', 'detectar', 'detener'];

const initMarsSim = () => {
    marsCanvas = document.getElementById('mars-sim-canvas');
    marsCtx = marsCanvas.getContext('2d');
    
    // Draw initial idle Mars canvas state
    drawMarsSimulation(robotSimX, false);
    
    // Block Palette Click to Add Handlers
    document.querySelectorAll('.palette-container .code-block').forEach(block => {
        block.onclick = () => {
            const blockType = block.getAttribute('data-block-type');
            addBlockToWorkspace(blockType, block.innerHTML);
            SpaceSynth.playBeep(700, 0.04);
        };
    });
    
    document.getElementById('workspace-clear').onclick = () => {
        state.codingSequence = [];
        renderWorkspaceBlocks();
        resetMarsSim();
        SpaceSynth.playError();
    };
    
    document.getElementById('btn-run-simulation').onclick = runMarsProgram;
    document.getElementById('btn-reset-simulation').onclick = resetMarsSim;
};

const addBlockToWorkspace = (type, innerHTML) => {
    state.codingSequence.push({
        id: 'block-' + Date.now() + Math.random().toString(36).substr(2, 4),
        type: type,
        html: innerHTML
    });
    renderWorkspaceBlocks();
};

const renderWorkspaceBlocks = () => {
    const ws = document.getElementById('blocks-workspace');
    const emptyMsg = document.getElementById('workspace-empty');
    
    // Remove old block items
    ws.querySelectorAll('.workspace-block-wrapper').forEach(el => el.remove());
    
    if (state.codingSequence.length === 0) {
        emptyMsg.style.display = 'flex';
        return;
    }
    
    emptyMsg.style.display = 'none';
    
    state.codingSequence.forEach((block, idx) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'workspace-block-wrapper';
        wrapper.setAttribute('data-id', block.id);
        
        let blockClass = '';
        if (block.type === 'mover') blockClass = 'block-move';
        else if (block.type === 'esperar') blockClass = 'block-wait';
        else if (block.type === 'detectar') blockClass = 'block-sensor';
        else if (block.type === 'detener') blockClass = 'block-stop';
        
        wrapper.innerHTML = `
            <div class="code-block ${blockClass}">
                ${block.html}
                <button class="btn-block-delete" onclick="removeWorkspaceBlock('${block.id}')">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        `;
        ws.appendChild(wrapper);
    });
};

// Global scope binder to handle dynamic onclick element deletions
window.removeWorkspaceBlock = (id) => {
    state.codingSequence = state.codingSequence.filter(b => b.id !== id);
    renderWorkspaceBlocks();
    SpaceSynth.playBeep(300, 0.05);
};

const drawMarsSimulation = (robotX, isScanning = false, scanDist = 0, timerVal = "0.0s") => {
    // Clear sim frame
    marsCtx.clearRect(0, 0, marsCanvas.width, marsCanvas.height);
    
    // Draw Mars orange atmosphere gradient background
    const bgGrad = marsCtx.createLinearGradient(0, 0, 0, marsCanvas.height);
    bgGrad.addColorStop(0, '#1c0704');
    bgGrad.addColorStop(0.5, '#40150b');
    bgGrad.addColorStop(1, '#852b16');
    marsCtx.fillStyle = bgGrad;
    marsCtx.fillRect(0, 0, marsCanvas.width, marsCanvas.height);
    
    // Draw tiny stars
    marsCtx.fillStyle = '#fff';
    marsCtx.fillRect(80, 40, 2, 2);
    marsCtx.fillRect(200, 80, 1.5, 1.5);
    marsCtx.fillRect(350, 50, 2, 2);
    marsCtx.fillRect(20, 100, 1, 1);
    
    // Draw dusty Mars Ground surface
    marsCtx.fillStyle = '#b84428';
    marsCtx.beginPath();
    marsCtx.moveTo(0, 280);
    marsCtx.lineTo(290, 280);
    
    // Draw Crater outline curves on right side
    marsCtx.bezierCurveTo(310, 310, 360, 310, 380, 280);
    marsCtx.lineTo(marsCanvas.width, 280);
    marsCtx.lineTo(marsCanvas.width, marsCanvas.height);
    marsCtx.lineTo(0, marsCanvas.height);
    marsCtx.closePath();
    marsCtx.fill();
    
    // Draw lava glow inside crater
    marsCtx.fillStyle = '#ff3300';
    marsCtx.beginPath();
    marsCtx.ellipse(335, 290, 30, 8, 0, 0, 2 * Math.PI);
    marsCtx.fill();
    
    // Draw rocky planet surface mountains details
    marsCtx.fillStyle = '#6e2717';
    marsCtx.beginPath();
    marsCtx.moveTo(0, 280);
    marsCtx.lineTo(30, 260);
    marsCtx.lineTo(70, 280);
    marsCtx.fill();
    
    marsCtx.beginPath();
    marsCtx.moveTo(220, 280);
    marsCtx.lineTo(250, 255);
    marsCtx.lineTo(280, 280);
    marsCtx.fill();
    
    // Draw NASA Crater caution signpost
    marsCtx.fillStyle = '#ff7700';
    marsCtx.fillRect(285, 220, 3, 60);
    marsCtx.beginPath();
    marsCtx.moveTo(270, 220);
    marsCtx.lineTo(303, 220);
    marsCtx.lineTo(286, 195);
    marsCtx.closePath();
    marsCtx.fill();
    marsCtx.fillStyle = '#000';
    marsCtx.font = "bold 10px Outfit";
    marsCtx.fillText("!", 284, 215);
    
    // Draw Laser scanner beams if code is scanning
    if (isScanning) {
        marsCtx.strokeStyle = 'rgba(57, 255, 20, 0.8)';
        marsCtx.lineWidth = 3;
        marsCtx.shadowColor = '#39ff14';
        marsCtx.shadowBlur = 10;
        marsCtx.beginPath();
        marsCtx.moveTo(robotX + 45, 248); // Sensor position
        marsCtx.lineTo(315, 290); // Laser hits crater wall
        marsCtx.stroke();
        marsCtx.shadowBlur = 0; // reset
    }
    
    // Draw NASA cute space robot
    drawSpaceRobot(robotX, 230);
};

const drawSpaceRobot = (x, y) => {
    // Body metal plates chassis
    marsCtx.fillStyle = '#e5e7eb';
    marsCtx.strokeStyle = '#9ca3af';
    marsCtx.lineWidth = 2;
    marsCtx.beginPath();
    marsCtx.roundRect(x, y + 10, 48, 30, 8);
    marsCtx.fill();
    marsCtx.stroke();
    
    // NASA Blue sticker logo decal
    marsCtx.fillStyle = '#1e3a8a';
    marsCtx.beginPath();
    marsCtx.arc(x + 24, y + 25, 6, 0, 2 * Math.PI);
    marsCtx.fill();
    marsCtx.fillStyle = '#fff';
    marsCtx.font = "italic bold 6px 'Space Grotesk'";
    marsCtx.fillText("NASA", x + 18, y + 27);
    
    // Robot neck connection
    marsCtx.fillStyle = '#4b5563';
    marsCtx.fillRect(x + 20, y + 4, 8, 8);
    
    // Robot visor eyes head
    marsCtx.fillStyle = '#111827';
    marsCtx.strokeStyle = '#00f3ff';
    marsCtx.lineWidth = 1.5;
    marsCtx.beginPath();
    marsCtx.roundRect(x + 12, y - 6, 24, 12, 4);
    marsCtx.fill();
    marsCtx.stroke();
    
    // Cyan glow visor lens
    marsCtx.fillStyle = '#00f3ff';
    marsCtx.beginPath();
    marsCtx.arc(x + 20, y, 3, 0, 2 * Math.PI);
    marsCtx.arc(x + 28, y, 3, 0, 2 * Math.PI);
    marsCtx.fill();
    
    // Spinner crawler wheels (CSS loops triggers gear rotation representation)
    marsCtx.fillStyle = '#374151';
    marsCtx.beginPath();
    marsCtx.arc(x + 8, y + 40, 7, 0, 2 * Math.PI);
    marsCtx.arc(x + 40, y + 40, 7, 0, 2 * Math.PI);
    marsCtx.fill();
    
    marsCtx.fillStyle = '#f3f4f6';
    marsCtx.beginPath();
    marsCtx.arc(x + 8, y + 40, 3, 0, 2 * Math.PI);
    marsCtx.arc(x + 40, y + 40, 3, 0, 2 * Math.PI);
    marsCtx.fill();
};

const runMarsProgram = () => {
    if (state.codingSequence.length === 0) {
        alert("🚨 ¡Tu consola de órdenes está vacía! Primero agrega bloques para programar tu robot.");
        return;
    }
    
    if (state.simRunning) return;
    
    state.simRunning = true;
    const badge = document.getElementById('sim-status-badge');
    badge.textContent = "EN MARCHA";
    badge.className = "sim-badge running";
    
    robotSimX = 50;
    simProgress = 0.0;
    
    const wsBlocks = document.querySelectorAll('#blocks-workspace .code-block');
    wsBlocks.forEach(b => b.classList.remove('highlight-run'));
    
    // Compile sequence verification
    const compiledTypes = state.codingSequence.map(b => b.type);
    
    let blockIndex = 0;
    
    const executeNextStep = () => {
        if (blockIndex >= state.codingSequence.length) {
            // End of block program, check final results!
            verifyFinalMarsPosition(compiledTypes);
            return;
        }
        
        const activeBlock = state.codingSequence[blockIndex];
        const blockEl = wsBlocks[blockIndex];
        blockEl.classList.add('highlight-run');
        
        // Run logic per block type
        if (activeBlock.type === 'mover') {
            SpaceSynth.playMotorHum(1);
            let steps = 0;
            const driveInterval = setInterval(() => {
                robotSimX += 4;
                drawMarsSimulation(robotSimX);
                steps++;
                
                if (steps >= 20) { // Drive animation distance
                    clearInterval(driveInterval);
                    blockEl.classList.remove('highlight-run');
                    blockIndex++;
                    executeNextStep();
                }
            }, 50);
            
        } else if (activeBlock.type === 'esperar') {
            let countdown = 5.0;
            const timerEl = document.getElementById('sim-timer');
            
            const timerInterval = setInterval(() => {
                countdown -= 0.5;
                timerEl.textContent = `${countdown.toFixed(1)}s`;
                SpaceSynth.playBeep(400, 0.03);
                
                if (countdown <= 0) {
                    clearInterval(timerInterval);
                    timerEl.textContent = "0.0s";
                    blockEl.classList.remove('highlight-run');
                    blockIndex++;
                    executeNextStep();
                }
            }, 500);
            
        } else if (activeBlock.type === 'detectar') {
            SpaceSynth.playLaser();
            drawMarsSimulation(robotSimX, true); // True triggers glowing laser scan
            
            const lidarEl = document.getElementById('sim-lidar');
            let dist = 300;
            const scanAnim = setInterval(() => {
                dist -= 20;
                lidarEl.textContent = `${dist}m`;
                if (dist <= 50) {
                    clearInterval(scanAnim);
                    lidarEl.textContent = "45m ⚠️";
                    drawMarsSimulation(robotSimX, false); // clear scan laser
                    blockEl.classList.remove('highlight-run');
                    blockIndex++;
                    executeNextStep();
                }
            }, 80);
            
        } else if (activeBlock.type === 'detener') {
            SpaceSynth.playBeep(300, 0.15, 'sawtooth');
            blockEl.classList.remove('highlight-run');
            blockIndex++;
            executeNextStep();
        }
    };
    
    // Start block thread
    executeNextStep();
};

const verifyFinalMarsPosition = (compiledTypes) => {
    const badge = document.getElementById('sim-status-badge');
    state.simRunning = false;
    
    // Match exact logical goal: Mover -> Esperar -> Detectar -> Detener
    const exactMatch = compiledTypes.length === 4 &&
                       compiledTypes[0] === 'mover' &&
                       compiledTypes[1] === 'esperar' &&
                       compiledTypes[2] === 'detectar' &&
                       compiledTypes[3] === 'detener';
                       
    if (exactMatch && robotSimX >= 120 && robotSimX <= 220) {
        // Safe stop: Success!
        badge.textContent = "LOGRADO";
        badge.className = "sim-badge success";
        SpaceSynth.playSuccess();
        
        // Confetti celebration chimes trigger
        triggerStarConfetti();
        
        // Draw green defensive shield surrounding the robot
        marsCtx.strokeStyle = '#39ff14';
        marsCtx.lineWidth = 4;
        marsCtx.shadowColor = '#39ff14';
        marsCtx.shadowBlur = 15;
        marsCtx.beginPath();
        marsCtx.arc(robotSimX + 24, 250, 42, 0, 2 * Math.PI);
        marsCtx.stroke();
        marsCtx.shadowBlur = 0;
        
        alert(`🎉 ¡EXCELENTE, INGENIERO ${state.childName.toUpperCase()}! Tu robot se detuvo justo a tiempo antes del cráter. Has superado el reto y programado con maestría.`);
    } else {
        // Failure: Robot falls inside
        badge.textContent = "ESTRELLADO";
        badge.className = "sim-badge crashed";
        SpaceSynth.playError();
        
        // Falling crash physics animation
        let fallY = 230;
        const fallInterval = setInterval(() => {
            robotSimX += 2;
            fallY += 6;
            marsCtx.clearRect(0, 0, marsCanvas.width, marsCanvas.height);
            drawMarsSimulation(robotSimX);
            drawSpaceRobot(robotSimX, fallY);
            
            if (fallY >= 320) {
                clearInterval(fallInterval);
                
                // Draw funny boom smoke puff
                marsCtx.fillStyle = 'rgba(255, 119, 0, 0.7)';
                marsCtx.beginPath();
                marsCtx.arc(robotSimX + 20, 310, 25, 0, 2 * Math.PI);
                marsCtx.arc(robotSimX + 35, 310, 20, 0, 2 * Math.PI);
                marsCtx.fill();
                
                alert("💥 ¡Oh no! El robot no se detuvo y cayó dentro del cráter marciano. Recuerda: debes moverte adelante, esperar 5s, detectar el peligro y detenerte.");
            }
        }, 30);
    }
};

const resetMarsSim = () => {
    state.simRunning = false;
    robotSimX = 50;
    
    const badge = document.getElementById('sim-status-badge');
    badge.textContent = "LISTO";
    badge.className = "sim-badge";
    
    document.getElementById('sim-timer').textContent = "0.0s";
    document.getElementById('sim-lidar').textContent = "300m";
    
    const wsBlocks = document.querySelectorAll('#blocks-workspace .code-block');
    wsBlocks.forEach(b => b.classList.remove('highlight-run'));
    
    drawMarsSimulation(robotSimX, false);
    SpaceSynth.playBeep(500, 0.05);
};

// ==========================================================================
// 7. FASE 4: BITÁCORA PHYSICAL PROJECTS
// ==========================================================================
let kickerCanvas, kickerCtx;
let kickerLeverAngle = 0; // Kicker physical lever pull angle
let kickerBallX = 70;
let kickerBallY = 115;
let kickerBallVX = 0;
let kickerBallVY = 0;
let isLeverAnimating = false;

const initPhysicsKicker = () => {
    kickerCanvas = document.getElementById('kicker-canvas');
    kickerCtx = kickerCanvas.getContext('2d');
    
    drawKickerStage();
    
    // Roberto mechanical mouth slider
    const jawSlider = document.getElementById('roberto-slider-mouth');
    const jawElement = document.getElementById('roberto-jaw-el');
    
    jawSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        jawElement.style.bottom = `${12 - val/3.5}px`; // animate puppet mouth
    });
    
    // Play cool robotic synthesizer speech beep clicks
    document.getElementById('btn-roberto-talk').onclick = () => {
        SpaceSynth.playBeep(350, 0.08, 'sawtooth');
        setTimeout(() => SpaceSynth.playBeep(450, 0.06, 'sawtooth'), 100);
        setTimeout(() => SpaceSynth.playBeep(300, 0.1, 'sawtooth'), 180);
        
        // Walk trigger modal
        document.getElementById('modal-roberto').style.display = 'flex';
    };
    
    document.getElementById('btn-close-roberto').onclick = () => {
        document.getElementById('modal-roberto').style.display = 'none';
        SpaceSynth.playBeep(500, 0.05);
    };
    
    // Anti-frost cryo alert simulator
    const tempSlider = document.getElementById('temp-slider');
    const tempDisplay = document.getElementById('temp-display');
    const tempStatus = document.getElementById('temp-status');
    const ambient = document.getElementById('weather-ambient');
    const strobe = document.getElementById('frost-strobe');
    let alarmTimer = null;
    
    tempSlider.addEventListener('input', (e) => {
        const temp = parseInt(e.target.value);
        tempDisplay.textContent = `${temp}°C`;
        
        if (temp < 0) {
            tempStatus.textContent = "ALERTA DE HELADA 🥶";
            ambient.style.background = 'radial-gradient(circle, #004466 0%, #060517 100%)';
            strobe.classList.add('blinking');
            
            // Trigger loop alarm beep sounds
            if(!alarmTimer) {
                alarmTimer = setInterval(() => {
                    SpaceSynth.playAlarmSirena(true);
                }, 800);
            }
        } else {
            tempStatus.textContent = temp > 35 ? "Calor Extremo 🥵" : "Clima Templado 🟢";
            ambient.style.background = '#060517';
            strobe.classList.remove('blinking');
            
            clearInterval(alarmTimer);
            alarmTimer = null;
        }
    });
    
    // Soccer Moon Kicker Physics Catapult buttons
    document.getElementById('btn-kicker-pull').onclick = () => {
        if(isLeverAnimating) return;
        SpaceSynth.playBeep(250, 0.1, 'triangle');
        kickerLeverAngle = -Math.PI / 4; // pull 45 degs back
        state.soccerLeverPower = 80;
        document.getElementById('kicker-power-meter').style.width = '80%';
        drawKickerStage();
    };
    
    document.getElementById('btn-kicker-shoot').onclick = () => {
        if(isLeverAnimating || kickerLeverAngle === 0) return;
        
        isLeverAnimating = true;
        SpaceSynth.playBeep(180, 0.1, 'sawtooth'); // spring snap snap sound
        
        // Spring recoil snap animation
        let snapSpeed = 0.15;
        const shootTimer = setInterval(() => {
            kickerLeverAngle += snapSpeed;
            if (kickerLeverAngle >= 0.05) {
                kickerLeverAngle = 0;
                clearInterval(shootTimer);
                
                // Kick ball physical forces (apply Moon low gravity)
                SpaceSynth.playBeep(250, 0.08, 'sine'); // thud sound
                
                kickerBallVX = (state.soccerLeverPower / 10) * 1.8;
                kickerBallVY = -(state.soccerLeverPower / 10) * 1.5;
                
                animateMoonSoccerBall();
            }
            drawKickerStage();
        }, 20);
    };
};

const drawKickerStage = () => {
    kickerCtx.clearRect(0, 0, kickerCanvas.width, kickerCanvas.height);
    
    // Draw physics pitch coordinates
    kickerCtx.fillStyle = '#060517';
    kickerCtx.fillRect(0, 0, kickerCanvas.width, kickerCanvas.height);
    
    // Pitch floor line
    kickerCtx.strokeStyle = 'rgba(255,255,255,0.2)';
    kickerCtx.lineWidth = 2;
    kickerCtx.beginPath();
    kickerCtx.moveTo(0, 130);
    kickerCtx.lineTo(kickerCanvas.width, 130);
    kickerCtx.stroke();
    
    // Draw goal post on far right
    kickerCtx.strokeStyle = '#fff';
    kickerCtx.strokeRect(240, 70, 40, 60);
    
    // Draw Kicker Mech Lever (lever fulcrum anchor at x=50, y=130)
    kickerCtx.strokeStyle = '#00f3ff';
    kickerCtx.lineWidth = 6;
    kickerCtx.beginPath();
    kickerCtx.moveTo(50, 130);
    
    // Pivot line coordinates based on pull angle
    const targetX = 50 + Math.sin(kickerLeverAngle) * 35;
    const targetY = 130 - Math.cos(kickerLeverAngle) * 35;
    
    kickerCtx.lineTo(targetX, targetY);
    kickerCtx.stroke();
    
    // fulcrum hub
    kickerCtx.fillStyle = '#ff007f';
    kickerCtx.beginPath();
    kickerCtx.arc(50, 130, 8, 0, 2 * Math.PI);
    kickerCtx.fill();
    
    // Draw Soccer ball
    kickerCtx.fillStyle = '#fff';
    kickerCtx.beginPath();
    kickerCtx.arc(kickerBallX, kickerBallY, 8, 0, 2 * Math.PI);
    kickerCtx.fill();
    
    // draw moon pattern panels
    kickerCtx.fillStyle = '#000';
    kickerCtx.beginPath();
    kickerCtx.arc(kickerBallX - 3, kickerBallY - 2, 2, 0, 2 * Math.PI);
    kickerCtx.arc(kickerBallX + 3, kickerBallY + 2, 1.5, 0, 2 * Math.PI);
    kickerCtx.fill();
};

const animateMoonSoccerBall = () => {
    const moonGravity = 0.25; // physical low lunar gravity simulation loop
    
    const physicsTimer = setInterval(() => {
        kickerBallX += kickerBallVX;
        kickerBallVY += moonGravity;
        kickerBallY += kickerBallVY;
        
        // Bounce off ground
        if (kickerBallY >= 122) {
            kickerBallY = 122;
            kickerBallVY = -kickerBallVY * 0.65; // restitution bounce bounce
            kickerBallVX *= 0.85; // friction
            SpaceSynth.playBeep(120, 0.05); // bounce thud sound
        }
        
        // Bounce off right goal walls
        if (kickerBallX >= kickerCanvas.width - 8) {
            kickerBallX = kickerCanvas.width - 8;
            kickerBallVX = -kickerBallVX * 0.5;
            SpaceSynth.playBeep(220, 0.05);
        }
        
        drawKickerStage();
        
        // Stop updates when velocity is near zero
        if (Math.abs(kickerBallVX) < 0.1 && Math.abs(kickerBallVY) < 0.1 && kickerBallY >= 122) {
            clearInterval(physicsTimer);
            isLeverAnimating = false;
            kickerBallX = 70;
            kickerBallY = 115;
            kickerLeverAngle = 0;
            document.getElementById('kicker-power-meter').style.width = '0%';
            drawKickerStage();
        }
    }, 30);
};

// ==========================================================================
// 8. NASA ASTRO-ENGINEER CERTIFICATE CANVAS COMPILER
// ==========================================================================
const initCertificatePreview = () => {
    const certCanvas = document.getElementById('diploma-canvas');
    const certCtx = certCanvas.getContext('2d');
    
    // Pre-draw standard certificate background
    drawStaticCertificateFrame(certCtx, certCanvas);
    
    // Photo upload listener
    const uploadZone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('diploma-photo-input');
    const previewContainer = document.getElementById('photo-preview-container');
    const previewImg = document.getElementById('photo-preview-img');
    
    uploadZone.onclick = () => fileInput.click();
    
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.style.borderColor = 'var(--cyan-glow)';
    });
    
    uploadZone.addEventListener('dragleave', () => {
        uploadZone.style.borderColor = 'rgba(255, 255, 255, 0.15)';
    });
    
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            loadUploadedFile(file);
        }
    });
    
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            loadUploadedFile(file);
        }
    });
    
    const loadUploadedFile = (file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            state.uploadedPhoto = event.target.result;
            previewImg.src = event.target.result;
            previewContainer.style.display = 'block';
            uploadZone.style.display = 'none';
            SpaceSynth.playBeep(900, 0.1);
        };
        reader.readAsDataURL(file);
    };
    
    document.getElementById('btn-remove-photo').onclick = () => {
        state.uploadedPhoto = null;
        previewImg.src = "";
        previewContainer.style.display = 'none';
        uploadZone.style.display = 'flex';
        SpaceSynth.playError();
    };
    
    // Generate full certificate on final compile button click
    const genBtn = document.getElementById('btn-generate-diploma');
    const dlBtn = document.getElementById('btn-download-diploma');
    
    genBtn.onclick = () => {
        const nameInput = document.getElementById('diploma-name').value;
        state.childName = nameInput.trim() !== '' ? nameInput : 'Juanpi';
        document.getElementById('user-display').innerHTML = `Astro-${state.childName} 🎖️`;
        
        SpaceSynth.playSuccess();
        
        // Start full render
        compileNASAStudioDiploma(certCtx, certCanvas, () => {
            dlBtn.disabled = false;
        });
    };
    
    dlBtn.onclick = () => {
        const link = document.createElement('a');
        link.download = `diploma_nasa_${state.childName}.png`;
        link.href = certCanvas.toDataURL();
        link.click();
        SpaceSynth.playBeep(900, 0.1);
    };
};

const drawStaticCertificateFrame = (ctx, canvas) => {
    // Elegant Deep navy parchment galactic styling
    const frameGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    frameGrad.addColorStop(0, '#0c0a24');
    frameGrad.addColorStop(0.5, '#13113c');
    frameGrad.addColorStop(1, '#05031a');
    ctx.fillStyle = frameGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Gold borders (Double-Bezel hardware feeling)
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(18, 18, canvas.width - 36, canvas.height - 36);
    
    // Red/Blue stripes in corner (Retro NASA astronaut badge style)
    ctx.fillStyle = '#ff003c';
    ctx.fillRect(25, 25, 40, 4);
    ctx.fillStyle = '#0077ff';
    ctx.fillRect(25, 31, 40, 4);
};

const compileNASAStudioDiploma = (ctx, canvas, callback) => {
    drawStaticCertificateFrame(ctx, canvas);
    
    // Title texts
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = "bold 26px 'Space Grotesk'";
    ctx.shadowColor = 'rgba(0, 243, 255, 0.5)';
    ctx.shadowBlur = 8;
    ctx.fillText("ACADEMIA DE ASTRO-INGENIERÍA", canvas.width / 2, 70);
    ctx.shadowBlur = 0; // reset
    
    ctx.fillStyle = '#d4af37';
    ctx.font = "bold 16px 'Space Grotesk'";
    ctx.fillText("LA ADMINISTRACIÓN NACIONAL DE AERONÁUTICA Y DEL ESPACIO (NASA)", canvas.width / 2, 100);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = "300 13px 'Outfit'";
    ctx.fillText("Otorga con el más alto honor este Diploma de Grado a:", canvas.width / 2, 140);
    
    // Kid's personalized name
    ctx.fillStyle = '#00f3ff';
    ctx.font = "bold 34px 'Space Grotesk'";
    ctx.shadowColor = '#00f3ff';
    ctx.shadowBlur = 10;
    ctx.fillText(state.childName.toUpperCase(), canvas.width / 2, 185);
    ctx.shadowBlur = 0;
    
    ctx.fillStyle = '#ffffff';
    ctx.font = "300 14px 'Outfit'";
    ctx.fillText("por completar con éxito todas las fases de entrenamiento espacial", canvas.width / 2, 225);
    ctx.fillText("y diseñar el robot explorador del futuro: Nivel 2 (Interacción y Sensores).", canvas.width / 2, 245);
    
    // Draw Stamp seal ( fulcrum badge )
    ctx.fillStyle = 'rgba(212, 175, 55, 0.15)';
    ctx.beginPath();
    ctx.arc(500, 320, 45, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(500, 320, 40, 0, 2 * Math.PI);
    ctx.stroke();
    
    ctx.fillStyle = '#d4af37';
    ctx.font = "bold 8px 'Space Grotesk'";
    ctx.fillText("NASA CADET", 500, 312);
    ctx.fillText("APROBADO", 500, 323);
    ctx.fillText("FLOTA ESTELAR", 500, 332);
    
    // Signature
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = "italic 13px 'Outfit'";
    ctx.fillText("Comandante Juanpi", 120, 345);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.moveTo(50, 330);
    ctx.lineTo(190, 330);
    ctx.stroke();
    ctx.font = "10px 'Outfit'";
    ctx.fillText("Director de Astro-Ingeniería", 120, 360);
    
    // DRAW PICTURE: uploaded photo OR sketch drawing blueprint!
    let imgSource = state.uploadedPhoto || state.drawingSaved;
    
    if (imgSource) {
        const image = new Image();
        image.onload = () => {
            // Draw visual nested frame border around picture
            ctx.strokeStyle = '#00f3ff';
            ctx.lineWidth = 2;
            ctx.strokeRect(268, 278, 124, 94);
            
            // Draw image clip fitting properly
            ctx.drawImage(image, 270, 280, 120, 90);
            
            if (callback) callback();
        };
        image.src = imgSource;
    } else {
        // Fallback placeholder box
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        ctx.strokeRect(270, 280, 120, 90);
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = "italic 11px 'Outfit'";
        ctx.fillText("Sin Plano Cargado", 330, 320);
        ctx.fillText("(Ve a la Fase 1 y Guarda)", 330, 335);
        if (callback) callback();
    }
};

// ==========================================================================
// 9. CONCENTRATION QUIZ GAME ENGINE
// ==========================================================================
let quizCurrentIndex = 0;
let quizScore = 0;
let quizLives = 3;

const quizQuestions = [
    {
        q: "¿Cuáles son las tres partes principales de un robot espacial?",
        options: [
            "Ruedas, antena y panel solar.",
            "Cuerpo (motores), Cerebro (control) y Sensores (sentidos).",
            "Batería, cables y tornillos."
        ],
        answer: 1, // index of option
        desc: "¡Correcto! El cuerpo le da la forma, el cerebro piensa y procesa, y los sensores son sus ojos y oídos espaciales."
    },
    {
        q: "¿Para qué sirve el sensor de ultrasonido WeDo en los planetas?",
        options: [
            "Para medir la temperatura de los motores.",
            "Para escuchar música y radio marciana.",
            "Para ver y medir la distancia a obstáculos (como cráteres)."
        ],
        answer: 2,
        desc: "¡Correcto! Emite ondas de radar invisibles para medir la distancia y evitar colisiones."
    },
    {
        q: "¿Cuál es el 'cerebro' del Sphero BOLT que procesa nuestras órdenes?",
        options: [
            "La pantalla LED matrix.",
            "El Sistema de Control.",
            "El giroscopio giratorio."
        ],
        answer: 1,
        desc: "¡Exacto! El sistema de control es el procesador que toma el código y lo convierte en movimientos."
    },
    {
        q: "En nuestra misión de Marte, ¿qué bloque detiene al robot antes de caer al cráter?",
        options: [
            "Mover Adelante.",
            "Detener Robot.",
            "Esperar 5 Segundos."
        ],
        answer: 1,
        desc: "¡Fabuloso! El comando 'Detener Robot' es vital para apagar los motores y frenar."
    },
    {
        q: "¿Qué parte física le permite al robot 'Roberto de Marte' caminar?",
        options: [
            "Su sistema de palancas y motores en sus piernas.",
            "Sus paneles de carga solar.",
            "Su termómetro anti-heladas."
        ],
        answer: 0,
        desc: "¡Excelente! Utiliza bípodos mecánicos estructurados como palancas que mueven sus dos pies."
    }
];

const initQuizEngine = () => {
    quizCurrentIndex = 0;
    quizScore = 0;
    quizLives = 3;
    
    document.getElementById('quiz-victory-panel').style.display = 'none';
    document.getElementById('quiz-game-panel').style.display = 'block';
    
    loadQuizQuestion();
    
    document.getElementById('btn-quiz-next').onclick = () => {
        document.getElementById('quiz-feedback-box').style.display = 'none';
        quizCurrentIndex++;
        
        if (quizCurrentIndex >= quizQuestions.length) {
            triggerQuizVictory();
        } else {
            loadQuizQuestion();
        }
    };
    
    document.getElementById('btn-quiz-restart').onclick = initQuizEngine;
    document.getElementById('btn-goto-diploma').onclick = () => {
        // Force navigation tab click trigger to Phase 4
        document.getElementById('btn-nav-fase4').click();
    };
};

const loadQuizQuestion = () => {
    const qData = quizQuestions[quizCurrentIndex];
    
    // Updates HUD stats
    document.getElementById('quiz-current-index').textContent = quizCurrentIndex + 1;
    document.getElementById('quiz-progress').style.width = `${(quizCurrentIndex / quizQuestions.length) * 100}%`;
    document.getElementById('quiz-points').textContent = quizScore;
    
    // Render lives hearts
    const hearts = document.getElementById('quiz-lives-container');
    hearts.innerHTML = '';
    for(let l=0; l < quizLives; l++) {
        hearts.innerHTML += '<i class="fa-solid fa-heart text-red"></i> ';
    }
    
    // Set Question text
    document.getElementById('quiz-question-text').textContent = qData.q;
    
    // Render options list buttons
    const list = document.getElementById('quiz-options-list');
    list.innerHTML = '';
    
    qData.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-opt-btn';
        btn.innerHTML = `
            <span class="quiz-opt-index">${String.fromCharCode(65 + idx)}</span>
            <span>${opt}</span>
        `;
        
        btn.onclick = () => selectQuizAnswer(idx, btn);
        list.appendChild(btn);
    });
    
    document.getElementById('btn-quiz-next').style.display = 'none';
};

const selectQuizAnswer = (selectedIdx, clickedBtn) => {
    const qData = quizQuestions[quizCurrentIndex];
    const buttons = document.querySelectorAll('.quiz-options-list .quiz-opt-btn');
    
    // Disable all options buttons to prevent multiple clicks
    buttons.forEach(b => b.classList.add('disabled'));
    
    const feedPanel = document.getElementById('quiz-feedback-box');
    const feedTitle = document.getElementById('quiz-feedback-title');
    const feedDesc = document.getElementById('quiz-feedback-desc');
    const feedIcon = document.getElementById('quiz-feedback-icon');
    
    if (selectedIdx === qData.answer) {
        // Correct answer!
        clickedBtn.classList.add('correct');
        quizScore += 100;
        SpaceSynth.playSuccess();
        
        feedPanel.className = "quiz-feedback-box correct-feedback";
        feedIcon.innerHTML = '<i class="fa-solid fa-square-check"></i>';
        feedTitle.textContent = "¡CORRECTO CADETE!";
        feedDesc.textContent = qData.desc;
    } else {
        // Incorrect answer
        clickedBtn.classList.add('incorrect');
        quizLives--;
        SpaceSynth.playError();
        
        // Highlight the correct one
        buttons[qData.answer].classList.add('correct');
        
        feedPanel.className = "quiz-feedback-box incorrect-feedback";
        feedIcon.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i>';
        feedTitle.textContent = "¡RECALCULANDO RUTA!";
        feedDesc.textContent = `La opción correcta era: ${qData.options[qData.answer]}`;
        
        if (quizLives <= 0) {
            alert("🚨 ¡Te has quedado sin escudos de energía! Recargando simulador para volver a intentar.");
            initQuizEngine();
            return;
        }
    }
    
    feedPanel.style.display = 'flex';
    document.getElementById('btn-quiz-next').style.display = 'inline-flex';
};

const triggerQuizVictory = () => {
    document.getElementById('quiz-game-panel').style.display = 'none';
    const victory = document.getElementById('quiz-victory-panel');
    victory.style.display = 'flex';
    
    document.getElementById('victory-score').textContent = quizScore;
    document.getElementById('victory-correct').textContent = `${quizQuestions.length - (3 - quizLives)} / ${quizQuestions.length}`;
    
    let rank = "Cadete de Robótica";
    if (quizScore >= 400) rank = "Comandante Supremo 🌟";
    else if (quizScore >= 300) rank = "Astro-Ingeniero Elite 🚀";
    
    document.getElementById('victory-rank').textContent = rank;
    
    SpaceSynth.playSuccess();
    triggerStarConfetti();
};

// ==========================================================================
// 10. CELEBRATION STARS CONFETTI RAIN ENGINE
// ==========================================================================
let confCanvas, confCtx;
let confettiActive = false;
let particles = [];

const triggerStarConfetti = () => {
    confCanvas = document.getElementById('confetti-canvas');
    confCtx = confCanvas.getContext('2d');
    
    confCanvas.width = window.innerWidth;
    confCanvas.height = window.innerHeight;
    
    particles = [];
    confettiActive = true;
    
    // Generate neon star particles
    for (let i = 0; i < 70; i++) {
        particles.push({
            x: Math.random() * confCanvas.width,
            y: Math.random() * -100 - 20,
            size: Math.random() * 6 + 4,
            speedY: Math.random() * 4 + 2,
            speedX: Math.random() * 2 - 1,
            color: ['#00f3ff', '#ff007f', '#39ff14', '#ff7700', '#ffea00'][Math.floor(Math.random() * 5)],
            rot: Math.random() * Math.PI
        });
    }
    
    animateConfettiRain();
    
    // Stop after 4 seconds
    setTimeout(() => {
        confettiActive = false;
        confCtx.clearRect(0, 0, confCanvas.width, confCanvas.height);
    }, 4500);
};

const animateConfettiRain = () => {
    if (!confettiActive) return;
    
    confCtx.clearRect(0, 0, confCanvas.width, confCanvas.height);
    
    particles.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rot += 0.05;
        
        confCtx.fillStyle = p.color;
        confCtx.shadowColor = p.color;
        confCtx.shadowBlur = 5;
        
        confCtx.save();
        confCtx.translate(p.x, p.y);
        confCtx.rotate(p.rot);
        
        // Draw cute star path shapes
        confCtx.beginPath();
        for (let i = 0; i < 5; i++) {
            confCtx.lineTo(0, -p.size);
            confCtx.rotate(Math.PI / 5);
            confCtx.lineTo(0, -p.size / 2);
            confCtx.rotate(Math.PI / 5);
        }
        confCtx.closePath();
        confCtx.fill();
        confCtx.restore();
    });
    
    confCtx.shadowBlur = 0; // reset
    requestAnimationFrame(animateConfettiRain);
};

// ==========================================================================
// 11. BOOTSTRAP INITIALIZER BINDINGS
// ==========================================================================
window.onload = () => {
    initNavigation();
    initVoiceCommander();
    initDrawingBoard();
    initHardwareToys();
    initMarsSim();
    initPhysicsKicker();
    initCertificatePreview();
    initQuizEngine();
};
