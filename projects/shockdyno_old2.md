---
layout: project
title: Custom Shock Dynamometer
description: Design and fabrication of a custom dynamometer for objective suspension tuning and damping characterization of Baja SAE shocks.
tags: [SolidWorks, Python, FEA, DAQ, Controls, Manual Machining]
---

## Overview

Off-road racing vehicles can experience over 12 inches of suspension travel during high-velocity impacts, and tuning dampers based on "driver feel" alone introduces unacceptable variability into that process. This project is the design and fabrication of a custom shock dynamometer — a machine capable of actuating a shock absorber through a repeatable sinusoidal stroke at controlled velocities and capturing real-time Force-Velocity (FV) curves with high-resolution DAQ hardware.

The dyno is being built as a senior capstone project in collaboration with Stony Brook Motorsports, where it will be used to objectively characterize and tune the team's dampers rather than relying on subjective on-car feedback. The system is currently in active fabrication, with the frame jigged and tacked, crank components being machined, and a functional load cell DAQ already validated.

![Full Assembly CAD](/assets/shockdyno_final_assembly_cad.png)
*Complete SolidWorks assembly of the final design. The worm gearbox and crank-flywheel drive sit at the base, with the shock running vertically through the braced tower structure to the Whiffle Tree load cell interface at the top.*

---

## Design Requirements & Constraints

### 1. Actuation Fidelity
Deliver a repeatable **4-inch stroke** (2" crank eccentricity) at a peak velocity of **15 in/s**, accurately simulating real suspension velocities encountered during Baja SAE competition. Variable-speed control via VFD allows the full range of damping velocities to be swept in a single test session.

### 2. Structural Integrity
Survive a worst-case loading scenario of **750 lbf at 5° off-axis** — the estimated peak force at the crank pin intersection under maximum damping combined with gearbox reaction torque. The frame must achieve a minimum **FoS of 3.0** under this condition to ensure operator safety across thousands of fatigue cycles.

### 3. Data Accuracy
Produce clean, axially-corrected force data with no contamination from side-loading or parasitic frame deflection. The load cell measurement must reflect true hydraulic damping resistance, not structural noise. This requires both mechanical isolation of off-axis forces and a position-based cosine correction applied in post-processing to keep all output data in the axial reference frame.

### 4. Modularity
Support rapid interchangeability between different damper architectures — including the team's FOX Float and AFCO racing shocks — without requiring modifications to the frame or drivetrain.

---

## Engineering Process

### 1. Mechanism Design & Kinematic Analysis

The initial design used a Scotch Yoke mechanism to produce sinusoidal motion, but this was revised in favor of a **direct-link crank** where the shock absorber itself serves as the connecting rod. This eliminated the yoke entirely, reducing fabricated part count and simplifying the reciprocating mass.

The drivetrain consists of a **3 HP AC motor** running at **1750 RPM**, coupled to a **20:1 worm gearbox** to produce the low-speed, high-torque output required for damper actuation. A **4 HP-rated VFD** controls motor speed, enabling variable velocity sweeps across the damper's full operating range.

At the output shaft, a precision-machined **6" diameter, 2"-thick steel flywheel** acts as both the crank arm and a high-inertia mass to smooth velocity fluctuations at peak damping load transitions. A **1144 steel crank pin** is press-fit into dual precision roller bearings seated in the wheel face — a dual-bearing interface that eliminates cantilevered bending moments and keeps the pin perpendicular to the wheel's rotation under load. The shock's lower eyelet mounts directly to this pin, converting rotary motion into pure linear stroke.

### Crank Assembly

![Crank Assembly Exploded](/assets/shockdyno_crank_assembly_exploded.png)
*Exploded view of the crank assembly. The 1144 steel pin seats into dual precision roller bearings pressed into the 6" flywheel face, eliminating the cantilevered bending typical of single-bearing crank pins.*

### 2. Force Measurement & Whiffle Tree Assembly

The upper shock mount uses a custom **Whiffle Tree assembly** designed to isolate axial damping forces and route them cleanly to the load cell. Two horizontal cross-braces span the vertical towers. The lower floating brace is the primary shock mounting point, pinned on one side to allow free vertical movement. An **S-type load cell rated to 1 ton capacity** is positioned vertically between the two cross-braces and mounted via **dual Heim joints** on both ends — a spherical-link configuration that constrains the load cell to pure tension and compression only, filtering out any lateral vibration or misalignment from the crank.

As the shock cycles, the floating lower brace transfers force directly up through the load cell and into the fixed upper brace, which is bolted rigidly to the tower structure. Crossbar FEA validated a maximum stress of **47.4 MPa** against a material yield of 275 MPa (FoS 5.8), and a maximum deflection of only **0.006"** at mid-span — stiff enough to ensure shock energy routes through the sensor rather than flexing the structure.

### Whiffle Tree Assembly

![Whiffle Tree CAD](/assets/shockdyno_whiffle_tree_assembly.png)
*Whiffle Tree CAD. The S-type load cell is constrained between a fixed upper datum and a floating lower brace, with Heim joints on both ends enforcing pure axial loading.*

![Whiffle Tree Drawing](/assets/shockdyno_whiffle_tree_drawing.png)
*Detail drawing for the Whiffle Tree crossbar (Rev G), showing the slotted adjustment holes and tight tolerances on the pivot pin bores.*

### 3. FEA & Structural Validation

The frame is built from **1" × 1" × 0.083" low-carbon steel rectangular tubing**. The switch from a Scotch Yoke to a rotating crank introduced off-axis forces and reciprocating mass not present in the original design, so additional diagonal bracing was added to the mounting towers to manage cyclic loads and prevent harmonic vibration from reaching the DAQ sensors.

A worst-case static simulation applied **750 lbf at 5° off-axis** at the crank pin/shock intersection, combined with a remote torque load on the gearbox and motor mounts. Results: **minimum FoS of 3.1** at the gearbox mounting plate, with the overwhelming majority of the structure at FoS 10+. Max frame displacement was **0.016"** under this loading condition.

### FEA Results

![Frame CAD](/assets/shockdyno_frame.png)
*Frame CAD showing the diagonal tower bracing added to handle the off-axis and reciprocating crank loads absent in the original Scotch Yoke design.*

![Frame FEA FoS](/assets/shockdyno_fos_fea.png)
*Frame Factor of Safety distribution. Minimum FoS = 3.1 at the gearbox mounting plate under 750 lbf at 5° off-axis with combined gearbox reaction torque.*

### 4. Data Acquisition & Position Correction

Data is logged via a **Teensy 4.1 microcontroller** paired with a **24-bit ADS1220 ADC** for high-resolution analog load cell acquisition. A **2048 CPR incremental rotary encoder** is mounted directly on the motor shaft — the high-resolution placement is intentional, as the 20:1 gearbox reduction amplifies encoder resolution at the crank output, yielding precise angular position data throughout the stroke.

Because the shock operates as a connecting rod rather than a pure linear actuator, the instantaneous force vector rotates as a function of crank angle. The Teensy logs raw encoder counts and load cell voltage simultaneously; a **Python post-processing pipeline** then applies a cosine correction factor derived from the instantaneous crank angle to project all force data back onto the axial reference frame. This ensures the output FV curves reflect true hydraulic damping resistance rather than the apparent force along the crank's line of action.

### DAQ Bench Validation

![DAQ Quick Test Bench](/assets/shockdyno_quick_test_bench.png)
*Early bench validation of the Teensy 4.1 + ADS1220 DAQ stack, confirming load cell signal quality prior to full mechanical integration.*

---

## Results & Impact

- **Structural:** Frame validated to a minimum FoS of **3.1** under worst-case loading; Whiffle Tree crossbar achieves **5.8 FoS** with only **0.006" deflection**, confirming the load path routes through the sensor rather than the structure.
- **Fabrication:** Frame tubes cut, jigged, and tacking underway. Crank wheel and pin being machined (keyway broached). Clevis, mounting tabs, and all ordered components in-hand.
- **DAQ Validation:** Functional Teensy/ADS1220 bench system already collecting load cell data, confirming signal quality ahead of full system integration.
- **Motivated by real data:** An on-car linear potentiometer and body accelerometer system was used to estimate actual shock forces experienced during testing — this data directly drove the 750 lbf worst-case design load and confirmed the velocity range the dyno needs to cover.

---

## Gallery

![Original Shock Dyno Scotch-Yoke Render](/assets/shock_dyno_render.jpg)
*Early render of the scotch-yoke full assembly, showing overall system packaging and the vertical shock load path through the tower structure.*
