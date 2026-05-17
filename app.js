/**
 * NIVEL 2: INTERACCIÓN Y SENTIDOS ROBÓTICOS 🛰️
 * Core JavaScript Interaction & Educational Engines
 * Customized for Cadete Juanpi (8 years old)
 */

// ==========================================================================
// 1. GLOBAL STATE & SOUND SYNTHESIZER ENGINE (Web Audio API)
// ==========================================================================
const state = {
    currentSection: 'intro',
    childName: 'Juanpi',
    roverActive: false,
    
    // Module 1 Gear Puzzle
    gearsPlaced: {
        'slot-1': null, // expects 'small'
        'slot-2': null, // expects 'medium'
        'slot-3': null  // expects 'large'
    },
    gearSpinning: false,
    
    // Module 2 Sensor state
    sonarActive: false,
    sonarBeepInterval: null,
    sonarMeteorX: 250,
    spectrometerColor: 'black',
    
    // Module 3 VR Coding Laberinto
    vrSequence: [],
    vrSimRunning: false,
    vrRobotX: 50,
    vrRobotY: 80,
    vrRobotAngle: 0, // 0=Right, 90=Down, 180=Left, 270=Up
    vrGoalX: 300,
    vrGoalY: 250,
    vrRockX: 200,
    vrRockY: 80,
};

// Web Audio API Space Sound Synthesizer
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
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // Ascending C major arpeggio
        const now = this.ctx.currentTime;
        
        notes.forEach((freq, idx) => {
            const time = now + idx * 0.07;
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
        osc.frequency.setValueAtTime(400, now);
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
        osc.frequency.setValueAtTime(1600, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.12);
        
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(now + 0.12);
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
        filter.frequency.value = 1100;
        filter.Q.value = 2.5;
        
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        
        noise.start();
    },
    
    playGearHum(speed = 1) {
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(75 * speed, this.ctx.currentTime);
        
        const lp = this.ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 160;
        
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);
        
        osc.connect(lp);
        lp.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.6);
    },
    
    playColorBeep(color) {
        this.init();
        let freq = 400;
        if (color === 'red') freq = 880;
        else if (color === 'blue') freq = 660;
        else if (color === 'black') freq = 330;
        
        this.playBeep(freq, 0.15, color === 'black' ? 'triangle' : 'sine');
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
                if (target === 'mod3') {
                    initVRLaberinto();
                } else if (target === 'diploma') {
                    initCertificatePreview();
                }
            }
        });
    });
};

// ==========================================================================
// 3. INTRO: WAKING ROVER ("¡TU ROBOT DESPIERTA!")
// ==========================================================================
const initIntroWakeUp = () => {
    const actBtn = document.getElementById('btn-activate-rover');
    const roverModel = document.getElementById('rover-model');
    const statusText = document.getElementById('activation-status');
    const ecgWave = document.getElementById('ecg-wave');
    
    actBtn.addEventListener('click', () => {
        actBtn.blur();
        SpaceSynth.playStatic(0.6);
        
        setTimeout(() => {
            if (!state.roverActive) {
                state.roverActive = true;
                
                // Wake up visuals
                roverModel.classList.add('active');
                ecgWave.classList.add('playing');
                statusText.textContent = "🚀 ¡Explorador Despierto y Conectado!";
                statusText.style.color = "var(--cyan-glow)";
                statusText.style.textShadow = "0 0 10px var(--cyan-glow)";
                
                actBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> SISTEMAS ONLINE';
                actBtn.style.background = 'linear-gradient(135deg, var(--green-glow) 0%, #00aa22 100%)';
                actBtn.style.boxShadow = 'var(--shadow-green)';
                
                SpaceSynth.playSuccess();
                
                // Welcome commander voice synthesis
                if ('speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                    
                    const msg = `¡Felicidades, Comandante ${state.childName}! Tu robot ya tiene cuerpo y cerebro. Hemos activado con éxito los sistemas de a bordo. ¡Es hora de hacerlo inteligente!`;
                    const utterance = new SpeechSynthesisUtterance(msg);
                    utterance.lang = 'es-ES';
                    utterance.rate = 0.95;
                    utterance.pitch = 1.0;
                    
                    window.speechSynthesis.speak(utterance);
                }
            } else {
                // Toggle off
                state.roverActive = false;
                roverModel.classList.remove('active');
                ecgWave.classList.remove('playing');
                statusText.textContent = "Rover en hibernación... ZzZ";
                statusText.removeAttribute('style');
                
                actBtn.innerHTML = '<i class="fa-solid fa-power-off"></i> ¡ACTIVAR SISTEMAS!';
                actBtn.style.background = '';
                actBtn.style.boxShadow = '';
                
                SpaceSynth.playError();
            }
        }, 600);
    });
};

// ==========================================================================
// 4. MÓDULO 1: GEAR PUZZLE & SLOPE CLIMB
// ==========================================================================
let draggedGearSize = null;
let draggedGearId = null;

const initGearPuzzle = () => {
    const gearItems = document.querySelectorAll('.gear-drag-item');
    const slots = document.querySelectorAll('.gear-axis-slot');
    const testBtn = document.getElementById('btn-test-gears');
    const resetBtn = document.getElementById('btn-reset-gears');
    const feedback = document.getElementById('gear-puzzle-feedback');
    
    // Drag events
    gearItems.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            draggedGearSize = item.getAttribute('data-size');
            draggedGearId = item.id;
            item.classList.add('dragging');
            SpaceSynth.playBeep(600, 0.05);
        });
        
        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
        });
    });
    
    slots.forEach(slot => {
        slot.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (!state.gearsPlaced[slot.id]) {
                slot.classList.add('dragover');
            }
        });
        
        slot.addEventListener('dragleave', () => {
            slot.classList.remove('dragover');
        });
        
        slot.addEventListener('drop', (e) => {
            e.preventDefault();
            slot.classList.remove('dragover');
            
            const expectedSize = slot.getAttribute('data-expected');
            
            if (state.gearsPlaced[slot.id]) return; // slot occupied
            
            if (draggedGearSize === expectedSize) {
                // Correct match! Place gear
                state.gearsPlaced[slot.id] = draggedGearSize;
                
                // Render placed gear visual inside slot
                const holder = slot.querySelector('.placed-gear-holder');
                let gearColorClass = '';
                if (draggedGearSize === 'small') gearColorClass = 'placed-small';
                else if (draggedGearSize === 'medium') gearColorClass = 'placed-medium';
                else if (draggedGearSize === 'large') gearColorClass = 'placed-large';
                
                holder.innerHTML = `<i class="fa-solid fa-gear placed-gear-cog ${gearColorClass}"></i>`;
                
                // Hide the source gear item from toolbox
                document.getElementById(draggedGearId).style.visibility = 'hidden';
                
                SpaceSynth.playBeep(880, 0.08);
                
                // Check if all correct
                checkGearPuzzleCompleted();
            } else {
                // Wrong gear
                SpaceSynth.playError();
                feedback.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Ese engranaje no encaja en este eje. ¡Cuidado con el tamaño!';
                feedback.className = "puzzle-status-box critical";
            }
        });
    });
    
    const checkGearPuzzleCompleted = () => {
        const allCorrect = state.gearsPlaced['slot-1'] === 'small' &&
                           state.gearsPlaced['slot-2'] === 'medium' &&
                           state.gearsPlaced['slot-3'] === 'large';
                           
        if (allCorrect) {
            testBtn.removeAttribute('disabled');
            feedback.innerHTML = '<span><i class="fa-solid fa-circle-check"></i> ¡Sistemas acoplados con éxito! Pulsa Probar.</span>';
            feedback.className = "puzzle-status-box success";
            SpaceSynth.playSuccess();
        } else {
            testBtn.setAttribute('disabled', 'true');
        }
    };
    
    testBtn.addEventListener('click', () => {
        if (state.gearSpinning) return;
        state.gearSpinning = true;
        
        // Spin placed gear cogs using classes
        document.querySelectorAll('.placed-gear-cog').forEach((cog, idx) => {
            cog.classList.add('spinning');
        });
        
        SpaceSynth.playGearHum(1);
        setTimeout(() => SpaceSynth.playGearHum(1.5), 600);
        setTimeout(() => SpaceSynth.playGearHum(2), 1200);
        
        // Climb rover animation
        const miniRover = document.getElementById('mini-rover-body');
        miniRover.style.transition = 'transform 3s cubic-bezier(0.25, 0.8, 0.25, 1)';
        miniRover.style.transform = 'translate(190px, -80px) rotate(-22deg)';
        
        setTimeout(() => {
            SpaceSynth.playSuccess();
            triggerStarConfetti();
            feedback.innerHTML = '<span><i class="fa-solid fa-flag-checkered"></i> ¡Excelente! Rover subió la pendiente marciana con máxima fuerza.</span>';
            feedback.className = "puzzle-status-box success";
        }, 3000);
    });
    
    resetBtn.addEventListener('click', () => {
        // Reset state
        state.gearsPlaced = { 'slot-1': null, 'slot-2': null, 'slot-3': null };
        state.gearSpinning = false;
        
        // Empty slots
        document.querySelectorAll('.placed-gear-holder').forEach(el => el.innerHTML = '');
        
        // Restore toolbox items visibility
        gearItems.forEach(item => item.style.visibility = 'visible');
        
        // Reset rover position
        const miniRover = document.getElementById('mini-rover-body');
        miniRover.style.transition = 'none';
        miniRover.style.transform = 'none';
        
        testBtn.setAttribute('disabled', 'true');
        feedback.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Conecta los engranajes en orden correcto.';
        feedback.className = "puzzle-status-box";
        
        SpaceSynth.playError();
    });
};

// ==========================================================================
// 5. MÓDULO 2: SENSORS MODULE (ULTRASONIC & COLOR)
// ==========================================================================
const initSensorsModule = () => {
    
    // A. ULTRASONIC RADAR DRAG-AND-DROP METEOR
    const meteor = document.getElementById('sonar-meteor');
    const sonarContainer = meteor.parentElement;
    const waves = document.getElementById('sonar-radar-waves');
    const distVal = document.getElementById('sonar-distance-val');
    const statusPill = document.getElementById('sonar-status-pill');
    let isDraggingMeteor = false;
    
    meteor.addEventListener('mousedown', () => {
        isDraggingMeteor = true;
        meteor.style.cursor = 'grabbing';
    });
    
    window.addEventListener('mouseup', () => {
        isDraggingMeteor = false;
        meteor.style.cursor = 'grab';
    });
    
    sonarContainer.addEventListener('mousemove', (e) => {
        if (!isDraggingMeteor) return;
        
        const rect = sonarContainer.getBoundingClientRect();
        let posX = e.clientX - rect.left - 24; // center
        
        if (posX < 60) posX = 60;
        if (posX > rect.width - 40) posX = rect.width - 40;
        
        meteor.style.left = `${posX}px`;
        
        // Distance math
        const sensorX = 25;
        const diffX = posX - sensorX;
        const cmDistance = Math.round(diffX * 1.15); // map
        
        distVal.textContent = cmDistance;
        
        // Warning sound rate
        clearInterval(state.sonarBeepInterval);
        
        if (cmDistance < 70) {
            statusPill.textContent = "ALERTA COLISIÓN 🔴";
            statusPill.className = "status-pill critical";
            waves.style.filter = "hue-rotate(120deg) saturate(2.5)";
            
            state.sonarBeepInterval = setInterval(() => {
                SpaceSynth.playBeep(950, 0.04, 'sawtooth');
            }, 150);
        } else if (cmDistance < 150) {
            statusPill.textContent = "ADVERTENCIA 🟡";
            statusPill.className = "status-pill warning";
            waves.style.filter = "hue-rotate(50deg) saturate(1.8)";
            
            state.sonarBeepInterval = setInterval(() => {
                SpaceSynth.playBeep(580, 0.07);
            }, 450);
        } else {
            statusPill.textContent = "SEGURO 🟢";
            statusPill.className = "status-pill safe";
            waves.style.filter = "none";
        }
    });
    
    // Toggle Robot Radar Vision button
    const toggleVisionBtn = document.getElementById('btn-toggle-vision');
    const sweep = document.getElementById('radar-sweep');
    
    toggleVisionBtn.addEventListener('click', () => {
        if (!state.sonarActive) {
            state.sonarActive = true;
            sweep.style.display = 'block';
            toggleVisionBtn.innerHTML = '<i class="fa-solid fa-eye"></i> Visión Normal';
            toggleVisionBtn.style.background = 'linear-gradient(135deg, var(--magenta-glow) 0%, #aa00aa 100%)';
            SpaceSynth.playLaser();
        } else {
            state.sonarActive = false;
            sweep.style.display = 'none';
            toggleVisionBtn.innerHTML = '<i class="fa-solid fa-eye-low-vision"></i> Visión de Robot (Radar)';
            toggleVisionBtn.style.background = '';
            SpaceSynth.playError();
        }
    });
    
    // B. SPECTROMETER COLOR SCANNER
    const colorSelectors = document.querySelectorAll('.btn-mineral-selector');
    const laserBeam = document.getElementById('scanner-laser-beam');
    const laserLed = document.getElementById('scanner-laser-led');
    const rock = document.getElementById('target-mineral-soil');
    const readingVal = document.getElementById('color-sensor-val');
    const commentVal = document.getElementById('color-sensor-action');
    
    colorSelectors.forEach(btn => {
        btn.addEventListener('click', () => {
            colorSelectors.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const color = btn.getAttribute('data-color');
            state.spectrometerColor = color;
            
            SpaceSynth.playColorBeep(color);
            
            // Adjust laser visual colors
            if (color === 'black') {
                laserBeam.style.background = 'rgba(0, 243, 255, 0.15)';
                laserLed.style.background = 'var(--cyan-glow)';
                rock.style.color = '#555';
                rock.style.filter = 'none';
                readingVal.textContent = "Camino Negro";
                readingVal.style.color = "var(--cyan-glow)";
                commentVal.textContent = '"Siguiendo ruta segura"';
            } else if (color === 'red') {
                laserBeam.style.background = 'rgba(255, 0, 50, 0.6)';
                laserLed.style.background = 'red';
                rock.style.color = '#ff3355';
                rock.style.filter = 'drop-shadow(0 0 15px #ff3355)';
                readingVal.textContent = "Mineral Rojo (Hierro)";
                readingVal.style.color = "red";
                commentVal.textContent = '"⚡ ¡Hierro detectado! Material útil."';
            } else if (color === 'blue') {
                laserBeam.style.background = 'rgba(0, 119, 255, 0.6)';
                laserLed.style.background = 'var(--cyan-glow)';
                rock.style.color = '#00bbff';
                rock.style.filter = 'drop-shadow(0 0 15px #00bbff)';
                readingVal.textContent = "Mineral Azul (Hielo)";
                readingVal.style.color = "var(--cyan-glow)";
                commentVal.textContent = '"❄️ ¡Hielo de agua descubierto! Recurso vital."';
            }
        });
    });
};

// ==========================================================================
// 6. MÓDULO 3: PROGRAMACIÓN INTELIGENTE (VR LABERINTO COMPILER)
// ==========================================================================
let vrCanvas, vrCtx;
let vrAnimationInterval = null;

const initVRLaberinto = () => {
    vrCanvas = document.getElementById('vr-maze-canvas');
    vrCtx = vrCanvas.getContext('2d');
    
    // Draw initial static VR map state
    drawVRSimulationFrame();
    
    // Palette clicks to add blocks
    document.getElementById('pal-avanzar').onclick = () => addBlockToVRWorkspace('avanzar', '<i class="fa-solid fa-circle-arrow-right"></i> Avanzar 1 Paso');
    document.getElementById('pal-si-roca').onclick = () => addBlockToVRWorkspace('si-roca', '<i class="fa-solid fa-diamond-turn-right"></i> SI hay roca ➡️ Girar Derecha');
    document.getElementById('pal-girar-izq').onclick = () => addBlockToVRWorkspace('girar-izq', '<i class="fa-solid fa-rotate-left"></i> Girar Izquierda');
    document.getElementById('pal-detener').onclick = () => addBlockToVRWorkspace('detener-meta', '<i class="fa-solid fa-flag-checkered"></i> SI en meta 🛑 Detener');
    
    document.getElementById('btn-clear-vr-workspace').onclick = () => {
        state.vrSequence = [];
        renderVRWorkspaceBlocks();
        resetVRSim();
        SpaceSynth.playError();
    };
    
    document.getElementById('btn-run-vr').onclick = runVRProgram;
    document.getElementById('btn-reset-vr').onclick = resetVRSim;
};

const addBlockToVRWorkspace = (type, html) => {
    state.vrSequence.push({
        id: 'vr-' + Date.now() + Math.random().toString(36).substr(2, 4),
        type: type,
        html: html
    });
    renderVRWorkspaceBlocks();
    SpaceSynth.playBeep(700, 0.04);
};

const renderVRWorkspaceBlocks = () => {
    const ws = document.getElementById('vr-blocks-workspace');
    const emptyMsg = document.getElementById('vr-workspace-empty');
    
    ws.querySelectorAll('.workspace-block-wrapper').forEach(el => el.remove());
    
    if (state.vrSequence.length === 0) {
        emptyMsg.style.display = 'flex';
        return;
    }
    
    emptyMsg.style.display = 'none';
    
    state.vrSequence.forEach((block, idx) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'workspace-block-wrapper';
        wrapper.setAttribute('data-id', block.id);
        
        let blockClass = '';
        if (block.type === 'avanzar') blockClass = 'block-move';
        else if (block.type === 'si-roca') blockClass = 'block-sensor';
        else if (block.type === 'girar-izq') blockClass = 'block-wait';
        else if (block.type === 'detener-meta') blockClass = 'block-stop';
        
        wrapper.innerHTML = `
            <div class="code-block ${blockClass}">
                ${block.html}
                <button class="btn-block-delete" onclick="removeVRWorkspaceBlock('${block.id}')">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        `;
        ws.appendChild(wrapper);
    });
};

window.removeVRWorkspaceBlock = (id) => {
    state.vrSequence = state.vrSequence.filter(b => b.id !== id);
    renderVRWorkspaceBlocks();
    SpaceSynth.playBeep(300, 0.05);
};

const drawVRSimulationFrame = (isScanning = false) => {
    vrCtx.clearRect(0, 0, vrCanvas.width, vrCanvas.height);
    
    // Draw sci-fi green radar-grid maze map
    vrCtx.fillStyle = '#060517';
    vrCtx.fillRect(0, 0, vrCanvas.width, vrCanvas.height);
    
    // Grid coordinate lines
    vrCtx.strokeStyle = 'rgba(0, 243, 255, 0.06)';
    vrCtx.lineWidth = 1;
    for (let i = 0; i <= vrCanvas.width; i += 35) {
        vrCtx.beginPath();
        vrCtx.moveTo(i, 0);
        vrCtx.lineTo(i, vrCanvas.height);
        vrCtx.stroke();
        
        vrCtx.beginPath();
        vrCtx.moveTo(0, i);
        vrCtx.lineTo(vrCanvas.width, i);
        vrCtx.stroke();
    }
    
    // Outer border walls
    vrCtx.strokeStyle = 'rgba(0, 243, 255, 0.3)';
    vrCtx.lineWidth = 4;
    vrCtx.strokeRect(5, 5, vrCanvas.width - 10, vrCanvas.height - 10);
    
    // Draw obstacle Rock wall
    vrCtx.fillStyle = '#b52c10';
    vrCtx.shadowColor = '#ff003c';
    vrCtx.shadowBlur = 4;
    vrCtx.beginPath();
    vrCtx.arc(state.vrRockX, state.vrRockY, 20, 0, 2 * Math.PI);
    vrCtx.fill();
    vrCtx.shadowBlur = 0; // reset
    
    // Draw goal base circle landing pad
    vrCtx.fillStyle = 'rgba(57, 255, 20, 0.15)';
    ctxGlow(vrCtx, '#39ff14', 12);
    vrCtx.beginPath();
    vrCtx.arc(state.vrGoalX, state.vrGoalY, 26, 0, 2 * Math.PI);
    vrCtx.fill();
    ctxGlow(vrCtx, 'none', 0);
    
    vrCtx.strokeStyle = '#39ff14';
    vrCtx.lineWidth = 2;
    vrCtx.beginPath();
    vrCtx.arc(state.vrGoalX, state.vrGoalY, 24, 0, 2 * Math.PI);
    vrCtx.stroke();
    
    vrCtx.fillStyle = '#39ff14';
    vrCtx.font = "bold 8px 'Space Grotesk'";
    vrCtx.textAlign = 'center';
    vrCtx.fillText("BASE 2", state.vrGoalX, state.vrGoalY + 3);
    
    // Draw Sonar laser scanners if actively checking conditions
    if (isScanning) {
        vrCtx.strokeStyle = 'rgba(0, 243, 255, 0.7)';
        vrCtx.lineWidth = 2.5;
        vrCtx.beginPath();
        vrCtx.moveTo(state.vrRobotX, state.vrRobotY);
        // sensor beam shoots in current angle direction
        let sensorLX = state.vrRobotX + Math.cos(state.vrRobotAngle * Math.PI / 180) * 80;
        let sensorLY = state.vrRobotY + Math.sin(state.vrRobotAngle * Math.PI / 180) * 80;
        vrCtx.lineTo(sensorLX, sensorLY);
        vrCtx.stroke();
    }
    
    // Draw cute VR rover dot
    drawVRRobotShape();
};

const ctxGlow = (c, color, blur) => {
    if(color === 'none') {
        c.shadowBlur = 0;
    } else {
        c.shadowBlur = blur;
        c.shadowColor = color;
    }
};

const drawVRRobotShape = () => {
    vrCtx.save();
    vrCtx.translate(state.vrRobotX, state.vrRobotY);
    // Rotate to match direction
    vrCtx.rotate(state.vrRobotAngle * Math.PI / 180);
    
    // Chassis
    vrCtx.fillStyle = '#e5e7eb';
    vrCtx.strokeStyle = 'var(--cyan-glow)';
    vrCtx.lineWidth = 1.5;
    vrCtx.beginPath();
    vrCtx.roundRect(-16, -12, 32, 24, 4);
    vrCtx.fill();
    vrCtx.stroke();
    
    // Direction visor eyes (glowing indicator pointing forward)
    vrCtx.fillStyle = 'var(--cyan-glow)';
    vrCtx.beginPath();
    vrCtx.arc(10, 0, 4, 0, 2 * Math.PI);
    vrCtx.fill();
    
    // Solar deck
    vrCtx.fillStyle = '#1e3a8a';
    vrCtx.fillRect(-10, -8, 14, 16);
    
    vrCtx.restore();
};

const runVRProgram = () => {
    if (state.vrSequence.length === 0) {
        alert("🚨 ¡Consola vacía! Agrega bloques de órdenes Scratch para programar el robot.");
        return;
    }
    
    if (state.vrSimRunning) return;
    
    state.vrSimRunning = true;
    const badge = document.getElementById('vr-status-badge');
    badge.textContent = "EN MARCHA ⚡";
    badge.className = "sim-badge running";
    
    // Reset start coords
    state.vrRobotX = 50;
    state.vrRobotY = 80;
    state.vrRobotAngle = 0; // pointing right
    
    const wsBlocks = document.querySelectorAll('#vr-blocks-workspace .code-block');
    wsBlocks.forEach(b => b.classList.remove('highlight-run'));
    
    let blockIndex = 0;
    
    const executeNextVRStep = () => {
        if (blockIndex >= state.vrSequence.length) {
            // Evaluates final coordinates landing success!
            evaluateVRMazeCompletion();
            return;
        }
        
        const activeBlock = state.vrSequence[blockIndex];
        const blockEl = wsBlocks[blockIndex];
        blockEl.classList.add('highlight-run');
        
        if (activeBlock.type === 'avanzar') {
            SpaceSynth.playGearHum(1.2);
            let steps = 0;
            const driveInt = setInterval(() => {
                // Move based on current angle (0=Right, 90=Down, 180=Left, 270=Up)
                const rad = state.vrRobotAngle * Math.PI / 180;
                state.vrRobotX += Math.cos(rad) * 3.75; // total 75 px per step
                state.vrRobotY += Math.sin(rad) * 3.75;
                
                // Out of bounds check
                if (state.vrRobotX < 15 || state.vrRobotX > vrCanvas.width - 15 ||
                    state.vrRobotY < 15 || state.vrRobotY > vrCanvas.height - 15) {
                    clearInterval(driveInt);
                    triggerVRCrash("¡Te has salido de la zona de exploración marciana!");
                    return;
                }
                
                drawVRSimulationFrame();
                steps++;
                
                if (steps >= 20) {
                    clearInterval(driveInt);
                    blockEl.classList.remove('highlight-run');
                    blockIndex++;
                    executeNextVRStep();
                }
            }, 30);
            
        } else if (activeBlock.type === 'si-roca') {
            // Sonar Scan trigger
            SpaceSynth.playLaser();
            drawVRSimulationFrame(true); // draw sensor line
            
            setTimeout(() => {
                drawVRSimulationFrame(false); // clear scan
                
                // Check if Rock is in front!
                // Rover at (125, 80) pointing Right (0 degs), rock is at (200, 80) -> distance is 75px. Laser hits!
                const facingRock = state.vrRobotAngle === 0 && 
                                   Math.abs(state.vrRobotY - state.vrRockY) < 15 && 
                                   state.vrRobotX < state.vrRockX && 
                                   (state.vrRockX - state.vrRobotX) < 100;
                                   
                if (facingRock) {
                    // Turn 90 degs clockwise (Girar Derecha: pointing down)
                    state.vrRobotAngle = (state.vrRobotAngle + 90) % 360;
                    SpaceSynth.playBeep(900, 0.1);
                    drawVRSimulationFrame();
                }
                
                blockEl.classList.remove('highlight-run');
                blockIndex++;
                executeNextVRStep();
            }, 500);
            
        } else if (activeBlock.type === 'girar-izq') {
            // Girar Izquierda: rotates 90 degs counter-clockwise
            state.vrRobotAngle = (state.vrRobotAngle - 90 + 360) % 360;
            SpaceSynth.playBeep(450, 0.1);
            drawVRSimulationFrame();
            
            setTimeout(() => {
                blockEl.classList.remove('highlight-run');
                blockIndex++;
                executeNextVRStep();
            }, 300);
            
        } else if (activeBlock.type === 'detener-meta') {
            // SI en meta: detiene
            SpaceSynth.playBeep(300, 0.2, 'sawtooth');
            blockEl.classList.remove('highlight-run');
            blockIndex++;
            executeNextVRStep();
        }
    };
    
    executeNextVRStep();
};

const evaluateVRMazeCompletion = () => {
    state.vrSimRunning = false;
    const badge = document.getElementById('vr-status-badge');
    
    // Check if robot is near Goal coordinate (300, 250)
    const distToGoal = Math.hypot(state.vrRobotX - state.vrGoalX, state.vrRobotY - state.vrGoalY);
    const crashedIntoRock = Math.hypot(state.vrRobotX - state.vrRockX, state.vrRobotY - state.vrRockY) < 26;
    
    if (crashedIntoRock) {
        triggerVRCrash("¡Chocaste contra la roca marciana!");
        return;
    }
    
    if (distToGoal < 30) {
        // Success!
        badge.textContent = "LOGRADO 🎉";
        badge.className = "sim-badge success";
        SpaceSynth.playSuccess();
        triggerStarConfetti();
        alert(`🏆 ¡FORMIDABLE, PROGRAMADOR ${state.childName.toUpperCase()}! Completaste el laberinto VR esquivando la roca con tus sensores y bucles lógicos.`);
    } else {
        // Stopped in wrong place
        badge.textContent = "DESVIADO 🧭";
        badge.className = "sim-badge crashed";
        SpaceSynth.playError();
        alert("🛰️ Tu rover se detuvo, pero no llegó a la Base Roja de la NASA. ¡Revisa el orden de tus bloques y recalcula la ruta!");
    }
};

const triggerVRCrash = (reason) => {
    state.vrSimRunning = false;
    const badge = document.getElementById('vr-status-badge');
    badge.textContent = "FALLIDO 💥";
    badge.className = "sim-badge crashed";
    SpaceSynth.playError();
    
    // Draw crash cartoon puff
    vrCtx.fillStyle = 'rgba(255, 0, 50, 0.7)';
    vrCtx.beginPath();
    vrCtx.arc(state.vrRobotX, state.vrRobotY, 22, 0, 2 * Math.PI);
    vrCtx.fill();
    
    alert(`💥 ¡Choque! ${reason} Intenta reordenar tus bloques Scratch.`);
};

const resetVRSim = () => {
    state.vrSimRunning = false;
    state.vrRobotX = 50;
    state.vrRobotY = 80;
    state.vrRobotAngle = 0;
    
    const badge = document.getElementById('vr-status-badge');
    badge.textContent = "LISTO";
    badge.className = "sim-badge";
    
    const wsBlocks = document.querySelectorAll('#vr-blocks-workspace .code-block');
    wsBlocks.forEach(b => b.classList.remove('highlight-run'));
    
    drawVRSimulationFrame();
    SpaceSynth.playBeep(500, 0.05);
};

// ==========================================================================
// 7. MÓDULO 4: HARDWARE ACCORDIONS & PREVIEWS
// ==========================================================================
const initHardwareMissions = () => {
    const headers = document.querySelectorAll('.accordion-header');
    
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const card = header.parentElement;
            const body = card.querySelector('.accordion-body');
            const arrow = header.querySelector('.toggle-arrow');
            
            const isOpen = card.classList.contains('active-card');
            
            // Close all
            document.querySelectorAll('.mission-accordion-card').forEach(c => {
                c.classList.remove('active-card');
                c.querySelector('.accordion-body').style.display = 'none';
                c.querySelector('.toggle-arrow').style.transform = 'rotate(0deg)';
            });
            
            if (!isOpen) {
                card.classList.add('active-card');
                body.style.display = 'block';
                arrow.style.transform = 'rotate(180deg)';
                SpaceSynth.playBeep(650, 0.06);
            } else {
                SpaceSynth.playBeep(350, 0.05);
            }
        });
    });
};

// ==========================================================================
// 8. conclusiÓN & DIPLOMA "ESPECIALISTA EN NAVEGACIÓN Y SENSORES"
// ==========================================================================
const initCertificatePreview = () => {
    const certCanvas = document.getElementById('diploma-canvas');
    const certCtx = certCanvas.getContext('2d');
    
    drawDiplomaLayout(certCtx, certCanvas);
    
    const genBtn = document.getElementById('btn-generate-diploma');
    const dlBtn = document.getElementById('btn-download-diploma');
    
    genBtn.onclick = () => {
        const nameInput = document.getElementById('diploma-name').value;
        state.childName = nameInput.trim() !== '' ? nameInput : 'Juanpi';
        document.getElementById('user-display').innerHTML = `Astro-${state.childName} 🎖️`;
        
        SpaceSynth.playSuccess();
        triggerStarConfetti();
        
        // Compile full cert
        compileNASADiploma(certCtx, certCanvas);
        dlBtn.removeAttribute('disabled');
    };
    
    dlBtn.onclick = () => {
        const link = document.createElement('a');
        link.download = `diploma_navegacion_${state.childName}.png`;
        link.href = certCanvas.toDataURL();
        link.click();
        SpaceSynth.playBeep(900, 0.1);
    };
};

const drawDiplomaLayout = (ctx, canvas) => {
    // OLED cosmic glassmorphism background
    const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bgGrad.addColorStop(0, '#040212');
    bgGrad.addColorStop(0.5, '#0b092a');
    bgGrad.addColorStop(1, '#03010b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Double bezel gold borders
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 6;
    ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);
    
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(22, 22, canvas.width - 44, canvas.height - 44);
    
    // NASA badge retro stripes
    ctx.fillStyle = '#ff0055';
    ctx.fillRect(30, 30, 45, 4);
    ctx.fillStyle = '#0077ff';
    ctx.fillRect(30, 37, 45, 4);
};

const compileNASADiploma = (ctx, canvas) => {
    drawDiplomaLayout(ctx, canvas);
    
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    
    // Title Header
    ctx.font = "bold 24px 'Space Grotesk'";
    ctx.shadowColor = 'rgba(0, 243, 255, 0.5)';
    ctx.shadowBlur = 10;
    ctx.fillText("ACADEMIA DE ASTRO-INGENIERÍA", canvas.width / 2, 75);
    ctx.shadowBlur = 0; // reset
    
    ctx.fillStyle = '#d4af37';
    ctx.font = "bold 15px 'Space Grotesk'";
    ctx.fillText("ADMINISTRACIÓN NACIONAL DE AERONÁUTICA Y DEL ESPACIO", canvas.width / 2, 105);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = "300 13px 'Outfit'";
    ctx.fillText("Por cuanto ha demostrado maestría controlando engranajes,", canvas.width / 2, 145);
    ctx.fillText("calibrando radares ultrasónicos y programando laberintos lógicos,", canvas.width / 2, 165);
    ctx.fillText("la Flota Estelar le otorga con honores este Diploma de:", canvas.width / 2, 185);
    
    // Title of Achievement
    ctx.fillStyle = '#ff007f';
    ctx.font = "bold 21px 'Space Grotesk'";
    ctx.shadowColor = 'rgba(255,0,127,0.5)';
    ctx.shadowBlur = 8;
    ctx.fillText("ESPECIALISTA EN NAVEGACIÓN Y SENSORES", canvas.width / 2, 225);
    ctx.shadowBlur = 0;
    
    ctx.fillStyle = '#ffffff';
    ctx.font = "300 13px 'Outfit'";
    ctx.fillText("Al Cadete Astro-Ingeniero:", canvas.width / 2, 260);
    
    // Personalized Name
    ctx.fillStyle = 'var(--cyan-glow)';
    ctx.font = "bold 32px 'Space Grotesk'";
    ctx.shadowColor = 'var(--cyan-glow)';
    ctx.shadowBlur = 12;
    ctx.fillText(state.childName.toUpperCase(), canvas.width / 2, 305);
    ctx.shadowBlur = 0;
    
    // Approval stamp
    ctx.fillStyle = 'rgba(212, 175, 55, 0.1)';
    ctx.beginPath();
    ctx.arc(510, 340, 42, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(510, 340, 38, 0, 2 * Math.PI);
    ctx.stroke();
    
    ctx.fillStyle = '#d4af37';
    ctx.font = "bold 8px 'Space Grotesk'";
    ctx.fillText("NASA CADET", 510, 332);
    ctx.fillText("NIVEL 2", 510, 343);
    ctx.fillText("APROBADO", 510, 353);
    
    // Signature
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = "italic 13px 'Outfit'";
    ctx.fillText("Comandante Juanpi", 120, 348);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.moveTo(50, 335);
    ctx.lineTo(190, 335);
    ctx.stroke();
    ctx.font = "10px 'Outfit'";
    ctx.fillText("Director de Astro-Ingeniería", 120, 363);
};

// ==========================================================================
// 9. CELEBRATION STARS CONFETTI RAIN ENGINE
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
// 10. BOOTSTRAP INITIALIZER BINDINGS
// ==========================================================================
window.onload = () => {
    initNavigation();
    initIntroWakeUp();
    initGearPuzzle();
    initSensorsModule();
    initVRLaberinto();
    initHardwareMissions();
    initCertificatePreview();
};
