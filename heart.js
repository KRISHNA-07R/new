(() => {
  const canvas = document.getElementById('heartCanvas');
  const ctx = canvas.getContext('2d');
  const messageEl = document.getElementById('message');

  const heartColor = 'rgba(255, 80, 160, 1)';
  const glowColor  = 'rgba(255, 120, 200, .9)';
  const pointerColor = 'rgba(255, 170, 220, 1)';
  const bgSparkle = true;
  const lines = ["HAPPY BIRTHDAY", "DEAR ANUSHKA"];

  let bounceOffset = 0;
  let bounceTime = 0;
  let bouncing = false;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = Math.floor(innerWidth  * dpr);
    canvas.height = Math.floor(innerHeight * dpr);
    canvas.style.width  = innerWidth  + 'px';
    canvas.style.height = innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    resetAnim();
  }
  window.addEventListener('resize', resize);

  function heartPoint(t, scale, cx, cy) {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
    return [cx + x * scale, cy - y * scale];
  }

  let t = 0;
  let lastPt = null;
  let animId = null;
  let scale = 1, cx = 0, cy = 0, lineW = 6;
  let drawn = false;
  let sparks = [];

  function resetAnim() {
    cancelAnimationFrame(animId);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const minDim = Math.min(innerWidth, innerHeight);
    scale = (minDim * 0.70) / 32;
    cx = innerWidth / 2;
    cy = innerHeight / 2 + minDim * 0.03;
    lineW = Math.max(4, Math.floor(scale * 0.30));
    t = 0;
    lastPt = null;
    drawn = false;
    sparks = [];
    bounceTime = 0;
    bouncing = false;
    messageEl.classList.remove('show');
    loop();
  }

  function sparkle(x, y) {
    return {
      x, y,
      r: Math.random() * 1.6 + 0.8,
      a: 1,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.7) * 0.6,
      life: 30 + Math.random() * 30
    };
  }

  function drawBackgroundGlow() {
    const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(innerWidth, innerHeight));
    g.addColorStop(0, 'rgba(255, 50, 150, .06)');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, innerWidth, innerHeight);
  }

  function drawPointer(x, y) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.shadowBlur = 18;
    ctx.shadowColor = glowColor;
    ctx.fillStyle = pointerColor;
    ctx.beginPath();
    ctx.arc(x, y, lineW * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawSegment(from, to) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = lineW;
    ctx.globalCompositeOperation = 'lighter';

    ctx.shadowBlur = 30;
    ctx.shadowColor = glowColor;
    ctx.strokeStyle = glowColor;
    ctx.beginPath(); ctx.moveTo(from[0], from[1]); ctx.lineTo(to[0], to[1]); ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = heartColor;
    ctx.lineWidth = lineW * 0.7;
    ctx.beginPath(); ctx.moveTo(from[0], from[1]); ctx.lineTo(to[0], to[1]); ctx.stroke();
    ctx.restore();
  }

  function drawTextInsideHeart() {
    bouncing = true; // start bounce animation

    const centerX = cx;
    const centerY = cy - scale * 0.8;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const base = Math.min(innerWidth, innerHeight);
    const fontSize = Math.max(24, Math.floor(base * 0.075));
    ctx.font = `800 ${fontSize}px system-ui, sans-serif`;

    const grad = ctx.createLinearGradient(centerX - 50, centerY - 50, centerX + 50, centerY + 50);
    grad.addColorStop(0, '#fff');
    grad.addColorStop(1, '#ffd1ec');

    ctx.shadowBlur = 26;
    ctx.shadowColor = 'rgba(255, 110, 180, .9)';
    ctx.fillStyle = grad;

    const lineGap = Math.floor(fontSize * 1.15);
    ctx.fillText(lines[0], centerX, centerY - lineGap / 2 + bounceOffset);
    ctx.fillText(lines[1], centerX, centerY + lineGap / 2 + bounceOffset);
    ctx.restore();

    messageEl.innerHTML = `<h1>${lines[0]}<br/>${lines[1]}</h1>`;
    messageEl.classList.add('show');
  }

  function loop() {
    animId = requestAnimationFrame(loop);
    drawBackgroundGlow();

    if (!drawn) {
      const dt = 0.035;
      const pt = heartPoint(t, scale, cx, cy);

      if (lastPt) {
        drawSegment(lastPt, pt);
        if (bgSparkle && Math.random() < 0.8) sparks.push(sparkle(pt[0], pt[1]));
      }
      drawPointer(pt[0], pt[1]);

      if (bgSparkle) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let i = sparks.length - 1; i >= 0; i--) {
          const s = sparks[i];
          s.life -= 1;
          s.a = Math.max(0, s.life / 60);
          s.x += s.vx; s.y += s.vy;
          ctx.fillStyle = `rgba(255, 140, 200, ${s.a})`;
          ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
          if (s.life <= 0) sparks.splice(i, 1);
        }
        ctx.restore();
      }

      lastPt = pt;
      t += dt;

      if (!drawn && t >= Math.PI * 2 + 0.1) {
        drawn = true;
        setTimeout(drawTextInsideHeart, 450);
      }
    } else if (bouncing) {
      // Bounce effect
      bounceTime += 0.05; // speed of bounce
      bounceOffset = Math.sin(bounceTime) * 6; // bounce height in px
      drawTextInsideHeart();
    }
  }

  resize();
})();
