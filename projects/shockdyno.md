---
layout: project
title: Custom Shock Dynamometer
description: Designed and fabricated a crank-driven shock dynamometer with a 4-inch stroke, integrated force and encoder acquisition, and Python analysis of compression/rebound force-velocity curves.
tags: [SolidWorks, Python, FEA, Teensy 4.1, DAQ, Firmware, Manual Machining]
hero_image: /assets/shockdyno_mainimage.jpg
hero_alt: Assembled shock dynamometer with an AFCO coilover, Whiffle Tree load cell mount, guarded crank, and control enclosure.
hero_caption: "The assembled shock dynamometer with an AFCO shock installed. The Whiffle Tree load cell mount, guarded crank-flywheel drive, and control enclosure bring the mechanical design and instrumentation into one test system."
---

## Overview

I designed and fabricated this crank-driven shock dynamometer as a **senior design project from August 2025 to May 2026**. A **3 HP motor**, **20:1 worm gearbox**, and variable-frequency drive provide a **4-inch stroke**, with a **15 in/s peak velocity target** for damping characterization. The project combines mechanical actuation, force acquisition, and encoder-based axial velocity calculation to generate compression and rebound force-velocity curves.

The dyno was developed for Stony Brook Motorsports to objectively characterize and tune the team's dampers. I developed **Teensy 4.1 firmware** and a **Python analysis pipeline** integrating a **24-bit ADS1220 ADC** and **quadrature encoder**. The assembled system operates with an AFCO shock installed, while the analysis generates compression/rebound force-velocity curves and estimates branch slopes through median binning and cross-validated fitting.

### Assembled Dyno in Operation

<video width="1920" height="1080" controls playsinline preload="none" poster="{{ '/assets/shockdyno_mainvideo_poster.jpg' | relative_url }}" aria-label="Full view of the assembled shock dynamometer operating with an AFCO shock">
  <source src="{{ '/assets/shockdyno_mainvideo_web.mp4' | relative_url }}" type="video/mp4">
  <a href="{{ '/assets/shockdyno_mainvideo_web.mp4' | relative_url }}">Watch the shock dynamometer operating.</a>
</video>

*Full-system operating view. The rotating crank cycles the AFCO shock beneath the Whiffle Tree mount, with the control enclosure and display alongside the guarded mechanism.*

---

## Design Requirements & Constraints

### 1. Actuation Fidelity
Provide a repeatable **4-inch stroke** (2" crank eccentricity), **targeting 15 in/s peak velocity** for damping characterization. Variable-speed control via VFD allows testing at different damping velocities.

### 2. Structural Integrity
Survive a worst-case loading scenario of **750 lbf at 5° off-axis**, the estimated peak force at the crank pin intersection under maximum damping combined with gearbox reaction torque. The frame must achieve a minimum **FoS of 3.0** under this condition to ensure operator safety across thousands of fatigue cycles.

### 3. Data Accuracy
Produce clean, axially-corrected force data with no contamination from side-loading or parasitic frame deflection. The load cell measurement must reflect true hydraulic damping resistance, not structural noise. This requires both mechanical isolation of off-axis forces and a position-based cosine correction applied in post-processing to keep all output data in the axial reference frame.

### 4. Modularity
Support rapid interchangeability between different damper architectures, including the team's FOX Float and AFCO racing shocks, without requiring modifications to the frame or drivetrain.

---

## Engineering Process

### 1. Design Iteration: Scotch Yoke to Direct-Link Crank

The original mechanism was a **Scotch Yoke**, a slider-crank variant that converts rotary motion into perfectly sinusoidal linear displacement by constraining a pin inside a translating slotted yoke. The appeal was kinematic purity: the output stroke is mathematically sinusoidal regardless of RPM, with no velocity distortion at the ends of travel. This made it an intuitive first choice for a dynamometer where accurate velocity profiles matter.

![Scotch Yoke Design](/assets/shock_dyno_render.jpg)
*Early Scotch Yoke design. The open frame and sliding yoke mechanism at the base required close tolerances on slot width and pin diameter throughout the full stroke, a high-risk manufacturing challenge that drove the redesign.*

In practice, however, the Scotch Yoke introduced significant fabrication and mechanical complexity. The yoke itself, a precision-slotted sliding member that must remain in tight contact with the crank pin throughout the stroke, requires close tolerances on both the slot width and the pin diameter to prevent slop, binding, and side-loading on the shock's internal seals. Holding those tolerances on shop equipment, and doing so repeatably across the full stroke under cyclic loading, was identified as a high-risk manufacturing challenge. The yoke also added considerable reciprocating mass, increasing the inertial loads the frame and gearbox would need to absorb at speed.

The design was revised to a **direct-link crank**, where the shock absorber itself serves as the connecting rod between the crank pin and a fixed upper mount. This eliminated the yoke entirely, the most complex custom-fabricated component in the original design, and replaced it with a single precision-machined steel pin and bearing stack. The shock's eyelets, already designed to handle axial cyclic loading, handle the kinematic constraint naturally. Off-axis forces are managed by the dual-bearing crank pin interface rather than a sliding yoke, which is both easier to manufacture and more robust under sustained cyclic loads.

The tradeoff is that a direct-link crank produces **approximately sinusoidal motion**, with instantaneous velocity depending on the mechanism geometry. The quadrature encoder tracks rotation, and the Python pipeline calculates axial velocity from that position information and the crank geometry. The force-velocity analysis therefore uses the calculated shock velocity at each sample rather than assuming an ideal sinusoidal profile.

### 2. Mechanism Design & Kinematic Analysis

The drivetrain consists of a **3 HP AC motor** running at **1750 RPM**, coupled to a **20:1 worm gearbox** to produce the low-speed, high-torque output required for damper actuation. A **4 HP-rated VFD** controls motor speed, enabling variable velocity sweeps across the damper's full operating range.

At the output shaft, a precision-machined **6" diameter, 2"-thick steel flywheel** acts as both the crank arm and a high-inertia mass to smooth velocity fluctuations at peak damping load transitions. A **1144 steel crank pin** is press-fit into dual precision roller bearings seated in the wheel face, a dual-bearing interface that eliminates cantilevered bending moments and keeps the pin perpendicular to the wheel's rotation under load. The shock's lower eyelet mounts directly to this pin, converting rotary motion into pure linear stroke.

### Crank Assembly

![Crank Assembly Exploded](/assets/shockdyno_crank_assembly_exploded.png)
*Exploded view of the crank assembly. The 1144 steel pin seats into dual precision roller bearings pressed into the 6" flywheel face, eliminating the cantilevered bending typical of single-bearing crank pins.*

### 3. Force Measurement & Whiffle Tree Assembly

The upper shock mount uses a custom **Whiffle Tree assembly** designed to isolate axial damping forces and route them cleanly to the load cell. Two horizontal cross-braces span the vertical towers. The lower floating brace is the primary shock mounting point, pinned on one side to allow free vertical movement. An **S-type load cell rated to 1 ton capacity** is positioned vertically between the two cross-braces and mounted via **dual Heim joints** on both ends, a spherical-link configuration that constrains the load cell to pure tension and compression only, filtering out any lateral vibration or misalignment from the crank.

As the shock cycles, the floating lower brace transfers force directly up through the load cell and into the fixed upper brace, which is bolted rigidly to the tower structure. Crossbar FEA validated a maximum stress of **47.4 MPa** against a material yield of 275 MPa (FoS 5.8), and a maximum deflection of only **0.006"** at mid-span, stiff enough to ensure shock energy routes through the sensor rather than flexing the structure.

### Whiffle Tree Assembly

![Whiffle Tree CAD](/assets/shockdyno_whiffle_tree_assembly.png)
*Whiffle Tree CAD. The S-type load cell is constrained between a fixed upper datum and a floating lower brace, with Heim joints on both ends enforcing pure axial loading.*

![Whiffle Tree Drawing](/assets/shockdyno_whiffle_tree_drawing.png)
*Detail drawing for the Whiffle Tree crossbar (Rev G), showing the slotted adjustment holes and tight tolerances on the pivot pin bores.*

### 4. FEA & Structural Validation

The frame is built from **1" x 1" x 0.083" low-carbon steel rectangular tubing**. The switch from a Scotch Yoke to a rotating crank introduced off-axis forces and reciprocating mass not present in the original design, so additional diagonal bracing was added to the mounting towers to manage cyclic loads and prevent harmonic vibration from reaching the DAQ sensors.

A worst-case static simulation applied **750 lbf at 5° off-axis** at the crank pin/shock intersection, combined with a remote torque load on the gearbox and motor mounts. Results: **minimum FoS of 3.1** at the gearbox mounting plate, with the overwhelming majority of the structure at FoS 10+. Max frame displacement was **0.016"** under this loading condition.

### FEA Results

![Frame CAD](/assets/shockdyno_frame.png)
*Frame CAD showing the diagonal tower bracing added to handle the off-axis and reciprocating crank loads absent in the original Scotch Yoke design.*

![Frame FEA FoS](/assets/shockdyno_fos_fea.png)
*Frame Factor of Safety distribution. Minimum FoS = 3.1 at the gearbox mounting plate under 750 lbf at 5° off-axis with combined gearbox reaction torque.*

### 5. Data Acquisition & Position Correction

I developed firmware for a **Teensy 4.1 microcontroller** paired with a **24-bit ADS1220 ADC** and **quadrature encoder**. The system captures force and encoder position together, providing the inputs for the Python pipeline to calculate axial velocity throughout the stroke.

Because the shock operates as a connecting rod rather than a pure linear actuator, its angle changes through the crank cycle. The **Python analysis pipeline** uses encoder position and mechanism geometry to calculate axial velocity and apply the force correction described in the design. It generates separate **compression and rebound force-velocity curves**, then estimates the branch slopes using **median binning and cross-validated fitting**.

### DAQ Bench Validation

![DAQ Quick Test Bench](/assets/shockdyno_quick_test_bench.png)
*Early bench validation of the Teensy 4.1 + ADS1220 DAQ stack, confirming load cell signal quality prior to full mechanical integration.*

### 6. Fabrication & System Integration

The assembled dyno brings the braced steel frame, machined crank, Whiffle Tree assembly, and controls together around the installed AFCO shock. The transparent guard keeps the crank and lower shock interface visible, while the adjacent enclosure houses the operator controls and display. This is the transition from the separate mechanical and DAQ development steps to an operating test system.

<video width="1920" height="1080" controls playsinline preload="none" poster="{{ '/assets/shockdyno_video2_poster.jpg' | relative_url }}" aria-label="Close view of the shock and crank cycling alongside the dynamometer controls and display">
  <source src="{{ '/assets/shockdyno_video2_web.mp4' | relative_url }}" type="video/mp4">
  <a href="{{ '/assets/shockdyno_video2_web.mp4' | relative_url }}">Watch the close-up of the shock dynamometer.</a>
</video>

*Closer operating view of the shock, crank linkage, and controls. The changing shock angle through the crank cycle illustrates why the position-based velocity calculation and force correction described above are part of the measurement pipeline.*

---

## Results & Impact

- **Structural:** Frame validated to a minimum FoS of **3.1** under worst-case loading; Whiffle Tree crossbar achieves **5.8 FoS** with only **0.006" deflection**, confirming the load path routes through the sensor rather than the structure.
- **Fabrication & Integration:** Assembled the frame, machined drivetrain, Whiffle Tree load cell interface, guard, and control enclosure into the physical dynamometer shown above.
- **Mechanical Operation:** Demonstrated crank-driven cycling of an installed AFCO shock in the full-system and close-up operating videos.
- **Actuation:** Provided a **4-inch stroke** using a **3 HP motor**, **20:1 worm gearbox**, and VFD, with a **15 in/s peak velocity target**.
- **Firmware & DAQ:** Integrated the **Teensy 4.1**, **24-bit ADS1220 ADC**, and **quadrature encoder** to capture force and calculate axial velocity.
- **Damping Analysis:** Generated compression/rebound **force-velocity curves** and estimated branch slopes through **median binning and cross-validated fitting**.
- **Motivated by real data:** An on-car linear potentiometer and body accelerometer system was used to estimate actual shock forces experienced during testing. This data directly drove the 750 lbf worst-case design load and confirmed the velocity range the dyno needs to cover.

---

## Gallery

### Full Assembly

![Full Assembly CAD](/assets/shockdyno_final_assembly_cad.png)
*Final SolidWorks assembly. The worm gearbox and crank-flywheel drive sit at the base, with the shock running vertically through the braced tower structure to the Whiffle Tree load cell interface at the top.*
