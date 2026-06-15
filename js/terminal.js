/* ── Terminal ── */
(function() {
  const toggle = document.getElementById('terminalToggle');
  const panel = document.getElementById('terminalPanel');
  const body = document.getElementById('terminalBody');
  const input = document.getElementById('terminalInput');

  if (!toggle || !panel || !body || !input) return;

  let history = [];
  let historyIdx = 0;

  toggle.addEventListener('click', () => {
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) {
      input.focus();
    }
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const cmd = input.value.trim().toLowerCase();
      input.value = '';
      processCommand(cmd);
      history.push(cmd);
      historyIdx = history.length;
    } else if (e.key === 'ArrowUp') {
      if (historyIdx > 0) {
        historyIdx--;
        input.value = history[historyIdx];
      }
    } else if (e.key === 'ArrowDown') {
      if (historyIdx < history.length - 1) {
        historyIdx++;
        input.value = history[historyIdx];
      } else {
        historyIdx = history.length;
        input.value = '';
      }
    }
  });

  function printLine(text, cls = '') {
    const div = document.createElement('div');
    if (cls) div.className = cls;
    div.innerHTML = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  function processCommand(cmd) {
    printLine(`<span class="prompt">></span> ${cmd}`);

    switch (cmd) {
      case 'help':
        printLine('Available commands:', 'output');
        printLine('  projects   — list all projects', 'output');
        printLine('  about      — mission profile', 'output');
        printLine('  blog       — recent log entries', 'output');
        printLine('  clear      — clear terminal', 'output');
        printLine('  help       — show this message', 'output');
        break;

      case 'projects':
        printLine('FeatherRTOS    — x86_64 RTOS (Rust, 20K lines)', 'output');
        printLine('FeatherCFD     — GPU CFD (Vulkan, OpenGL, 192³)', 'output');
        printLine('FeatherOrbital — Orbital mechanics toolkit', 'output');
        printLine('FeatherArch    — Linux power optimization (7-9W)', 'output');
        break;

      case 'about':
        printLine('MISSION PROFILE', 'output');
        printLine('  Status: B.Tech Aerospace Engineering Student', 'output');
        printLine('  Focus: Flight Software, CFD, Orbital Mechanics, Systems Programming', 'output');
        break;

      case 'blog':
        printLine('003 — Implementing x86 SMP Support (2026-12-15)', 'output');
        printLine('002 — PCIe Enumeration on Bare Metal (2026-11-20)', 'output');
        printLine('001 — Setting Up the x86_64 Cross-Compiler (2026-10-01)', 'output');
        break;

      case 'clear':
        body.innerHTML = '';
        break;

      default:
        if (cmd) {
          printLine(`command not found: ${cmd}. Type "help" for available commands.`, 'output');
        }
    }
  }
})();
