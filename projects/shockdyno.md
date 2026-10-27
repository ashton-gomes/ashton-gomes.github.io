---
layout: project
title: Custom Shock Dynamometer
category_label: Senior design · Mechanical & mechatronics
description: "A crank-driven shock dynamometer built for Stony Brook Motorsports. It uses a braced steel frame with a Whiffle Tree load mount, Teensy 4.1 firmware that controls a VFD over Modbus, a 24-bit force channel, a 163,840-count-per-revolution encoder, and a Python pipeline that converts the raw data into damping coefficients."
role: "Mechanical design, firmware & data analysis"
timeline: "Aug 2025 – May 2026"
team: "Senior design team, for Stony Brook Motorsports"
tags: [SolidWorks, FEA, Teensy 4.1, C++ Firmware, ADS1220 24-bit ADC, Quadrature Encoder, RS-485 Modbus RTU, Nextion HMI, Python, SciPy, TIG Welding, Machining]
hero_image: /assets/shockdyno_mainimage.jpg
hero_alt: Assembled shock dynamometer with an AFCO coilover, Whiffle Tree load cell mount, guarded crank, and control enclosure.
hero_caption: "The finished dynamometer with an AFCO 63 shock installed. The Whiffle Tree load cell mount is at the top of the braced steel frame, the guarded crank drive is at the base, and the touchscreen control enclosure is to the side."
related:
  - title: "Baja SAE vehicle dynamics"
    url: /projects/baja-sae.html
---

## Overview

Stony Brook Motorsports uses off-the-shelf coilovers on its Baja car. They come with generic off-road valving, and choosing a better setup by feel is slow and subjective. Commercial shock dynamometers are expensive and are usually designed for different shocks and speed ranges. Our senior design team built a dyno for the team's shocks that measures damping force against shaft velocity, so valving changes can be based on data.

The full system goes from the drive motor to the final damping numbers:

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

*The full system running. The crank cycles the AFCO shock below the Whiffle Tree mount, with the control enclosure and touchscreen next to the guarded mechanism.*

---

## Design requirements

1. Actuation: provide a repeatable 4 in stroke with variable speed, with a design target of 15 in/s peak shaft velocity. This is at the low end of the speeds a Baja shock sees over rough terrain. Speed is changed through the VFD without any mechanical changes.
2. Structure: withstand a worst-case load of 750 lbf at 5° off-axis at the crank pin with a minimum factor of safety of 3.0. This design load was based on on-car linear potentiometer and accelerometer data that was used to estimate real shock forces.
3. Measurement quality: send only the axial shock force into the load cell, without side loads or frame flex, and correct for the shock's changing angle in software.
4. Modularity: fit the team's FOX Float and AFCO shocks without modifying the frame or drivetrain.

---

## Mechanical design

### Scotch yoke to direct-link crank

The first concept was a Scotch yoke, which converts rotation into sinusoidal linear motion using a pin that slides in a slotted yoke. It looked good on paper, but in practice the yoke needed tight tolerances between the slot and pin over the full stroke under cyclic load. It also added a lot of reciprocating mass and would have been the hardest part of the machine to make in our shop.

![Early Scotch Yoke concept](/assets/shock_dyno_render.jpg)
*Early Scotch yoke concept. The sliding yoke at the base was the hardest part to manufacture, which led to the redesign.*

In the final design, the shock itself acts as the connecting link. Its lower eye sits on the crank pin and its upper eye pivots at the Whiffle Tree. This removed the yoke completely and replaced it with one machined pin and bearing stack. The shock's own eyelets, which are already designed for axial cyclic loading, carry the constraint. The downside is that the motion is no longer a pure sinusoid and the shock tilts slightly during each cycle. I accounted for this in the kinematics and the data processing instead of trying to design it out.

### Kinematics of the pivoting-link crank

Since there is no linear guide, the shock length is the distance between the crank pin and the fixed upper pivot. With crank radius $$R$$, pivot distance $$L$$ from the crank center, and crank angle $$\theta$$:

$$d(\theta) = \sqrt{L^2 + R^2 + 2LR\cos\theta}$$

$$x(\theta) = (L + R) - d(\theta), \qquad v(\theta) = \frac{L R \sin\theta}{d(\theta)}\,\omega_{crank}, \qquad \omega_{crank} = \frac{\omega_{motor} }{20}$$

The load cell reading is then resolved along the shock axis using $$\cos\phi = (L + R\cos\theta)/d(\theta)$$.

To check this model against the actual machine, the crank pin and shock body were tracked frame by frame through 159 frames of video of the dyno running. The fitted geometry gave $$L/R \approx 9.7$$–$$9.8$$, and the pivoting-link model matched the tracked motion much more closely than either a pure sinusoid or the standard slider-crank equation.

<video controls muted loop playsinline preload="metadata" aria-label="Close view of the crank driving the lower end of the shock">
  <source src="{{ '/assets/shockdyno_crankvideo.mp4' | relative_url }}#t=0.1" type="video/mp4">
</video>

*Close-up of the crank. The shock swings slightly about its upper pivot, which is why the velocity and force calculations use the pivoting-link geometry instead of assuming straight-line motion.*

### Drivetrain and crank assembly

A 3 HP, 1750 rpm three-phase motor drives a 20:1 worm gearbox and is controlled by a VFD. A machined steel crank wheel, 6 in in diameter and 2 in thick, works as both the crank arm and a flywheel to keep the speed steadier through the high-load parts of each stroke. A 1144 steel crank pin is pressed into two roller bearings in the face of the wheel. Supporting the pin at two points removes the cantilevered bending that a pin with a single bearing would see.

![Crank Assembly Exploded](/assets/shockdyno_crank_assembly_exploded.png)
*Exploded view of the crank assembly. The 1144 steel pin sits in two bearings pressed into the face of the crank wheel.*

### Whiffle Tree load path

The upper shock mount is a Whiffle Tree that isolates the axial force and sends it through the load cell. A floating lower cross-brace holds the shock and is pinned on one side so it can move vertically. A 1000 lbf S-beam load cell sits between this brace and a fixed upper brace, with Heim joints at both ends so the cell only sees tension or compression. FEA of the crossbar showed a peak stress of 47.4 MPa against a 275 MPa yield strength (FoS 5.8) and only 0.006 in of deflection at mid-span. This means the structure is stiff enough that the shock force goes through the sensor instead of flexing the frame.

![Whiffle Tree CAD](/assets/shockdyno_whiffle_tree_assembly.png)
*Whiffle Tree CAD. The S-beam load cell is held between a fixed upper brace and a floating lower brace, and the Heim joints keep the loading purely axial.*

![Whiffle Tree Drawing](/assets/shockdyno_whiffle_tree_drawing.png)
*Crossbar detail drawing (Rev G), with slotted adjustment holes and toleranced pivot-pin bores.*

### Frame and structural validation

The frame is made from 1 × 1 × 0.083 in steel tube. Switching from the Scotch yoke to a rotating crank added off-axis and reciprocating loads, so I added diagonal bracing to the towers to carry these loads and to keep vibration away from the sensors. A worst-case static study applied 750 lbf at 5° off-axis at the crank pin along with the gearbox reaction torque. This gave a minimum FoS of 3.1 at the gearbox mounting plate, with most of the structure above 10 and a maximum displacement of 0.016 in.

![Frame CAD](/assets/shockdyno_frame.png)
*Frame CAD with the diagonal tower bracing added for the crank loads.*

![Frame FEA FoS](/assets/shockdyno_fos_fea.png)
*Factor of safety plot. The minimum of 3.1 is at the gearbox mounting plate under 750 lbf at 5° off-axis with the gearbox reaction torque included.*

### Fabrication

1. The frame was TIG welded from steel tube and painted for corrosion resistance.
2. The crank wheel was turned to its final diameter and width on a manual lathe.
3. A keyway was cut with an arbor press so the wheel would not slip on the gearbox output shaft.
4. The bearing housing was CNC machined for bearing seating and shaft alignment.
5. The crank pin was finished on the manual lathe.
6. The upper and lower cross-braces were CNC milled as the mounting interfaces for the drive and Whiffle Tree.

---

## Electronics and firmware

### Signal chain

| Subsystem | Hardware | Details |
| --- | --- | --- |
| Controller | PJRC Teensy 4.1 | 600 MHz Cortex-M7; priority-ordered, non-blocking main loop |
| Force | Omega LCM103B-1K S-beam + TI ADS1220 | 1000 lbf, 2 mV/V; 24-bit ADC over SPI at gain 128 and 320 SPS continuous; automatic multi-sample tare before each test |
| Position | AMT133Q-V encoder + MAX3096 receiver | 2048 PPR over RS-422, hardware ×4 quadrature decode → 8,192 counts per motor rev and 163,840 per crank rev (0.0022°) |
| Drive | VFD over RS-485 (MAX3485) | Modbus RTU at 19,200 baud: run/stop coils and frequency register |
| Operator interface | Nextion 10.1 in touchscreen | Preset tests, jog buttons, live force waveform |
| Safety | Hardware e-stop + software stop | Dedicated stop input on the Teensy, plus a stop button on the HMI |

![DAQ Quick Test Bench](/assets/shockdyno_quick_test_bench.png)
*Early bench test of the Teensy 4.1 and ADS1220, used to check the load cell signal quality before it was mounted on the dyno.*

### Firmware features

The firmware has three one-button tests that each run for 30 s: a low-speed test (10 Hz on the VFD), a high-speed test (30 Hz), and a sweep that ramps the drive up in 500 ms steps. There is also a 2 Hz forward and reverse jog for homing. Every sample logs the raw encoder counts, crank angle, revolutions, RPM, raw ADC value, force, and cosine-corrected force, and the data is streamed as framed CSV to a logger on a laptop. The touchscreen shows a live force waveform and the system status.

### Touchscreen reliability fixes

The touchscreen interface was the hardest part of the firmware to get working reliably. Most of the problems came from serial timing on a microcontroller that is handling several tasks at the same time:

| Symptom | Cause | Fix |
| --- | --- | --- |
| Touchscreen buttons were sometimes ignored | Acknowledgement bytes from the display filled the serial buffer and hid the start-of-frame marker | Disabled acknowledgements at boot (`bkcmd=0`), increased the receive buffer to 256 bytes, and serviced the display inside the Modbus wait loops |
| Interface froze during VFD commands | Blocking `delay()` calls and long Modbus waits | Removed the blocking waits, built each display update as a single string, and sent at most one group of updates per loop |
| Stop presses were occasionally lost | A single trigger byte could be dropped | A timer on the display resends the stop command five times. The Teensy handler can safely receive repeats |
| Waveform was blank | This display series needs numeric component IDs | Addressed the waveform by its ID as a compile-time constant |
| RPM spike at the start of every test | The velocity history was out of date after the 3 s tare | Reset the rolling RPM values at the start of each test instead of trimming the data afterwards |

---

## Data processing in Python

`dyno_logger.py` captures the serial stream, finds the CSV block, saves a timestamped file, and creates a set of diagnostic plots. These include force versus time (raw and corrected), RPM and VFD frequency, force versus crank angle, the F–V diagram, raw ADC counts, and total revolutions. Command-line options set the crank radius, filter cutoffs, number of bins, and how much of the start and end of the data to trim.

The first real dataset showed that the processing needed to be done carefully. The damping signal was only a few pounds peak-to-peak, while the baseline drifted by tens of pounds. A small number of samples were also stale ADC reads, and the early velocity estimate only updated in coarse steps. The processing steps used to deal with this are:

1. Interpolate over stale ADC samples instead of keeping the repeated values.
2. Remove drift in each crank cycle by subtracting that cycle's mean force.
3. Apply a zero-phase Butterworth low-pass filter (`filtfilt`) to force and angle so the filtering does not add a time lag between channels.
4. Calculate velocity from the encoder position using the pivoting-link kinematics instead of the coarse RPM estimate.
5. Align the phase between force and velocity, limited to 50 ms, which is the most lag the drivetrain could physically add. This keeps the real hysteresis from being removed by the alignment.
6. Use median binning and a bilinear fit on each branch to find the low-speed and high-speed damping slopes and the knee velocity between them.

Checking the results against the physical hardware caught two mistakes in the pipeline. The first F–V plot showed peak velocities of about ±60 in/s, which was much higher than the crank speed seen in the video could produce. Working through the kinematics by hand showed that the code was using the motor RPM where it should have used the crank RPM, which is 20× slower because of the gearbox. Fixing this brought the run to its actual speed of about 3.2 in/s. The second mistake was that the phase alignment was allowed to shift the force by up to 200 ms. This was enough to collapse the real hysteresis loop and make different valving settings look the same, and limiting it to 50 ms fixed the problem.

---

## First damping characterization (AFCO 63)

To have something to compare the measurements against, I calculated damping targets from the car itself. The car weighs 623 lb with the driver and has a 51/49 weight split, a front ride frequency of 1.65 Hz, a wheel rate of 36.6 lbf/in, a motion ratio of 0.585, and a 28° shock installation angle. Critical damping at the wheel, $$C_c = 2\sqrt{K_w m_s}$$, was converted to the shock using $$C_{shock} = C_{wheel}/(MR\cos\theta)^2$$. This gives 26.5 lbf·s/in at the front shock.

| Region | Target (lbf·s/in) | Measured slope (lbf·s/in) | Damping ratio ζ |
| --- | ---: | ---: | ---: |
| Low-speed compression | 16 – 19 | 4.7 | 0.18 |
| High-speed compression | 7 – 9 | 1.1 | 0.04 |
| Low-speed rebound | 17 – 20 | 9.6 | 0.36 |
| High-speed rebound | 8 – 12 | 6.0 | 0.23 |

*The targets use damping ratios of about 0.6–0.75 at low speed and 0.25–0.45 at high speed, which are typical for Baja. The knee velocities were 2.7 in/s in compression and 1.0 in/s in rebound.*

The results show that the stock valving is lightly damped in all four regions, and the low-speed compression is the furthest from its target. At low speed, the rebound damping is about twice the compression damping. There is also a flat region in compression at about 10 lbf between roughly 0.3 and 1.5 in/s, which seems to come from blow-off or check-valve behavior instead of a clean digressive knee. With these measurements, the team now has a starting point for revalving the shocks instead of relying on trial and error at the track.

---

## Next steps

- Test the full speed range. The characterization run only reached about 3.2 in/s, so the high-speed slopes are extrapolated. Sweeps at several speeds from about 0.5 in/s up to the 15 in/s design target will measure them directly.
- Run a click-by-click valving study. The procedure is already planned: the same crank speed for every run, one rebound click setting per run, files named by click count, and comparisons made using the fitted slope at a fixed velocity. This will show how each click changes the curve.
- Calibrate the lag with the shock removed, so the phase correction is measured directly instead of searched for.
- Check the zero before every run to manage the ADC baseline drift, and use a consistent sign convention for the encoder.
- Send the fitted damping coefficients and peak force back to the touchscreen, so a tuning session can be done without a laptop.

---

## Summary

- Designed and built a crank-driven dynamometer with a 4 in stroke, VFD speed control, and a Whiffle Tree load path. FEA showed a minimum factor of safety of 3.1 for the frame and 5.8 for the Whiffle Tree at 750 lbf.
- Wrote Teensy 4.1 firmware that synchronizes the 24-bit force channel, the 163,840-count-per-revolution crank encoder, Modbus control of the VFD, and the touchscreen, which has one-button test presets and multiple e-stops.
- Wrote a Python pipeline that converts the raw serial data into compression and rebound F–V curves and bilinear damping coefficients, using drift removal, zero-phase filtering, and a phase alignment limited to what the hardware can physically produce.
- Produced the team's first measured damping characterization and compared it to targets calculated from the car's mass, wheel rates, and motion ratios, which showed which direction to take the revalving.

---

## Gallery

### Close-up of the dyno running

<video controls playsinline preload="none" poster="{{ '/assets/shockdyno_video2_poster.jpg' | relative_url }}" aria-label="Close view of the shock and crank cycling alongside the dynamometer controls and display">
  <source src="{{ '/assets/shockdyno_video2_web.mp4' | relative_url }}" type="video/mp4">
  <a href="{{ '/assets/shockdyno_video2_web.mp4' | relative_url }}">Watch the close-up of the shock dynamometer.</a>
</video>

*Closer view of the shock, crank linkage, and controls.*

### Full assembly

![Full Assembly CAD](/assets/shockdyno_final_assembly_cad.png)
*Final SolidWorks assembly. The worm gearbox and crank wheel are at the base, and the shock runs vertically through the braced towers to the Whiffle Tree at the top.*
