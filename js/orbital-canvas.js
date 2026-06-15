/* ── Hero Background Canvas: Animated Orbital Trajectories + Streamlines ── */
(function() {
  try {
  const bg = document.getElementById('heroBg');
  if (!bg) return;

  const canvas = document.createElement('canvas');
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  bg.appendChild(canvas);

  let ctx, W, H, dpr, time = 0, animId;

  const orbits = [
    { rx: 0.24, ry: 0.10, angle: 0.3, speed: 0.3, dashed: false },
    { rx: 0.34, ry: 0.13, angle: -0.2, speed: -0.35, dashed: false },
    { rx: 0.44, ry: 0.17, angle: 0.15, speed: 0.2, dashed: true }
  ];

  function resize() {
    dpr = window.devicePixelRatio || 1;
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
  }

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);

    const cx = W / 2;
    const cy = H / 2;

    /* ── Animated orbits ── */
    orbits.forEach(orb => {
      const rx = W * orb.rx;
      const ry = W * orb.ry;
      const rot = orb.angle + time * orb.speed;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);

      ctx.strokeStyle = 'rgba(74, 124, 191, 0.25)';
      ctx.lineWidth = 1;
      if (orb.dashed) ctx.setLineDash([4, 8]);
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      const nodeAngle = time * 0.5;
      const nx = Math.cos(nodeAngle) * rx;
      const ny = Math.sin(nodeAngle) * ry;
      ctx.fillStyle = 'rgba(74, 124, 191, 0.5)';
      ctx.beginPath();
      ctx.arc(nx, ny, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    /* ── CFD Streamlines ── */
    ctx.strokeStyle = 'rgba(74, 124, 191, 0.12)';
    ctx.lineWidth = 0.8;

    function drawStreamline(x1, y1, cpx1, cpy1, cpx2, cpy2, x2, y2) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, x2, y2);
      ctx.stroke();
    }

    drawStreamline(100, 500, 200, 300, 400, 600, 700, 400);
    drawStreamline(200, 550, 300, 350, 500, 650, 800, 450);
    drawStreamline(150, 480, 250, 280, 350, 580, 650, 380);

    /* ── Wireframe Rockets ── */
    function drawRocket(x, y, scale) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.strokeStyle = 'rgba(74, 124, 191, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -80);  ctx.lineTo(12, -40);
      ctx.lineTo(12, 30);  ctx.lineTo(20, 50);
      ctx.lineTo(20, 70);  ctx.lineTo(-20, 70);
      ctx.lineTo(-20, 50); ctx.lineTo(-12, 30);
      ctx.lineTo(-12, -40); ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -80); ctx.lineTo(-8, -70);
      ctx.moveTo(0, -80); ctx.lineTo(8, -70);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-20, 70); ctx.lineTo(-28, 85);
      ctx.moveTo(20, 70);  ctx.lineTo(28, 85);
      ctx.stroke();
      ctx.restore();
    }

    drawRocket(W * 0.12, H * 0.7, 0.7);
    drawRocket(W * 0.88, H * 0.25, 0.5);

    /* ── Labels ── */
    const pulse = 0.2 + 0.12 * Math.sin(time * 3.0);
    ctx.fillStyle = `rgba(74, 124, 191, ${pulse})`;
    ctx.font = '13px "JetBrains Mono", monospace';
    ctx.fillText('ΔV', 60, 120);
    ctx.fillText('Isp', W - 100, 180);
    ctx.fillText('Mach', 80, H - 100);
    ctx.fillText('Re', W - 120, H - 80);
    ctx.fillText('APIC', W * 0.4, 80);
    ctx.fillText('ACPI', W * 0.7, H - 60);

    time += 0.03;
    animId = requestAnimationFrame(draw);
  }

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resize, 150);
  });

  resize();
  draw();
  } catch(e) {
    console.warn('orbital-canvas:', e.message);
  }
})();
