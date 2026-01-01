window.addEventListener("load", main);

const canvas = document.getElementById("app");
const ctx = canvas.getContext("2d");
const audioCtx = new AudioContext();

const X_MIN = -14;
const X_MAX = 14;
const SAMPLES = 400;
const NOTE_PLAYTIME = 10;
let WIDTH;
let HEIGHT; 
let plottedPoints = [];

canvas.addEventListener("click", playSound);

function main(event) {
	console.log("Starting app...");
    plotFunction(x => Math.cos(10*x) - 10 * Math.cos(2*x));
}

function clearCanvas() {
    WIDTH = canvas.width;
    HEIGHT = canvas.height;
    plottedPoints = [];

	ctx.fillStyle = "#353935";
	ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.strokeStyle = "#e9e9e970";
    const noteWidth = WIDTH / 35;
    for (let i = 1; i < 35; i++) {
        ctx.beginPath();
        ctx.moveTo(i * noteWidth, 0);
        ctx.lineTo(i * noteWidth, HEIGHT);
        ctx.lineWidth = i % 7 === 0 ? 4 : 1;
        ctx.stroke();
    }
    
    ctx.strokeStyle = "#e9e9e970";
    const noteHeight = HEIGHT / 35;
    for (let i = 1; i < 35; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * noteHeight);
        ctx.lineTo(WIDTH, i * noteHeight);
        ctx.lineWidth = i % 7 === 0 ? 4 : 1;
        ctx.stroke();
    }
}

function plotFunction(f) {
    clearCanvas();
    ctx.strokeStyle = "#2ECC71";
    ctx.lineWidth = 4;
    ctx.beginPath()

    for (let i = 0; i <= SAMPLES; i++) {
        const x = X_MIN + (i / SAMPLES) * (X_MAX - X_MIN)
        const y = f(x)
        plottedPoints.push(y);

        const cx = ((x - X_MIN) / (X_MAX - X_MIN)) * WIDTH
        const cy = HEIGHT - ((y - X_MIN) / (X_MAX - X_MIN)) * HEIGHT

        if (i === 0) ctx.moveTo(cx, cy)
        else ctx.lineTo(cx, cy)
    }

    ctx.stroke()
}

async function playSound() {
    const oscillator = audioCtx.createOscillator();

    oscillator.frequency.setValueAtTime(isNaN(plottedPoints[0]) ? 0 : plottedPoints[0], audioCtx.currentTime);
    oscillator.connect(audioCtx.destination);
    oscillator.start();

    ctx.strokeStyle = "#4DA5E0";
    ctx.lineWidth = 8;

    for (let i = 1; i < SAMPLES; i++)  {
        let {cx: cx1, cy: cy1} = getCoordinates(i - 1, plottedPoints[i - 1]);
        let {cx, cy} = getCoordinates(i, plottedPoints[i]);

        ctx.beginPath();
        ctx.moveTo(cx1, cy1);
        ctx.lineTo(cx, cy);
        ctx.stroke();

        await setFrequency(plottedPoints[i] + 262, oscillator);
    }

	setTimeout(() => { oscillator.stop(); }, NOTE_PLAYTIME);
}

function getCoordinates(i, y) {
    const x1 = X_MIN+ ((i) / SAMPLES) * (X_MAX - X_MIN);
    const cx = ((x1 - X_MIN) / (X_MAX - X_MIN)) * WIDTH;
    const cy = HEIGHT - ((y - X_MIN) / (X_MAX - X_MIN)) * HEIGHT;

    return {cx, cy};
}

function setFrequency(hz, oscillator) {
    if (isNaN(hz)) {
        hz = 0;
    }

    return new Promise((resolve, _) => {
        setTimeout(() => {
            oscillator.frequency.setValueAtTime(hz, audioCtx.currentTime);
            resolve(hz);
        }, NOTE_PLAYTIME);
    });
}
