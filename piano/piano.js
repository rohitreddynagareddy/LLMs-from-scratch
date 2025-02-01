const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const activeOscillators = new Map();

const keyMap = {
    'a': 440.00,  // A4
    's': 493.88,  // B4
    'd': 523.25,  // C5
    'f': 587.33,  // D5
    'g': 659.26,  // E5
    'h': 698.46,  // F5
    'j': 783.99,  // G5
    'k': 880.00,  // A5
    'w': 466.16,  // A#4
    'e': 554.37,  // C#5
    't': 622.25,  // D#5
    'y': 739.99,  // F#5
    'u': 830.61   // G#5
};

function createPianoKeys() {
    const piano = document.getElementById('piano');
    const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    
    whiteKeys.forEach((note, index) => {
        const key = document.createElement('div');
        key.className = 'key white-key';
        key.dataset.note = index + 1;
        piano.appendChild(key);
    });

    const blackKeyPositions = [0, 1, 3, 4, 5];
    blackKeyPositions.forEach(pos => {
        const key = document.createElement('div');
        key.className = 'key black-key';
        key.style.left = `${(pos * 50) + 35}px`;
        piano.appendChild(key);
    });
}

function playNote(frequency) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = document.getElementById('waveform').value;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    gainNode.gain.setValueAtTime(document.getElementById('volume').value, audioContext.currentTime);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start();
    
    return { oscillator, gainNode };
}

function stopNote(noteId) {
    if (activeOscillators.has(noteId)) {
        const { oscillator, gainNode } = activeOscillators.get(noteId);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
        oscillator.stop(audioContext.currentTime + 0.1);
        activeOscillators.delete(noteId);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    createPianoKeys();
    
    document.querySelectorAll('.key').forEach(key => {
        key.addEventListener('mousedown', () => {
            const note = Object.values(keyMap)[key.dataset.note - 1];
            activeOscillators.set(note, playNote(note));
            key.classList.add('active');
        });

        key.addEventListener('mouseup', () => {
            const note = Object.values(keyMap)[key.dataset.note - 1];
            if (!document.getElementById('sustain').checked) {
                stopNote(note);
            }
            key.classList.remove('active');
        });

        key.addEventListener('mouseleave', () => {
            const note = Object.values(keyMap)[key.dataset.note - 1];
            if (!document.getElementById('sustain').checked) {
                stopNote(note);
            }
            key.classList.remove('active');
        });
    });

    // Keyboard event listeners
    document.addEventListener('keydown', (e) => {
        if (keyMap[e.key] && !e.repeat) {
            activeOscillators.set(keyMap[e.key], playNote(keyMap[e.key]));
            document.querySelector(`[data-note="${Object.keys(keyMap).indexOf(e.key) + 1}"]`).classList.add('active');
        }
    });

    document.addEventListener('keyup', (e) => {
        if (keyMap[e.key]) {
            if (!document.getElementById('sustain').checked) {
                stopNote(keyMap[e.key]);
            }
            document.querySelector(`[data-note="${Object.keys(keyMap).indexOf(e.key) + 1}"]`).classList.remove('active');
        }
    });
});
