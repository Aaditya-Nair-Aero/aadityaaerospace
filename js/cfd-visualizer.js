/* ── FeatherCFD Canvas Visualizer ── */
(function() {
  const canvas = document.getElementById('cfdCanvas');
  if (!canvas) return;

  const tabs = document.querySelectorAll('.cfd-tab');
  let ctx = canvas.getContext('2d');
  let mode = 'velocity';
  let animId = null;
  let particles = [];
  let time = 0;

  /* ── NACA 0012 airfoil points ── */
  function naca0012(t, n) {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const x = 0.5 * (1 - Math.cos(i * Math.PI / n));
      const yt = 0.12 / 0.2 * (0.2969 * Math.sqrt(x) - 0.1260 * x - 0.3516 * x * x + 0.2843 * x * x * x - 0.1015 * x * x * x * x);
      pts.push({ x: t === 'upper' ? x : x, y: t === 'upper' ? yt : -yt });
    }
    return pts;
  }

  const upper = naca0012('upper', 60);
  const lower = naca0012('lower', 60);

  function drawAirfoil(c, w, h, offsetX, offsetY, scale) {
    c.beginPath();
    c.moveTo(offsetX + upper[0].x * scale, offsetY - upper[0].y * scale);
    for (let i = 1; i < upper.length; i++) {
      c.lineTo(offsetX + upper[i].x * scale, offsetY - upper[i].y * scale);
    }
    for (let i = lower.length - 1; i >= 0; i--) {
      c.lineTo(offsetX + lower[i].x * scale, offsetY - lower[i].y * scale);
    }
    c.closePath();
  }

  function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height || rect.width * 9 / 16;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = (rect.height || rect.width * 9 / 16) + 'px';
    initParticles();
    drawFrame();
  }

  function initParticles() {
    particles = [];
    const w = canvas.width, h = canvas.height;
    for (let i = 0; i < 200; i++) {
      particles.push({
        x: Math.random() * w * 0.3,
        y: Math.random() * h,
        vx: 2 + Math.random() * 2,
        vy: (Math.random() - 0.5) * 0.5,
        life: Math.random() * 200
      });
    }
  }

  function isInsideAirfoil(px, py, w, h) {
    const scale = Math.min(w, h) * 0.5;
    const ox = w * 0.35;
    const oy = h * 0.55;
    const ux = (px - ox) / scale;
    const uy = (oy - py) / scale;
    if (ux < 0 || ux > 1) return false;
    const t = 0.12 / 0.2 * (0.2969 * Math.sqrt(ux) - 0.1260 * ux - 0.3516 * ux * ux + 0.2843 * ux * ux * ux - 0.1015 * ux * ux * ux * ux);
    return Math.abs(uy) <= t;
  }

  function getStreamVelocity(px, py, w, h) {
    const scale = Math.min(w, h) * 0.5;
    const ox = w * 0.35;
    const oy = h * 0.55;
    const dx = (px - ox) / scale;
    const dy = (oy - py) / scale;

    let u = 1;
    let v = 0;

    const r = Math.sqrt(dx * dx + dy * dy);
    if (r > 0.05) {
      const strength = 0.5;
      u += strength * (-dy) / (2 * Math.PI * r * r);
      v += strength * dx / (2 * Math.PI * r * r);
    }

    return { vx: u * 2, vy: v * 0.8 };
  }

  function drawFrame() {
    if (mode !== 'velocity') return;
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const scale = Math.min(w, h) * 0.5;
    const ox = w * 0.35;
    const oy = h * 0.55;

    /* Draw airfoil */
    ctx.strokeStyle = 'rgba(74, 124, 191, 0.3)';
    ctx.lineWidth = 1.5;
    drawAirfoil(ctx, w, h, ox, oy, scale);
    ctx.stroke();

    /* Update and draw particles */
    for (let p of particles) {
      const vel = getStreamVelocity(p.x, p.y, w, h);
      p.x += vel.vx;
      p.y += vel.vy;
      p.life--;

      if (p.life <= 0 || p.x > w || p.y < -10 || p.y > h + 10 || isInsideAirfoil(p.x, p.y, w, h)) {
        p.x = Math.random() * w * 0.2;
        p.y = Math.random() * h;
        p.life = 200 + Math.random() * 100;
      }

      const alpha = Math.min(1, p.life / 100) * 0.6;
      ctx.fillStyle = `rgba(74, 124, 191, ${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    /* Velocity vector field overlay (sparse) */
    ctx.strokeStyle = 'rgba(74, 124, 191, 0.06)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < w; x += 40) {
      for (let y = 0; y < h; y += 40) {
        if (!isInsideAirfoil(x, y, w, h)) {
          const vel = getStreamVelocity(x, y, w, h);
          const len = Math.sqrt(vel.vx * vel.vx + vel.vy * vel.vy);
          if (len > 0.1) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + vel.vx * 4, y + vel.vy * 4);
            ctx.stroke();
          }
        }
      }
    }

    /* Direction annotation */
    ctx.fillStyle = 'rgba(74, 124, 191, 0.2)';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText('Freestream →', w - 140, 20);
    ctx.fillText('Re = 5000', w - 120, 34);

    time++;
    animId = requestAnimationFrame(drawFrame);
  }

  function drawPressure() {
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const scale = Math.min(w, h) * 0.5;
    const ox = w * 0.35;
    const oy = h * 0.55;

    /* Pressure contour map */
    const imageData = ctx.createImageData(w, h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dx = (x - ox) / scale;
        const dy = (oy - y) / scale;
        const r = Math.sqrt(dx * dx + dy * dy);
        let p = 0;
        if (r > 0.1) {
          p = 1 + 0.3 * Math.cos(2 * Math.atan2(dy, dx)) / (r * 1.5);
        }
        p = Math.max(0, Math.min(1, p));
        const idx = (y * w + x) * 4;
        const val = Math.floor(p * 255);
        const blue = Math.floor(Math.max(0, 1 - p * 2) * 180 + 40);
        const red = Math.floor(Math.max(0, p * 2 - 1) * 150);
        imageData.data[idx] = red;
        imageData.data[idx + 1] = 0;
        imageData.data[idx + 2] = blue;
        imageData.data[idx + 3] = 200;
      }
    }
    ctx.putImageData(imageData, 0, 0);

    /* Airfoil overlay */
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    drawAirfoil(ctx, w, h, ox, oy, scale);
    ctx.stroke();

    ctx.fillStyle = 'rgba(74, 124, 191, 0.2)';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText('Pressure Contour', 10, 20);
    ctx.fillText('High ←——→ Low', 10, 34);

    ctx.fillStyle = 'rgba(74, 124, 191, 0.15)';
    ctx.fillRect(10, h - 60, 20, 40);
    const grad = ctx.createLinearGradient(10, h - 60, 10, h - 20);
    grad.addColorStop(0, 'rgb(150, 0, 40)');
    grad.addColorStop(1, 'rgb(40, 0, 180)');
    ctx.fillStyle = grad;
    ctx.fillRect(10, h - 60, 20, 40);
  }

  function drawMesh() {
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const scale = Math.min(w, h) * 0.5;
    const ox = w * 0.35;
    const oy = h * 0.55;

    ctx.strokeStyle = 'rgba(74, 124, 191, 0.08)';
    ctx.lineWidth = 0.5;

    const rows = 20;
    const cols = 30;
    const spacingX = w * 0.6 / cols;
    const spacingY = h * 0.6 / rows;

    for (let r = 0; r <= rows; r++) {
      ctx.beginPath();
      for (let c = 0; c <= cols; c++) {
        const x = ox - w * 0.3 + c * spacingX;
        const y = oy - h * 0.3 + r * spacingY;
        if (c === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    for (let c = 0; c <= cols; c++) {
      ctx.beginPath();
      for (let r = 0; r <= rows; r++) {
        const x = ox - w * 0.3 + c * spacingX;
        const y = oy - h * 0.3 + r * spacingY;
        if (r === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(74, 124, 191, 0.2)';
    ctx.lineWidth = 1.2;
    drawAirfoil(ctx, w, h, ox, oy, scale);
    ctx.stroke();

    ctx.fillStyle = 'rgba(74, 124, 191, 0.2)';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText('Unstructured Grid (192³)', 10, 20);
    ctx.fillText('Cells: ~7 million', 10, 34);
  }

  function switchMode(newMode) {
    mode = newMode;
    if (animId) { cancelAnimationFrame(animId); animId = null; }

    if (mode === 'velocity') {
      drawFrame();
    } else if (mode === 'pressure') {
      drawPressure();
    } else if (mode === 'mesh') {
      drawMesh();
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      switchMode(tab.getAttribute('data-canvas'));
    });
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resizeCanvas, 200);
  });

  resizeCanvas();
})();
