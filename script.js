(() => {
  "use strict";

  const prizes = [
    "Raspadinha de 5€",
    "Jantar restaurante à escolha",
    "Carro",
    "Noite no Sheraton Hotel",
    "iPhone 18 Pro Max",
    "Vale 200€ para viagem"
  ];
  const selectedPrizeIndex = 5;
  const colors = ["#e53935", "#f9a825", "#43a047", "#1e88e5", "#8e24aa", "#00acc1"];
  const canvas = document.getElementById("wheel");
  const ctx = canvas && canvas.getContext("2d");
  const spinButton = document.getElementById("spin-button");
  const buttonLabel = document.getElementById("button-label");
  if (!canvas || !ctx || !spinButton || !buttonLabel) return;

  const size = canvas.width;
  const center = size / 2;
  const radius = center - 15;
  const slice = (Math.PI * 2) / prizes.length;
  let rotation = 0;
  let spinning = false;
  let hasSpun = false;

  // Generate wheel ticks and a celebratory sparkle using Web Audio; no audio files required.
  let audioContext = null;
  let lastTickAt = 0;
  let tickCounter = 0;

  function prepareAudio() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      if (!audioContext) audioContext = new AudioContextClass();
      if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
      return audioContext;
    } catch (_) {
      return null;
    }
  }

  function playTone(frequency, duration, type, volume, delay = 0) {
    const audio = prepareAudio();
    if (!audio) return;
    try {
      const startAt = audio.currentTime + delay;
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = type || "sine";
      oscillator.frequency.setValueAtTime(frequency, startAt);
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), startAt + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start(startAt);
      oscillator.stop(startAt + duration + 0.025);
    } catch (_) {}
  }

  function playWheelTick(progress) {
    const now = performance.now();
    const interval = 42 + progress * 180;
    if (now - lastTickAt < interval) return;
    lastTickAt = now;
    tickCounter++;
    playTone(620 + (tickCounter % 3) * 85, 0.045, "square", 0.035);
  }

  function playCelebrationSound() {
    // Bright ascending chime when the wheel lands, with a soft sparkling tail.
    [[523.25, 0], [659.25, 0.11], [783.99, 0.22], [1046.5, 0.36], [1318.5, 0.52]].forEach(([frequency, delay], i) => {
      playTone(frequency, 0.42, "sine", i === 4 ? 0.11 : 0.085, delay);
    });
    [1568, 2093, 1760, 2349, 1976, 2637].forEach((frequency, i) => {
      playTone(frequency, 0.22, "triangle", 0.045, 0.72 + i * 0.085);
    });
  }

  function wrapText(text, maxWidth, font) {
    ctx.font = font;
    const words = text.split(" ");
    const lines = [];
    let line = "";
    for (const word of words) {
      const candidate = line ? line + " " + word : word;
      if (ctx.measureText(candidate).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  function drawWheel(angle = 0) {
    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(angle);

    for (let i = 0; i < prizes.length; i++) {
      const start = -Math.PI / 2 + i * slice;
      const end = start + slice;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = colors[i];
      ctx.fill();
      ctx.lineWidth = 8;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();

      // Place wrapped labels tangentially inside each slice.
      const mid = start + slice / 2;
      ctx.save();
      ctx.rotate(mid);
      ctx.translate(radius * 0.61, 0);
      // Fixed radial orientation: each label's bottom always points outwards.
      ctx.rotate(Math.PI / 2);

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(41, 19, 75, 0.28)";
      ctx.shadowBlur = 3;

      let fontSize = 24;
      let lines = wrapText(prizes[i], 112, "700 " + fontSize + "px system-ui, sans-serif");
      while (lines.length > 3 && fontSize > 15) {
        fontSize -= 1;
        lines = wrapText(prizes[i], 112, "700 " + fontSize + "px system-ui, sans-serif");
      }
      ctx.font = "700 " + fontSize + "px system-ui, sans-serif";
      const lineHeight = fontSize * 1.12;
      const startY = -((lines.length - 1) * lineHeight) / 2;
      lines.forEach((line, lineIndex) => {
        ctx.fillText(line, 0, startY + lineIndex * lineHeight, 112);
      });
      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.lineWidth = 10;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
    ctx.restore();
  }

  const easeOutQuint = t => 1 - Math.pow(1 - t, 5);

  function spin() {
    if (spinning || hasSpun) return;
    prepareAudio(); // The click gesture unlocks audio on supported browsers.
    lastTickAt = 0;
    tickCounter = 0;
    spinning = true;
    hasSpun = true;
    spinButton.disabled = true;
    buttonLabel.textContent = "A girar…";

    const startRotation = rotation;
    const targetAngle = (Math.PI * 2) - ((selectedPrizeIndex + 0.5) * slice);
    const currentAngle = ((startRotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const normalizedTarget = ((targetAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const delta = (normalizedTarget - currentAngle + Math.PI * 2) % (Math.PI * 2);
    const extraTurns = 6 + Math.floor(Math.random() * 3);
    const endRotation = startRotation + extraTurns * Math.PI * 2 + delta;
    const duration = 4800 + Math.random() * 500;
    const startTime = performance.now();

    function frame(now) {
      const progress = Math.min(1, (now - startTime) / duration);
      rotation = startRotation + (endRotation - startRotation) * easeOutQuint(progress);
      drawWheel(rotation);
      playWheelTick(progress);
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        rotation = endRotation;
        drawWheel(rotation);
        spinning = false;
        spinButton.disabled = true;
        spinButton.classList.add("is-finished");
        buttonLabel.textContent = prizes[selectedPrizeIndex];
        playCelebrationSound();
        burstConfetti();
      }
    }
    requestAnimationFrame(frame);
  }

  function burstConfetti() {
    // A much bigger, multi-wave celebration using canvas-confetti.
    if (typeof confetti !== "function") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const palette = ["#e53935", "#f9a825", "#43a047", "#1e88e5", "#8e24aa", "#00acc1", "#ffffff"];
    const base = { colors: palette, zIndex: 20, disableForReducedMotion: true };
    const fire = (options) => confetti(Object.assign({}, base, options));

    // Dense central blast with broad, overlapping layers.
    fire({ particleCount: 180, spread: 78, startVelocity: 58, origin: { x: 0.5, y: 0.62 }, scalar: 1.15, ticks: 260 });
    fire({ particleCount: 140, spread: 115, startVelocity: 48, decay: 0.91, origin: { x: 0.5, y: 0.62 }, scalar: 1.05, ticks: 280 });
    fire({ particleCount: 90, spread: 145, startVelocity: 36, decay: 0.92, origin: { x: 0.5, y: 0.62 }, scalar: 1.35, shapes: ["square", "star"], ticks: 300 });

    // Big cannons from both sides, followed by two extra volleys.
    const sideVolley = () => {
      fire({ particleCount: 90, angle: 60, spread: 72, startVelocity: 58, origin: { x: 0.02, y: 0.72 }, scalar: 1.05, ticks: 260 });
      fire({ particleCount: 90, angle: 120, spread: 72, startVelocity: 58, origin: { x: 0.98, y: 0.72 }, scalar: 1.05, ticks: 260 });
    };
    setTimeout(sideVolley, 180);
    setTimeout(() => {
      fire({ particleCount: 100, spread: 100, startVelocity: 46, origin: { x: 0.5, y: 0.55 }, scalar: 1.1, ticks: 280 });
      sideVolley();
    }, 650);
    setTimeout(() => {
      fire({ particleCount: 70, spread: 130, startVelocity: 34, decay: 0.92, origin: { x: 0.5, y: 0.55 }, scalar: 1.3, shapes: ["square", "star"], ticks: 300 });
    }, 1150);
  }

  spinButton.addEventListener("click", spin);
  drawWheel(0);
})();
