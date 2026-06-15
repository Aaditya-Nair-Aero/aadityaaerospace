/* ── FeatherRTOS Kernel Architecture Explorer ── */
(function() {
  const diagram = document.getElementById('kernelDiagram');
  const detail = document.getElementById('kernelDetail');
  const detailTitle = document.getElementById('kernelDetailTitle');
  const detailBody = document.getElementById('kernelDetailBody');

  if (!diagram) return;

  const moduleData = {
    uefi: {
      title: 'UEFI (OVMF)',
      body: 'OVMF firmware loads the PE32+ executable from EFI/BOOT/BOOTX64.EFI on the FAT32 partition. The UEFI stub sets up basic long-mode GDT and page tables before handing control to the NASM assembly stub.'
    },
    stub: {
      title: 'NASM Stub',
      body: 'A hand-written assembly stub parses the kernel binary embedded as a COFF .data section. It maps sections at their load addresses (0x100000+), sets up long-mode page tables (identity map 0-16 MB), loads the 64-bit GDT, and calls rust_main().'
    },
    rustmain: {
      title: 'rust_main() — 16-Step Init',
      body: 'The Rust entry point executes the full boot sequence: (1) GDT+TSS, (2) IDT with 48 handlers, (3) serial init, (4) ACPI (RSDP, MCFG, HPET, MADT), (5) PCI enumeration via ECAM, (6) HPET + APIC calibration, (7) frame allocator bitmap + 4-level paging, (8) AHCI SATA probe, (9) VirtIO-GPU display at 1920x1080, (10) scheduler + timer init, (11) task creation (WM + fault), (12) enable interrupts, halt loop.'
    }
  };

  document.querySelectorAll('.kernel-node').forEach(node => {
    node.addEventListener('click', () => {
      document.querySelectorAll('.kernel-node').forEach(n => n.classList.remove('active'));
      node.classList.add('active');

      const mod = node.getAttribute('data-module');
      const data = moduleData[mod];
      if (data) {
        detail.classList.add('visible');
        detailTitle.textContent = data.title;
        detailBody.textContent = data.body;
      }
    });
  });
})();
