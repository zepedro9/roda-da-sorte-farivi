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

      // Keep every prize name inside its own coloured segment.
      ctx.save();
      const mid = start + slice / 2;
      ctx.rotate(mid);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(41, 19, 75, 0.28)";
      ctx.shadowBlur = 3;

      let fontSize = 29;
      const maxTextWidth = radius * 0.68;
      ctx.font = "700 " + fontSize + "px system-ui, sans-serif";
      while (ctx.measureText(prizes[i]).width > maxTextWidth && fontSize > 15) {
        fontSize -= 1;
        ctx.font = "700 " + fontSize + "px system-ui, sans-serif";
      }

      // Text follows the segment but stays on the readable side.
      if (Math.cos(mid) < 0) {
        ctx.rotate(Math.PI);
      }
      ctx.fillText(prizes[i], radius * 0.62, 0, maxTextWidth);
      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.lineWidth = 10;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
    ctx.restore();
  }

  function easeOutQuint(t) {
    return 1 - Math.pow(1 - t, 5);
  }

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
