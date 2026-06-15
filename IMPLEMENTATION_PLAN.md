# Aaditya Aerospace — Implementation Plan

## Actual Projects (from repo data)

| Project | Language | Lines | Core Technology |
|---|---|---|---|
| **FeatherRTOS** | Rust | ~20,450 | x86_64 hobby OS, UEFI, APIC, SMP, ARINC 653, CubeSat sim, FDIR |
| **FeatherCFD** | Python/GLSL | — | GPU-native CFD, Vulkan + OpenGL, N-S solver, WENO-5, multigrid |
| **FeatherArch** | Linux config | — | Power-optimized Arch Linux distro, scheduler tuning, 7-9W idle |

---

## 1. Tech Stack

| Concern | Choice |
|---|---|
| Framework | **None (vanilla HTML/CSS/JS)** |
| Build | **None — static files served directly** |
| 3D/Canvas | **Canvas 2D API only** (Three.js only if orbital page needs it) |
| Fonts | **Inter** (body) + **JetBrains Mono** (technical) — preloaded |
| Hosting | **jo3.org** — static host |

---

## 2. File Structure

```
/
├── index.html                        # Landing page + SPA hub
├── css/
│   ├── base.css                      # Reset, design tokens, typography
│   ├── layout.css                    # Nav, sections, grid, responsive
│   └── components.css                # Cards, terminal, timeline, badges, diagrams
├── js/
│   ├── main.js                       # Router, parallax, nav, mobile menu
│   ├── orbital-canvas.js             # Hero background: trajectories, streamlines, annotations
│   ├── kernel-explorer.js            # FeatherRTOS interactive arch diagram
│   ├── cfd-visualizer.js             # FeatherCFD canvas: velocity, pressure, mesh
│   ├── mission-control.js            # FeatherOrbital: 3D orbital schematic
│   ├── terminal.js                   # Mini-shell (projects/about/blog/help/clear)
│   └── timeline.js                   # Animated SVG project timeline
├── assets/
│   └── diagrams/                     # SVG wireframes (kernel boot flow, orbit schematics)
└── sw.js                             # Service worker (offline cache)
```

**Single-page app with hash routing.** Each project is a `<section>` shown/hidden via `#hash`. Deep-linkable: `#featherrtos`, `#cfd`, `#orbital`, `#featherarch`.

---

## 3. Visual System

### 3.1 Design Tokens

```css
--bg:         #0a0a0f;
--bg-raised:  #12121a;
--bg-hover:   #1a1a28;
--text:       #e8e8f0;
--text-dim:   #9090a8;
--accent:     #4a7cbf;        /* muted engineering blue */
--accent-dim: #2a4c7a;
--line:       #2a2a40;        /* grid lines, borders */
--font-sans:  'Inter', system-ui, sans-serif;
--font-mono:  'JetBrains Mono', 'Fira Code', monospace;
--radius:     2px;            /* sharp corners — no pill shapes */
```

### 3.2 Typography

```
Display hero  → clamp(2.5rem, 8vw, 5rem)  — font-mono weight 300
H1            → 2rem / 1.75rem             — font-mono weight 400
H2            → 1.5rem / 1.25rem           — font-sans weight 500
Body          → 1rem / 0.9375rem           — font-sans weight 350
Code/tech     → 0.875rem                   — font-mono
Badge/label   → 0.75rem  uppercase letter-spacing 0.1em — font-mono
```

---

## 4. Page Sections

### 4.1 Shell — Navigation

```
┌──────────────────────────────────────────────────┐
│  AA                                      Home     │
│                                              Projects
│                                              Research
│                                              Blog
│                                              About   │
└──────────────────────────────────────────────────┘
```

- Fixed top bar, backdrop blur
- `AA` logo (expands on hover/desktop)
- Active section: thin blue bottom border
- Mobile: hamburger → slide overlay

### 4.2 Hero (#hero)

```
┌──────────────────────────────────────────────────┐
│                                                    │
│              AADITYA AEROSPACE                     │
│                                                    │
│   ├─ Aerospace Engineering                         │
│   ├─ Operating Systems                             │
│   └─ Computational Fluid Dynamics                  │
│                                                    │
│        ΔV   Isp   Mach   Re   APIC   ACPI          │
│                                                    │
└──────────────────────────────────────────────────┘
```

Background: orbital trajectories, CFD streamlines, wireframe rocket — canvas-drawn, faint blue, parallax 1-3px on mouse move.

### 4.3 Projects (#projects) — 4 Cards

#### FeatherRTOS
```
┌──────────────────────────────────────────────────┐
│  FeatherRTOS                                      │
│  x86_64 Real-Time Operating System                │
│  ───────────────────────────────────────────────  │
│  Rust   UEFI   APIC   SMP   PCIe   ACPI           │
│  AHCI   NVMe   VirtIO   ARINC 653   FDIR          │
│                                                    │
│  [hover: kernel boot flow diagram]                  │
└──────────────────────────────────────────────────┘
```

#### FeatherCFD
```
┌──────────────────────────────────────────────────┐
│  FeatherCFD                                       │
│  GPU-Native CFD Framework                         │
│  ───────────────────────────────────────────────  │
│  Vulkan   OpenGL   N-S Solver   WENO-5            │
│  Multigrid   NACA  192³ Grid   RTX 3050           │
│                                                    │
│  [hover: velocity field preview]                    │
└──────────────────────────────────────────────────┘
```

#### FeatherOrbital
```
┌──────────────────────────────────────────────────┐
│  FeatherOrbital                                   │
│  Orbital Mechanics Toolkit                        │
│  ───────────────────────────────────────────────  │
│  Kepler   Hohmann   LVLH/ECI   ΔV                │
│  CubeSat   LEO/GTO/TLI   Propagation              │
│                                                    │
│  [hover: orbit schematic]                          │
└──────────────────────────────────────────────────┘
```

#### FeatherArch
```
┌──────────────────────────────────────────────────┐
│  FeatherArch                                      │
│  Power-Optimized Linux Distribution               │
│  ───────────────────────────────────────────────  │
│  7-9W Idle   400MHz Min   40Hz Display            │
│  Scheduler Tuning   Battery Life                  │
│                                                    │
│  [hover: power curve diagram]                      │
└──────────────────────────────────────────────────┘
```

### 4.4 FeatherRTOS Page (#featherrtos)

```
┌──────────────────────────────────────────────────┐
│  ← Back to Projects                               │
│                                                    │
│  FEATHERTOS                                        │
│  x86_64 Real-Time Operating System                 │
│  ───────────────────────────────────────────────  │
│  Rust   ~20,450 lines    Monolithic Kernel         │
│                                                    │
│  Boot Flow (interactive)                           │
│  ┌──────────────────────────────────────────────┐  │
│  │  UEFI (OVMF)                                  │  │
│  │    ↓                                          │  │
│  │  NASM stub → long mode                        │  │
│  │    ↓                                          │  │
│  │  rust_main():                                 │  │
│  │   1. GDT + TSS                                │  │
│  │   2. IDT (48 handlers)                        │  │
│  │   3. Serial init                              │  │
│  │   4. ACPI (RSDP, MCFG, HPET, MADT)           │  │
│  │   5. PCI enumeration                          │  │
│  │   6. HPET + APIC timer calibration           │  │
│  │   7. Frame allocator + paging                │  │
│  │   8. AHCI + VirtIO-GPU init                  │  │
│  │   9. Scheduler + timer init                  │  │
│  │  10. Task creation → WM → sti; hlt           │  │
│  └──────────────────────────────────────────────┘  │
│  [each node clickable → detail panel]              │
│                                                    │
│  Architecture                                      │
│  ┌─────────┐  ┌──────────┐  ┌───────────────┐     │
│  │ ARCH    │  │ MEMORY   │  │ SCHEDULER      │     │
│  │ GDT/IDT │  │ Frame    │  │ FPPS + EDF     │     │
│  │ APIC    │  │ Buddy    │  │ ARINC 653      │     │
│  │ PCIe    │  │ Paging   │  │ FDIR           │     │
│  │ ACPI    │  │ Pool     │  │ IPC            │     │
│  │ HPET    │  │          │  │ Flight Recorder│     │
│  └─────────┘  └──────────┘  └───────────────┘     │
│                                                    │
│  ARINC 653 Partitions                              │
│  ┌──────┬──────┬──────┬──────┬──────┬──────┐      │
│  │SYS   │ NAV  │ GUID │ TELM │ HMON │ PAYL │      │
│  │35ms  │ 30ms │ 30ms │ 25ms │ 15ms │ 25ms │      │
│  │1024pg│256pg │256pg │256pg │ 64pg │256pg │      │
│  └──────┴──────┴──────┴──────┴──────┴──────┘      │
│                                                    │
│  Driver Status                                      │
│  ✓ APIC   ✓ PCIe   ✓ AHCI   ✓ NVMe   ✓ VirtIO     │
│  ✓ E1000e ✓ xHCI   ✓ I2C    ✓ PS/2   ✓ iGPU       │
│                                                    │
│  Project Timeline                                   │
│  [animated SVG]                                     │
└──────────────────────────────────────────────────┘
```

### 4.5 FeatherCFD Page (#cfd)

```
┌──────────────────────────────────────────────────┐
│  ← Back to Projects                               │
│                                                    │
│  FEATHERCFD                                        │
│  GPU-Native CFD Framework                          │
│  ───────────────────────────────────────────────  │
│  Python + ModernGL + Vulkan   |   192³ Grid       │
│                                                    │
│  [Canvas: Velocity Field — animated particles]     │
│  [Canvas: Pressure Contours — color map]           │
│  [Canvas: Mesh Visualization — wireframe grid]     │
│                                                    │
│  Solver Pipeline                                   │
│  ┌────────┐  ┌──────────┐  ┌───────────────┐     │
│  │FORCES  │→ │ADVECTION │→ │ DIVERGENCE     │      │
│  │BCs     │  │WENO-5    │  │                │      │
│  └────────┘  └──────────┘  └───────┬───────┘      │
│                                     ↓              │
│  ┌────────┐  ┌──────────┐  ┌───────────────┐     │
│  │PROJECT │← │ PRESSURE │← │ JACOBI / MG   │      │
│  │        │  │ SOLVE    │  │ FFT / DST     │      │
│  └────────┘  └──────────┘  └───────────────┘     │
│                                     ↓              │
│                              ┌───────────────┐     │
│                              │ DENSITY       │     │
│                              │ ADVECTION     │     │
│                              └───────────────┘     │
│                                                    │
│  Validation (all passing)                           │
│  ✓ Sod shock tube    ✓ Oblique wedge               │
│  ✓ NACA 0012 sweep   ✓ Cylinder flow               │
│  ✓ Compressible Euler ✓ Vulkan pipeline            │
│                                                    │
│  Technical Specs                                    │
│  ┌──────────────────────────────────────────┐      │
│  │ Method      Finite-Volume                │      │
│  │ Grid        192×192×192 (~7M cells)      │      │
│  │ Solver      Gauss-Seidel / Multigrid     │      │
│  │ Backend     OpenGL + Vulkan Compute      │      │
│  │ HW Target   RTX 3050 Laptop (4 GB)      │      │
│  └──────────────────────────────────────────┘      │
└──────────────────────────────────────────────────┘
```

### 4.6 FeatherOrbital Page (#orbital)

```
┌──────────────────────────────────────────────────┐
│  ← Back to Projects                               │
│                                                    │
│  FEATHERORBITAL                                    │
│  Orbital Mechanics Toolkit                         │
│  ───────────────────────────────────────────────  │
│                                                    │
│  [Canvas: Earth (wireframe) + Orbits]              │
│  LEO ◇── 420 km, 51.6° inclination                │
│  GTO ◇──                                           │
│  TLI ◇──                                           │
│                                                    │
│  Hover orbit → highlight trajectory               │
│                                                    │
│  CubeSat Simulator (FeatherRTOS integration)       │
│  ┌──────────────────────────────────────────┐      │
│  │  Task     │ Partition │ Function         │      │
│  │  GPS_SIM  │ NAV       │ Orbital position │      │
│  │  IMU_SIM  │ TELM      │ Accel data       │      │
│  │  ATT_CTRL │ GUID      │ Reaction wheels  │      │
│  │  POWER    │ PAYL      │ Solar/battery    │      │
│  └──────────────────────────────────────────┘      │
│                                                    │
│  Transfer Calculator                               │
│  ┌──────────────────────────────────────────┐      │
│  │  Altitude: [____] km                     │      │
│  │  Inclination: [____] °                   │      │
│  │  ΔV: 3.14 km/s                            │      │
│  └──────────────────────────────────────────┘      │
└──────────────────────────────────────────────────┘
```

### 4.7 FeatherArch Page (#featherarch)

```
┌──────────────────────────────────────────────────┐
│  ← Back to Projects                               │
│                                                    │
│  FEATHERARCH                                       │
│  Power-Optimized Linux Distribution                │
│  ───────────────────────────────────────────────  │
│                                                    │
│  Current Results                                   │
│  ┌──────────────────────────────────────────┐      │
│  │  Idle power draw:     7-9 W              │      │
│  │  Light browsing:      10-12 W            │      │
│  │  Battery life (idle): ~4h 50m            │      │
│  │  Battery life (work): ~3h 30m            │      │
│  │  Battery capacity:    51 → 34 Wh (deg)  │      │
│  └──────────────────────────────────────────┘      │
│                                                    │
│  Tuning Applied                                    │
│  ├─ CPU freq capped to 800 MHz (battery)          │
│  ├─ Min CPU freq reduced to 400 MHz               │
│  ├─ Turbo boost disabled on battery                │
│  ├─ Display refresh rate reduced to 40 Hz          │
│  ├─ Runtime power management enabled               │
│  ├─ NVIDIA power usage reduced aggressively        │
│  └─ Background activity minimized                  │
│                                                    │
│  Hardware                                          │
│  MSI GF63 Gaming Laptop  ·  Intel H-series        │
│  NVIDIA dGPU  ·  51 Wh → 34 Wh battery            │
└──────────────────────────────────────────────────┘
```

### 4.8 Blog (#blog)

```
LOG ENTRY 003
Implementing x86 SMP Support
2025-12-15
───────────────────────────────────────────────────

LOG ENTRY 002
PCIe Enumeration on Bare Metal
2025-11-20
───────────────────────────────────────────────────

LOG ENTRY 001
Setting Up the x86_64 Cross-Compiler
2025-10-01
```

- `<details>` expandable cards, monospace, thin rules

### 4.9 About (#about)

```
MISSION PROFILE
───────────────────────────────────────────────────

Current Status
  B.Tech Aerospace Engineering

Focus Areas
  ├─ Flight Software (FeatherRTOS, ARINC 653, FDIR)
  ├─ CFD (GPU Compute, WENO-5, Multigrid)
  ├─ Orbital Mechanics (CubeSat, Hohmann, LEO/GTO)
  ├─ Systems Programming (Rust, OS Dev, Linux Tuning)
  └─ Power Optimization (CPU freq, scheduler, battery)

Repositories
  ├─ github.com/Aaditya-Nair-Aero/FeatherRTOS
  ├─ github.com/Aaditya-Nair-Aero/FeatherCFD
  └─ github.com/Aaditya-Nair-Aero/FeatherArch

Contact
  ├─ Email:  [encoded]
  ├─ GitHub: /Aaditya-Nair-Aero
  └─ GPG:    [key fingerprint]
```

### 4.10 Terminal

Floating bottom-right toggle → panel:

```
╭─ aaditya@aerospace ~
│
│ > projects
│  FeatherRTOS   — x86_64 RTOS (Rust, 20K lines)
│  FeatherCFD    — GPU CFD (Vulkan, OpenGL)
│  FeatherOrbital — Orbital mechanics
│  FeatherArch   — Linux power optimization
│
│ > about
│  Mission Profile...
│
│ > blog
│  003 — Implementing x86 SMP Support
│  002 — PCIe Enumeration on Bare Metal
│  001 — Cross-Compiler Setup
│
│ > help
│  projects  about  blog  clear
```

---

## 5. JavaScript Modules

| Module | Lines | Function |
|---|---|---|
| `main.js` | ~150 | Hash router, nav, parallax (1-3px), IntersectionObserver, mobile menu |
| `orbital-canvas.js` | ~200 | Canvas 2D: orbit ellipses, Bezier streamlines, rocket wireframe, floating labels (ΔV, Isp, Mach, Re, APIC, ACPI) |
| `kernel-explorer.js` | ~150 | Clickable boot flow nodes, animated signal lines, detail panel |
| `cfd-visualizer.js` | ~300 | Tabbed canvases: particle velocity field, contour map, mesh grid |
| `mission-control.js` | ~200 | Canvas 2D: wireframe Earth, orbit rings, hover highlight, transfer calc |
| `terminal.js` | ~100 | Command parser, output renderer, history (up arrow) |
| `timeline.js` | ~80 | SVG animated timeline, IntersectionObserver |

---

## 6. Performance Budget

| Metric | Target |
|---|---|
| First Contentful Paint | < 800ms |
| LCP | < 1.5s |
| Page weight | < 300KB |
| Lighthouse | > 90 mobile |

**Strategies:**
- Inline critical CSS (hero + nav)
- Defer all JS with `type="module"`
- Preload fonts
- No images — everything is Canvas or SVG
- `content-visibility: auto` on below-fold sections
- `prefers-reduced-motion: reduce` disables animation

---

## 7. Mobile UX

- Single column below 768px
- Nav → hamburger slide-over
- Terminal → bottom sheet
- Tap targets ≥ 44px
- No horizontal scroll
- Canvas redraws on orientation change

---

## 8. Implementation Order

| Phase | What | Why |
|---|---|---|
| **1** | `index.html` shell, CSS tokens, nav, hero | Foundation |
| **2** | `orbital-canvas.js` + parallax | Hero is first impression |
| **3** | Project cards grid (4 cards) | Core content |
| **4** | Hash router in `main.js` | Enables SPA |
| **5** | FeatherRTOS + kernel-explorer | Flagship project |
| **6** | FeatherCFD + cfd-visualizer | Second project |
| **7** | FeatherOrbital + mission-control | Third project |
| **8** | FeatherArch | Fourth project |
| **9** | Blog section | Content |
| **10** | About section | Profile |
| **11** | Terminal | Interaction |
| **12** | Timeline | Enhancement |
| **13** | Performance audit + SW | Ship readiness |
