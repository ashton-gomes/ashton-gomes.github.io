---
layout: project
title: Custom Shock Dynamometer
category_label: Senior design · Mechanical & mechatronics
description: "A crank-driven shock dynamometer built for Stony Brook Motorsports: a braced steel frame and load-isolating Whiffle Tree, Teensy 4.1 firmware driving a VFD over Modbus, a 24-bit force channel with a 163,840-count-per-revolution encoder, and a Python pipeline that turns raw cycles into damping coefficients."
role: "Mechanical design, firmware & data analysis"
timeline: "Aug 2025 – May 2026"
team: "Senior design team, for Stony Brook Motorsports"
tags: [SolidWorks, FEA, Teensy 4.1, C++ Firmware, ADS1220 24-bit ADC, Quadrature Encoder, RS-485 Modbus RTU, Nextion HMI, Python, SciPy, TIG Welding, Machining]
hero_image: /assets/shockdyno_mainimage.jpg
hero_alt: Assembled shock dynamometer with an AFCO coilover, Whiffle Tree load cell mount, guarded crank, and control enclosure.
hero_caption: "The finished dynamometer with an AFCO 63 shock installed: braced steel frame, Whiffle Tree load-cell mount at the top, guarded crank drive at the base, and the touchscreen control enclosure alongside."
related:
  - title: "Baja SAE vehicle dynamics"
    url: /projects/baja-sae.html
---

## Overview

Stony Brook Motorsports runs off-the-shelf coilovers on its Baja car. They ship with generic off-road valving, and choosing a better tune by feel is slow and subjective. Commercial shock dynamometers are expensive and built for different shocks and speed ranges. Our senior design team built a purpose-made dyno that **measures damping force against shaft velocity**, so valving choices can be made from data.

The finished system spans the whole chain from steel to numbers:

<ul class="pipeline">
  <li>3 HP motor + VFD</li>
  <li>20:1 worm gearbox</li>
  <li>2 in crank, 4 in stroke</li>
  <li>Whiffle Tree + 1000 lbf load cell</li>
  <li>Teensy 4.1 DAQ</li>
  <li>Python F–V analysis</li>
</ul>

<div class="metric-grid">
  <div class="metric"><strong>4.0 in</strong><span>stroke from a 2.0 in crank radius</span></div>
  <div class="metric"><strong>3.1 / 5.8</strong><span>minimum FEA factor of safety, frame / Whiffle Tree, at 750 lbf</span></div>
  <div class="metric"><strong>163,840</strong><span>encoder counts per crank revolution</span></div>
  <div class="metric"><strong>24-bit</strong><span>force channel at 320 samples/s</span></div>
  <div class="metric"><strong>4</strong><span>damping slopes extracted per test (LSC, HSC, LSR, HSR)</span></div>
</div>

### Assembled dyno in operation

<video controls playsinline preload="none" poster="{{ '/assets/shockdyno_mainvideo_poster.jpg' | relative_url }}" aria-label="Full view of the assembled shock dynamometer operating with an AFCO shock">
  <source src="{{ '/assets/shockdyno_mainvideo_web.mp4' | relative_url }}" type="video/mp4">
  <a href="{{ '/assets/shockdyno_mainvideo_web.mp4' | relative_url }}">Watch the shock dynamometer operating.</a>
</video>

*Full-system operating view. The crank cycles the AFCO shock beneath the Whiffle Tree mount, with the control enclosure and touchscreen alongside the guarded mechanism.*

---

## Design requirements

1. **Actuation.** Provide a repeatable **4-inch stroke** and variable speed, with a design target of **15 in/s peak shaft velocity**, the low end of the speeds a Baja shock sees over rough terrain. Speed changes come from the VFD, with no mechanical reconfiguration.
2. **Structure.** Survive a worst-case **750 lbf at 5° off-axis** at the crank pin with a minimum **factor of safety of 3.0**. The design load was informed by on-car linear-potentiometer and accelerometer data used to estimate real shock forces.
3. **Measurement quality.** Route only axial shock force into the load cell, with no side load or frame flex, and correct for the shock's changing angle in software.
4. **Modularity.** Accept the team's FOX Float and AFCO shocks without modifying the frame or drivetrain.

---

## Mechanical design

### Design iteration: Scotch yoke to direct-link crank

The first concept was a **Scotch yoke**, which turns rotation into perfectly sinusoidal linear motion through a pin sliding in a slotted yoke. It was attractive on paper. In practice the yoke needed tight slot-to-pin tolerances held over the full stroke under cyclic load, added a lot of reciprocating mass, and would have been the hardest part in the machine to make in our shop.

![Early Scotch Yoke concept](/assets/shock_dyno_render.jpg)
*Early Scotch yoke concept. The precision sliding yoke at the base was the highest-risk part to manufacture and drove the redesign.*

The final design makes **the shock itself the connecting link**. Its lower eye rides on the crank pin and its upper eye pivots at the Whiffle Tree. This removed the yoke entirely, replaced it with one machined pin and bearing stack, and lets the shock's own eyelets, which are already designed for axial cyclic loading, carry the constraint. The trade-off is that the motion is no longer a pure sinusoid and the shock tilts slightly through the cycle. Rather than designing that away, I handled it in the kinematics and the data pipeline.

### Kinematics of a pivoting-link crank

Because there is no linear guide, the shock length is the distance between the crank pin and the fixed upper pivot. With crank radius $$R$$, pivot distance $$L$$ from the crank centre, and crank angle $$\theta$$:

$$d(\theta) = \sqrt{L^2 + R^2 + 2LR\cos\theta}$$

$$x(\theta) = (L + R) - d(\theta), \qquad v(\theta) = \frac{L R \sin\theta}{d(\theta)}\,\omega_{crank}, \qquad \omega_{crank} = \frac{\omega_{motor} }{20}$$

and the load cell reading is resolved into the shock axis with $$\cos\phi = (L + R\cos\theta)/d(\theta)$$.

To confirm this model against the real machine, the crank pin and shock body were tracked frame by frame through 159 frames of operating video. The fitted geometry gave $$L/R \approx 9.7$$–$$9.8$$, and this pivoting-link model matched the tracked motion much better than either a pure sinusoid or the standard slider-crank formula.

<video controls muted loop playsinline preload="metadata" aria-label="Close view of the crank driving the lower end of the shock">
  <source src="{{ '/assets/shockdyno_crankvideo.mp4' | relative_url }}#t=0.1" type="video/mp4">
</video>

*Crank close-up. The shock's small angular swing about its upper pivot is why the velocity and force calculations use the exact pivoting-link geometry instead of assuming straight-line motion.*

### Drivetrain and crank assembly

A **3 HP, 1750 rpm** three-phase motor drives a **20:1 worm gearbox** under VFD control. A machined **6 in diameter, 2 in thick steel crank wheel** serves as both the crank arm and a flywheel that smooths speed through the high-load parts of each stroke. A **1144 steel crank pin** is pressed into **dual roller bearings** in the wheel face. Supporting the pin at two points removes the cantilevered bending a single-bearing pin would see.

![Crank Assembly Exploded](/assets/shockdyno_crank_assembly_exploded.png)
*Exploded crank assembly: the 1144 steel pin seats in dual bearings pressed into the crank wheel face.*

### Whiffle Tree load path

The upper shock mount is a **Whiffle Tree** that isolates axial force and routes it cleanly through the sensor. A floating lower cross-brace carries the shock and is pinned on one side so it can move vertically. A **1000 lbf S-beam load cell** sits between it and a fixed upper brace on **Heim joints at both ends**, so the cell can only see tension or compression. FEA of the crossbar shows a peak stress of **47.4 MPa** against a 275 MPa yield (**FoS 5.8**) and only **0.006 in** of mid-span deflection. The structure is stiff enough that the shock's force goes through the sensor rather than into flexing the frame.

![Whiffle Tree CAD](/assets/shockdyno_whiffle_tree_assembly.png)
*Whiffle Tree CAD. The S-beam load cell is constrained between a fixed upper datum and a floating lower brace, with Heim joints enforcing pure axial loading.*

![Whiffle Tree Drawing](/assets/shockdyno_whiffle_tree_drawing.png)
*Crossbar detail drawing (Rev G), with slotted adjustment holes and toleranced pivot-pin bores.*

### Frame and structural validation

The frame is **1 × 1 × 0.083 in steel tube**. Moving from the Scotch yoke to a rotating crank introduced off-axis and reciprocating loads, so I added diagonal bracing to the towers to carry them and to keep vibration away from the sensors. A worst-case static study applied **750 lbf at 5° off-axis** at the crank pin plus the gearbox reaction torque. The result was a minimum **FoS of 3.1** at the gearbox mounting plate, with most of the structure above 10 and a maximum displacement of **0.016 in**.

![Frame CAD](/assets/shockdyno_frame.png)
*Frame CAD with the diagonal tower bracing added for crank loads.*

![Frame FEA FoS](/assets/shockdyno_fos_fea.png)
*Factor-of-safety plot. The minimum of 3.1 is at the gearbox mounting plate under 750 lbf at 5° off-axis with combined reaction torque.*

### Fabrication

1. Frame TIG welded from steel tube and painted for corrosion resistance.
2. Crank wheel turned to final diameter and width on a manual lathe.
3. Keyway cut with an arbor press for a slip-free fit on the gearbox output shaft.
4. Bearing housing CNC machined for bearing seating and shaft alignment.
5. Crank pin finished on the manual lathe.
6. Upper and lower cross-braces CNC milled as mounting interfaces for the drive and Whiffle Tree.

---

## Electronics and firmware

### Signal chain

| Subsystem | Hardware | Key details |
| --- | --- | --- |
| Controller | PJRC Teensy 4.1 | 600 MHz Cortex-M7; priority-ordered, non-blocking main loop |
| Force | Omega LCM103B-1K S-beam + TI ADS1220 | 1000 lbf, 2 mV/V; 24-bit ADC over SPI at gain 128 and 320 SPS continuous; automatic multi-sample tare before each test |
| Position | AMT133Q-V encoder + MAX3096 receiver | 2048 PPR over RS-422, hardware ×4 quadrature decode → 8,192 counts per motor rev and **163,840 per crank rev** (0.0022°) |
| Drive | VFD over RS-485 (MAX3485) | Modbus RTU at 19,200 baud: run/stop coils and frequency register |
| Operator interface | Nextion 10.1 in touchscreen | Preset tests, jog buttons, live force waveform |
| Safety | Hardware e-stop + software stop | Dedicated stop input on the Teensy, plus a stop button on the HMI |

![DAQ Quick Test Bench](/assets/shockdyno_quick_test_bench.png)
*Early bench test of the Teensy 4.1 and ADS1220 stack, confirming load-cell signal quality before mechanical integration.*

### Firmware features

- **Three one-button tests**, each 30 s: low speed (10 Hz VFD), high speed (30 Hz), and a sweep that ramps the drive in 500 ms steps. Jog forward/reverse at 2 Hz for homing.
- **Per-sample logging** of raw encoder counts, crank angle, revolutions, RPM, raw ADC, force, and cosine-corrected force, streamed as framed CSV to a laptop logger.
- A **live force waveform** and status display on the touchscreen.

### Making the touchscreen reliable

The HMI was the hardest part of the firmware to get right, and solving it taught me a lot about serial timing on a microcontroller doing several jobs at once:

| Symptom | Root cause | Fix |
| --- | --- | --- |
| Touchscreen buttons intermittently ignored | Acknowledgement bytes from the display filled the serial buffer, hiding the start-of-frame marker | Disabled acknowledgements at boot (`bkcmd=0`), enlarged the receive buffer to 256 bytes, and serviced the display inside Modbus wait loops |
| UI starved during VFD commands | Blocking `delay()` calls and long Modbus waits | Removed blocking waits, built each display update as one string, and sent at most one update group per loop pass |
| Stop press occasionally lost | A single trigger byte could drop | Display-side timer resends stop five times. The Teensy handler is idempotent, so repeats are harmless |
| Waveform blank | This display series needs numeric component IDs | Addressed the waveform by ID as a compile-time constant |
| RPM spike at the start of every test | Velocity history went stale during the 3 s tare | Reset the rolling RPM state when a test starts, rather than trimming data later |

---

## Data pipeline (Python)

`dyno_logger.py` captures the serial stream, detects the CSV block, saves a timestamped file, and produces a diagnostic dashboard: force versus time (raw and corrected), RPM and VFD frequency, force versus crank angle, the F–V diagram, raw ADC counts, and cumulative revolutions. Command-line flags expose crank radius, filter cutoffs, bin count, and steady-state trimming.

The first real dataset showed why a careful pipeline mattered. The damping signal was only a few pounds peak-to-peak, riding on a baseline that drifted by tens of pounds. A small fraction of samples were also stale ADC reads, and the early velocity estimate updated in coarse steps. The processing chain that resolved these:

1. **Interpolate stale ADC samples** instead of keeping repeated values.
2. **Remove drift per crank cycle** by subtracting each cycle's mean force.
3. **Zero-phase Butterworth low-pass** (`filtfilt`) on force and angle, so filtering adds no time lag between channels.
4. **Velocity from encoder position** through the analytical pivoting-link kinematics, not from a coarse RPM estimate.
5. **Bounded phase alignment** between force and velocity, limited to 50 ms (the most lag the drivetrain could physically introduce), so real hysteresis isn't "aligned away."
6. **Median binning and a bilinear fit** on each branch to extract low-speed and high-speed damping slopes and the knee velocity between them.

<div class="callout" markdown="1">
**Checking numbers against the hardware.** The first F–V plot showed peak velocities near ±60 in/s, far beyond what the crank speed in the video could produce. Working the kinematics by hand showed the code was using *motor* RPM where it needed *crank* RPM, which is 20× slower through the gearbox. Fixing it brought the run to its true ~3.2 in/s. The same habit caught a phase-alignment search that was allowed to shift force by up to 200 ms. That was enough to collapse the real hysteresis loop and make different valving settings look identical, and capping it at 50 ms fixed it.
</div>

---

## First damping characterization (AFCO 63)

To know what "good" looks like, I computed damping targets from the car itself: a 623 lb vehicle with driver, 51/49 weight split, front ride frequency 1.65 Hz, wheel rate 36.6 lbf/in, motion ratio 0.585, and 28° installation angle. Critical damping at the wheel, $$C_c = 2\sqrt{K_w m_s}$$, was transferred to the shock with $$C_{shock} = C_{wheel}/(MR\cos\theta)^2$$. That gives **26.5 lbf·s/in** at the front shock.

| Region | Target (lbf·s/in) | Measured slope (lbf·s/in) | Damping ratio ζ |
| --- | ---: | ---: | ---: |
| Low-speed compression | 16 – 19 | 4.7 | 0.18 |
| High-speed compression | 7 – 9 | 1.1 | 0.04 |
| Low-speed rebound | 17 – 20 | 9.6 | 0.36 |
| High-speed rebound | 8 – 12 | 6.0 | 0.23 |

*Targets use Baja-oriented damping ratios of about 0.6–0.75 at low speed and 0.25–0.45 at high speed. Knee velocities were 2.7 in/s in compression and 1.0 in/s in rebound.*

This is exactly the kind of answer the dyno was built to give. The stock tune is **lightly damped in all four regions**, most of all in low-speed compression, and rebound runs about **2:1** over compression at low speed. A compression plateau near 10 lbf between roughly 0.3 and 1.5 in/s also points to blow-off or check-valve behaviour rather than a clean digressive knee. The team now has a measured, quantitative starting point for revalving instead of trial and error on the track.

---

## Next steps

- **Cover the full speed range.** The characterization run peaked near 3.2 in/s, so its high-speed slopes are an extrapolation. Multi-speed sweeps from about 0.5 in/s up to the 15 in/s design target will measure them directly.
- **Click-by-click valving study.** The protocol is set: the same crank speed for every run, one rebound click setting per run, files named by click count, and comparison by fitted slope at a fixed velocity. This will map how each click shifts the curve.
- **Lag calibration** with the shock removed, so the phase correction is measured rather than searched.
- **Zero checks before every run** to manage ADC baseline drift, plus a consistent encoder sign convention.
- **On-screen results:** send the fitted damping coefficients and peak force back to the touchscreen so a tuning session doesn't need a laptop.

---

## Results

- Designed and built a **crank-driven dynamometer** with a **4 in stroke**, VFD speed control, and a Whiffle Tree load path validated to **FoS 3.1** (frame) and **5.8** (Whiffle Tree) at 750 lbf.
- Developed **Teensy 4.1 firmware** that synchronizes a 24-bit force channel, a 163,840-count-per-revolution crank encoder, Modbus VFD control, and a touchscreen HMI with one-button test presets and layered e-stops.
- Wrote a **Python pipeline** that takes raw serial data to compression and rebound F–V curves and bilinear damping coefficients, with drift removal, zero-phase filtering, and physically bounded phase alignment.
- Delivered the team's **first measured damping characterization**, compared it against targets derived from the car's mass, wheel rates, and motion ratios, and identified a clear revalving direction.

---

## Gallery

### Close-up operation

<video controls playsinline preload="none" poster="{{ '/assets/shockdyno_video2_poster.jpg' | relative_url }}" aria-label="Close view of the shock and crank cycling alongside the dynamometer controls and display">
  <source src="{{ '/assets/shockdyno_video2_web.mp4' | relative_url }}" type="video/mp4">
  <a href="{{ '/assets/shockdyno_video2_web.mp4' | relative_url }}">Watch the close-up of the shock dynamometer.</a>
</video>

*Closer view of the shock, crank linkage, and controls.*

### Full assembly

![Full Assembly CAD](/assets/shockdyno_final_assembly_cad.png)
*Final SolidWorks assembly: worm gearbox and crank wheel at the base, the shock running vertically through the braced towers to the Whiffle Tree at the top.*
