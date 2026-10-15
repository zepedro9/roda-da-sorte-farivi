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
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        rotation = endRotation;
        drawWheel(rotation);
        spinning = false;
        spinButton.disabled = true;
        spinButton.classList.add("is-finished");
        buttonLabel.textContent = prizes[selectedPrizeIndex];
        burstConfetti();
      }
    }
    requestAnimationFrame(frame);
  }

  function burstConfetti() {
    // Layered celebration using the canvas-confetti library loaded in index.html.
    if (typeof confetti !== "function") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const palette = ["#e53935", "#f9a825", "#43a047", "#1e88e5", "#8e24aa", "#00acc1", "#ffffff"];
    const base = { colors: palette, zIndex: 20, disableForReducedMotion: true };

    // Layer several bursts to create depth, varied particle sizes and a less uniform spread.
    confetti(Object.assign({}, base, {
      particleCount: 90, spread: 62, startVelocity: 52,
      origin: { x: 0.5, y: 0.62 }, scalar: 1.05
    }));
    confetti(Object.assign({}, base, {
      particleCount: 55, spread: 100, startVelocity: 38, decay: 0.91,
      origin: { x: 0.5, y: 0.62 }, scalar: 0.9
    }));
    confetti(Object.assign({}, base, {
      particleCount: 35, spread: 130, startVelocity: 28, decay: 0.92,
      origin: { x: 0.5, y: 0.62 }, scalar: 1.2, shapes: ["square", "star"]
    }));

    // Short side cannons add a second wave without leaving a long animation running.
    setTimeout(() => {
      confetti(Object.assign({}, base, {
        particleCount: 42, angle: 60, spread: 58, startVelocity: 48,
        origin: { x: 0.04, y: 0.72 }, scalar: 0.9
      }));
      confetti(Object.assign({}, base, {
        particleCount: 42, angle: 120, spread: 58, startVelocity: 48,
        origin: { x: 0.96, y: 0.72 }, scalar: 0.9
      }));
    }, 140);
  }

  spinButton.addEventListener("click", spin);
  drawWheel(0);
})();
