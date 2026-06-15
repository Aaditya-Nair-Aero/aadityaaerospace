/* ── Project Page Animated Backgrounds ── */
(function() {
try {

function setupCanvas(id, drawer) {
  try {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let W = 0, H = 0, running = true;

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      if (W > 0 && H > 0) {
        canvas.width = W;
        canvas.height = H;
        return true;
      }
      return false;
    }

    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas.parentElement);
    window.addEventListener('resize', resize);

    function loop() {
      if (!running) return;
      try {
        if (W === 0 || H === 0) resize();
        ctx.clearRect(0, 0, W, H);
        if (W > 0 && H > 0) drawer(ctx, W, H);
      } catch(e) { /* silent */ }
      requestAnimationFrame(loop);
    }

    resize();
    loop();
  } catch(e) { /* silent */ }
}

/* ── FeatherRTOS: Memory map / address space ── */
setupCanvas('bgRtos', (ctx, W, H) => {
  const t = Date.now() * 0.001;

  ctx.font = '9px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';

  const barX = 60;
  const barW = 14;
  const segments = [
    { y: 0, h: H * 0.06, label: '0x00000000', name: 'IVT / BDA / EBDA' },
    { y: H * 0.06, h: H * 0.44, label: '0x00100000', name: 'Kernel .text .data .bss' },
    { y: H * 0.5, h: H * 0.02, label: 'bitmap_end', name: 'Frame Allocator Bitmap' },
    { y: H * 0.52, h: H * 0.28, label: '0x01000000', name: 'Free Frames' },
    { y: H * 0.8, h: H * 0.10, label: '0x10000000', name: 'MMIO (PCI, APIC)' },
    { y: H * 0.9, h: H * 0.10, label: '0xE0000000', name: 'PCI ECAM' },
  ];

  segments.forEach(seg => {
    const gray = 0.10 + 0.06 * Math.sin(seg.y * 0.05 + t * 0.3);
    ctx.fillStyle = `rgba(74, 124, 191, ${gray})`;
    ctx.fillRect(barX, seg.y, barW, seg.h);

    ctx.strokeStyle = 'rgba(74, 124, 191, 0.2)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(barX, seg.y, barW, seg.h);

    ctx.fillStyle = 'rgba(74, 124, 191, 0.35)';
    ctx.fillText(seg.label, barX - 4, seg.y + 10);

    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(74, 124, 191, 0.25)';
    ctx.fillText(seg.name, barX + barW + 6, seg.y + 10);
    ctx.textAlign = 'right';
  });

  const pulseY = H * 0.85 - (t * 50 % (H * 0.85));
  ctx.fillStyle = 'rgba(74, 124, 191, 0.4)';
  ctx.fillRect(barX, pulseY, barW, 3);

  ctx.textAlign = 'left';
  const regs = ['CR3', 'GDTR', 'IDTR', 'MSR 0x1B', 'APIC_BASE', 'PML4'];
  regs.forEach((r, i) => {
    const x = W * 0.7 + 15 * Math.sin(i * 2 + t * 0.2);
    const y = 50 + i * (H - 100) / regs.length;
    ctx.fillStyle = `rgba(74, 124, 191, 0.12)`;
    ctx.fillText(r, x, y);
  });
});



/* ── FeatherOrbital: Orbital mechanics diagram ── */
setupCanvas('bgOrbital', (ctx, W, H) => {
  const t = Date.now() * 0.001;
  const cx = W * 0.45, cy = H * 0.5;
  const maxR = Math.min(W, H) * 0.35;

  /* Earth */
  ctx.strokeStyle = 'rgba(74, 124, 191, 0.2)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.arc(cx, cy, maxR * 0.08, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(74, 124, 191, 0.08)';
  ctx.fill();

  /* Cross hairs */
  ctx.strokeStyle = 'rgba(74, 124, 191, 0.08)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(cx - maxR * 0.11, cy);
  ctx.lineTo(cx + maxR * 0.11, cy);
  ctx.moveTo(cx, cy - maxR * 0.11);
  ctx.lineTo(cx, cy + maxR * 0.11);
  ctx.stroke();

  /* Orbital paths */
  const orbits = [
    { r: maxR * 0.25, rate: 0.4, phase: 0, label: 'LEO' },
    { r: maxR * 0.45, rate: -0.3, phase: 0.5, label: 'GTO' },
    { r: maxR * 0.65, rate: 0.2, phase: 1.0, label: 'TLI' },
  ];

  orbits.forEach(orb => {
    const rot = t * orb.rate + orb.phase;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);

    ctx.strokeStyle = 'rgba(74, 124, 191, 0.18)';
    ctx.lineWidth = 0.6;
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.ellipse(0, 0, orb.r, orb.r * 0.55, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    /* Satellite dots */
    const sa = t * (0.5 + orb.rate * 0.3);
    ctx.fillStyle = 'rgba(74, 124, 191, 0.4)';
    ctx.beginPath();
    ctx.arc(Math.cos(sa) * orb.r, Math.sin(sa) * orb.r * 0.55, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    const lx = cx + Math.cos(orb.phase) * orb.r * 1.1;
    const ly = cy + Math.sin(orb.phase) * orb.r * 0.55 * 1.1;
    ctx.fillStyle = 'rgba(74, 124, 191, 0.25)';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(orb.label, lx + 4, ly + 3);
  });

  /* Transfer arc */
  ctx.strokeStyle = 'rgba(74, 124, 191, 0.1)';
  ctx.setLineDash([2, 4]);
  ctx.lineWidth = 0.5;
  const aStart = t * 0.15;
  const aEnd = aStart + 0.8;
  ctx.beginPath();
  ctx.arc(cx, cy, maxR * 0.33, aStart, aEnd);
  ctx.stroke();
  ctx.setLineDash([]);

  const ax = cx + maxR * 0.33 * Math.cos(aEnd);
  const ay = cy + maxR * 0.33 * Math.sin(aEnd);
  ctx.fillStyle = 'rgba(74, 124, 191, 0.2)';
  ctx.beginPath();
  ctx.arc(ax, ay, 2.5, 0, Math.PI * 2);
  ctx.fill();
});

/* ── FeatherArch: Power optimization diagram ── */
setupCanvas('bgArch', (ctx, W, H) => {
  const t = Date.now() * 0.001;

  ctx.font = '8px "JetBrains Mono", monospace';

  /* ── Before/After battery life comparison ── */
  const barStart = 60;
  const barW = (W - 100) / 2;

  /* Before bar */
  ctx.fillStyle = 'rgba(74, 124, 191, 0.06)';
  ctx.fillRect(barStart, 30, barW, 30);
  ctx.strokeStyle = 'rgba(74, 124, 191, 0.15)';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(barStart, 30, barW, 30);
  ctx.fillStyle = 'rgba(74, 124, 191, 0.2)';
  ctx.textAlign = 'center';
  ctx.fillText('Before: ~1.5h', barStart + barW / 2, 48);

  /* After bar */
  const afterW = barW * 3.2;
  ctx.fillStyle = 'rgba(74, 124, 191, 0.12)';
  ctx.fillRect(barStart, 70, afterW, 30);
  ctx.strokeStyle = 'rgba(74, 124, 191, 0.25)';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(barStart, 70, afterW, 30);
  ctx.fillStyle = 'rgba(74, 124, 191, 0.35)';
  ctx.fillText('After: ~4h 50m', barStart + afterW / 2, 88);

  /* Arrow between bars */
  ctx.strokeStyle = 'rgba(74, 124, 191, 0.15)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(barStart + barW + 10, 45);
  ctx.lineTo(barStart + barW + 30, 45);
  ctx.lineTo(barStart + barW + 26, 41);
  ctx.moveTo(barStart + barW + 30, 45);
  ctx.lineTo(barStart + barW + 26, 49);
  ctx.stroke();

  /* ── Power draw curve ── */
  const graphLeft = 60;
  const graphTop = 120;
  const graphW = W - 100;
  const graphH = H - graphTop - 40;

  ctx.strokeStyle = 'rgba(74, 124, 191, 0.1)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(graphLeft, graphTop);
  ctx.lineTo(graphLeft, graphTop + graphH);
  ctx.lineTo(graphLeft + graphW, graphTop + graphH);
  ctx.stroke();

  /* Power usage over time */
  ctx.strokeStyle = 'rgba(74, 124, 191, 0.2)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  for (let x = 0; x < graphW; x += 2) {
    const tOffset = t * 0.2;
    const power = 7 + 3 * Math.sin(x * 0.05 + tOffset * 0.5)
                   + 2 * Math.sin(x * 0.02 + tOffset)
                   + (x / graphW) * 2;
    const y = graphTop + graphH - (power / 15) * graphH;
    x === 0 ? ctx.moveTo(graphLeft + x, y) : ctx.lineTo(graphLeft + x, y);
  }
  ctx.stroke();

  /* Idle zone highlight */
  ctx.fillStyle = 'rgba(74, 124, 191, 0.04)';
  const idleTop = graphTop + graphH - (9 / 15) * graphH;
  const idleBot = graphTop + graphH - (7 / 15) * graphH;
  ctx.fillRect(graphLeft, idleTop, graphW, idleBot - idleTop);
  ctx.strokeStyle = 'rgba(74, 124, 191, 0.08)';
  ctx.lineWidth = 0.5;
  ctx.setLineDash([2, 4]);
  ctx.beginPath();
  ctx.moveTo(graphLeft, idleTop);
  ctx.lineTo(graphLeft + graphW, idleTop);
  ctx.moveTo(graphLeft, idleBot);
  ctx.lineTo(graphLeft + graphW, idleBot);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = 'rgba(74, 124, 191, 0.2)';
  ctx.font = '7px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('7-9W Idle', graphLeft + 6, idleTop - 4);

  /* Axis label */
  ctx.fillStyle = 'rgba(74, 124, 191, 0.12)';
  ctx.font = '8px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Power Draw (W) over time', graphLeft + graphW / 2, graphTop - 6);
});

} catch(e) {
  console.warn('project-bg:', e.message);
}
})();
