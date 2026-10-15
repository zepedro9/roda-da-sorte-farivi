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
  const colors = ["#ff6b9d", "#ffbd59", "#55d6be", "#7c83fd", "#b47aea", "#ff8b5e"];
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
      const absoluteMid = ((angle + mid) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
      ctx.save();
      ctx.rotate(mid);
      ctx.translate(radius * 0.61, 0);
      // Tangential text; reverse direction on the left half so it remains readable.
      if (absoluteMid > Math.PI / 2 && absoluteMid < Math.PI * 3 / 2) {
        ctx.rotate(-Math.PI / 2);
      } else {
        ctx.rotate(Math.PI / 2);
      }

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
    if (spinning) return;
    spinning = true;
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
        spinButton.disabled = false;
        buttonLabel.textContent = prizes[selectedPrizeIndex];
        burstConfetti();
      }
    }
    requestAnimationFrame(frame);
  }

  function burstConfetti() {
    const symbols = ["✦", "✧", "●", "♥", "★"];
    for (let i = 0; i < 24; i++) {
      const el = document.createElement("span");
      el.textContent = symbols[i % symbols.length];
      Object.assign(el.style, {
        position: "fixed",
        left: Math.random() * 100 + "vw",
        top: "-24px",
        zIndex: "10",
        pointerEvents: "none",
        color: colors[i % colors.length],
        fontSize: (14 + Math.random() * 18) + "px",
        transition: "transform " + (1.8 + Math.random()) + "s ease-in, opacity 2.5s ease"
      });
      document.body.appendChild(el);
      requestAnimationFrame(() => {
        el.style.transform = "translate(" + ((Math.random() - 0.5) * 180) + "px, " + (window.innerHeight + 60) + "px) rotate(" + (Math.random() * 700) + "deg)";
        el.style.opacity = "0";
      });
      setTimeout(() => el.remove(), 3000);
    }
  }

  spinButton.addEventListener("click", spin);
  drawWheel(0);
})();
