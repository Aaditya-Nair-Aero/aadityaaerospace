/* ── Animated Project Timeline ── */
(function() {
  const container = document.getElementById('projectTimeline');
  if (!container) return;

  const events = [
    { year: '2026 Q3', title: 'FeatherRTOS Start', desc: 'UEFI boot, serial, GDT/IDT init', status: 'completed' },
    { year: '2026 Q3', title: 'Memory Management', desc: 'Frame allocator, paging, buddy heap', status: 'completed' },
    { year: '2026 Q4', title: 'PCIe + ACPI', desc: 'ECAM enumeration, table parsing', status: 'completed' },
    { year: '2026 Q4', title: 'APIC + SMP', desc: 'Local APIC timer, IPI, multi-core', status: 'completed' },
    { year: '2026 Q1', title: 'GUI + Window Manager', desc: 'VirtIO-GPU, WM, terminal emulator', status: 'completed' },
    { year: '2026 Q1', title: 'ARINC 653 + FDIR', desc: 'Spatial/temporal partitioning, health monitor', status: 'completed' },
    { year: '2026 Q1', title: 'CubeSat Simulator', desc: 'GPS, IMU, attitude control, power sim', status: 'completed' },
    { year: '2026 Q2', title: 'Vulkan CFD Backend', desc: 'FeatherCFD Vulkan compute pipeline', status: 'completed' },
    { year: '2026 Q3', title: 'FeatherOrbital', desc: 'Orbital mechanics toolkit (planned)', status: '' }
  ];

  events.forEach((ev, i) => {
    const node = document.createElement('div');
    node.className = 'timeline__node' + (ev.status === 'completed' ? ' completed' : '');
    node.innerHTML = `
      <div class="timeline__year">${ev.year}</div>
      <div class="timeline__title">${ev.title}</div>
      <div class="timeline__desc">${ev.desc}</div>
    `;
    container.appendChild(node);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          node.classList.add('visible');
          observer.unobserve(node);
        }
      });
    }, { threshold: 0.2 });
    observer.observe(node);
  });
})();
