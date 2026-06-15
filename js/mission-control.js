/* ── FeatherOrbital: Mission Control Canvas ── */
(function() {
  const canvas = document.getElementById('orbitCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H;
  let hoveredOrbit = -1;

  const orbits = [
    { label: 'LEO', radius: 0.25, rotation: 0.3, speed: 0.008, color: 'rgba(74, 124, 191, 0.3)' },
    { label: 'GTO', radius: 0.45, rotation: -0.2, speed: 0.004, color: 'rgba(74, 124, 191, 0.2)' },
    { label: 'TLI', radius: 0.65, rotation: 0.15, speed: 0.002, color: 'rgba(74, 124, 191, 0.15)' }
  ];

  let animId;
  let time = 0;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const size = Math.min(rect.width, 500);
    canvas.width = size;
    canvas.height = size;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    W = size;
    H = size;
    draw();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    const cx = W / 2;
    const cy = H / 2;
    const maxR = Math.min(W, H) * 0.4;

    /* Earth (wireframe) */
    ctx.strokeStyle = 'rgba(74, 124, 191, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, maxR * 0.12, 0, Math.PI * 2);
    ctx.stroke();

    /* Earth cross-hairs */
    ctx.strokeStyle = 'rgba(74, 124, 191, 0.08)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(cx - maxR * 0.15, cy);
    ctx.lineTo(cx + maxR * 0.15, cy);
    ctx.moveTo(cx, cy - maxR * 0.15);
    ctx.lineTo(cx, cy + maxR * 0.15);
    ctx.stroke();

    /* Latitude lines */
    ctx.beginPath();
    ctx.ellipse(cx, cy, maxR * 0.12, maxR * 0.06, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(74, 124, 191, 0.2)';
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('EARTH', cx, cy + 4);

    /* Orbits */
    orbits.forEach((orb, i) => {
      const r = maxR * orb.radius;
      const isHovered = hoveredOrbit === i;
      const alpha = isHovered ? 0.8 : 0.3;
      const color = `rgba(74, 124, 191, ${alpha * (orb.radius >= 0.5 ? 0.6 : 1)})`;
      const dashed = orb.radius > 0.4;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(orb.rotation + time * orb.speed);

      ctx.strokeStyle = color;
      ctx.lineWidth = isHovered ? 1.5 : 0.8;
      if (dashed) ctx.setLineDash([3, 6]);
      ctx.beginPath();
      ctx.ellipse(0, 0, r, r * 0.55, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      /* Orbital node indicator */
      const angle = time * orb.speed * 3;
      const nx = Math.cos(angle) * r;
      const ny = Math.sin(angle) * r * 0.55;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(nx, ny, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      /* Label */
      ctx.fillStyle = color;
      ctx.font = isHovered ? '11px "JetBrains Mono", monospace' : '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      const labelAngle = orb.rotation;
      const lx = cx + Math.cos(labelAngle) * r * 1.05;
      const ly = cy + Math.sin(labelAngle) * r * 0.55 * 1.05;
      ctx.fillText(orb.label, lx + 6, ly + 3);
    });

    /* Hover tooltip */
    if (hoveredOrbit >= 0) {
      const orb = orbits[hoveredOrbit];
      const r = maxR * orb.radius;
      ctx.fillStyle = 'rgba(10, 10, 15, 0.9)';
      ctx.fillRect(10, H - 50, 120, 28);
      ctx.strokeStyle = 'rgba(74, 124, 191, 0.3)';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(10, H - 50, 120, 28);
      ctx.fillStyle = 'rgba(74, 124, 191, 0.8)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(orb.label + ' orbit selected', 18, H - 32);
    }

    time += 0.02;
    animId = requestAnimationFrame(draw);
  }

  /* Mouse hit test */
  function getOrbitAt(mx, my) {
    const rect = canvas.getBoundingClientRect();
    const x = mx - rect.left;
    const y = my - rect.top;
    const cx = W / 2, cy = H / 2;
    const maxR = Math.min(W, H) * 0.4;

    for (let i = orbits.length - 1; i >= 0; i--) {
      const r = maxR * orbits[i].radius;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (Math.abs(dist - r) < 20) return i;
    }
    return -1;
  }

  canvas.addEventListener('mousemove', (e) => {
    hoveredOrbit = getOrbitAt(e.clientX, e.clientY);
    canvas.style.cursor = hoveredOrbit >= 0 ? 'pointer' : 'default';
  });

  canvas.addEventListener('mouseleave', () => {
    hoveredOrbit = -1;
  });

  /* Transfer Calculator */
  const altInput = document.getElementById('orbitAlt');
  const incInput = document.getElementById('orbitInc');
  const dvDisplay = document.getElementById('orbitDv');
  const periodDisplay = document.getElementById('orbitPeriod');
  const velDisplay = document.getElementById('orbitVel');

  function updateCalc() {
    const alt = parseFloat(altInput?.value || 420) * 1000;
    const inc = parseFloat(incInput?.value || 51.6);
    const mu = 3.986e14;
    const rEarth = 6371e3;
    const r = rEarth + alt;
    const v = Math.sqrt(mu / r);
    const T = 2 * Math.PI * Math.sqrt(r * r * r / mu);
    const dv = Math.sqrt(2 * mu * (1 / r - 1 / (2 * r))) - v;

    if (dvDisplay) dvDisplay.textContent = Math.abs(dv / 1000).toFixed(2) + ' km/s';
    if (periodDisplay) periodDisplay.textContent = (T / 60).toFixed(1) + ' min';
    if (velDisplay) velDisplay.textContent = (v / 1000).toFixed(2) + ' km/s';
  }

  if (altInput) altInput.addEventListener('input', updateCalc);
  if (incInput) incInput.addEventListener('input', updateCalc);
  updateCalc();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  });

  resize();
})();
