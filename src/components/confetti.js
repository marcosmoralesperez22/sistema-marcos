// =============================================
// CONFETTI — Canvas particle effects
// =============================================

let canvas = null;
let ctx = null;
let particles = [];
let animId = null;

function ensureCanvas() {
    if (canvas) return;
    canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99999;';
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
}

function resize() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

const COLORS = ['#ff6b35', '#ffa726', '#ffcc02', '#4fc3f7', '#ab47bc', '#66bb6a', '#ef5350', '#ec407a'];

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = -10 - Math.random() * 40;
        this.w = 6 + Math.random() * 6;
        this.h = 4 + Math.random() * 4;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = 2 + Math.random() * 3;
        this.rotation = Math.random() * 360;
        this.rotSpeed = (Math.random() - 0.5) * 10;
        this.opacity = 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.04; // gravity
        this.rotation += this.rotSpeed;
        this.opacity -= 0.003;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.opacity);
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
        ctx.restore();
    }
}

function animate() {
    if (!ctx || particles.length === 0) {
        if (canvas) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        animId = null;
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = particles.filter(p => p.opacity > 0 && p.y < canvas.height + 20);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    animId = requestAnimationFrame(animate);
}

export function launchConfetti(count = 120) {
    ensureCanvas();
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }
    if (!animId) {
        animId = requestAnimationFrame(animate);
    }
}

// Play a satisfying "check" sound using Web Audio API
export function playCheckSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        // First tone
        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc1.frequency.setValueAtTime(1320, audioCtx.currentTime + 0.08);
        gain1.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
        osc1.connect(gain1);
        gain1.connect(audioCtx.destination);
        osc1.start(audioCtx.currentTime);
        osc1.stop(audioCtx.currentTime + 0.2);

        // Cleanup
        setTimeout(() => audioCtx.close(), 500);
    } catch (e) {
        // Audio not supported, silent fail
    }
}
