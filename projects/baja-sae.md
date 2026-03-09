---
layout: project
title: Baja SAE Vehicle Dynamics Lead
description: Complete redesign of front suspension kinematics and steering geometry following a 2025 structural failure.
tags: [SolidWorks, Python, MATLAB, FEA, Manual Machining]
---

## Overview

As Vehicle Dynamics Lead, I headed the design and fabrication of the Steering, Brakes, and Suspension subsystems. The primary objective for the 2025–2026 season was a ground-up redesign to address the catastrophic fatigue failure of the previous year's aluminum A-arms, while simultaneously improving low-speed maneuverability.

## Design Requirements & Constraints

- **Structural Reliability:** Increase Factor of Safety (FoS) on control arms to 2.5+ under peak impact loading.
- **Kinematic Optimization:**
  - Achieve **60% Ackermann steering** to reduce tire scrub.
  - Minimize **Bump Steer** to <0.05° throughout full travel.
  - Optimize Instant Centers to stabilize the Roll Center during cornering.
- **Weight Management:** Limit total mass increase to <1.0 lb despite switching from Aluminum to 4130 Chromoly.

## Engineering Process

### 1. Kinematic Modeling & Simulation

Using a combination of **MATLAB** and **SolidWorks Layout Sketches**, I modeled the suspension linkage to track the virtual swing arm length. This allowed for real-time iteration of mounting points to achieve a **33% reduction in turning radius**.

### 2. FEA & Validation

I performed Finite Element Analysis on the A-arms and chassis tabs, simulating a "Worst-Case" 4G landing scenario.

- **Result:** Identified a stress concentration in the previous year's clevis design. Redesigned the tab geometry to distribute load more evenly across the bulkhead, pushing the FoS from 1.1 to 3.1.

### 3. Precision Manufacturing

To ensure the simulation matched reality, I designed a custom welding jig for the control arms. I personally performed the manual machining for the bushings, holding tolerances of **±0.0005"** on a manual lathe to eliminate slop in the suspension joints.

---

## Results & Impact

- **Strength:** Individual components are **286% stronger** (FoS 3.1) with a negligible weight penalty.
- **Agility:** **33% reduction in turning radius** and a 10% increase in total steering angle.
- **Stability:** Achieved near-zero bump steer, significantly reducing driver fatigue during endurance heats.

---

## Gallery & Design Documentation

### Full Assembly Integration

![Full Assembly Model](/assets/FullAssembly2526.jpg)
*The integrated 2026 chassis model. Body panels are omitted to show suspension packaging and steering rack clearance.*

### Kinematic Synthesis

![Suspension Geometry Analysis](/assets/suspension_geometry.jpg)
*Instant Center layout. The geometry ensures the Roll Center remains stable relative to the Center of Gravity during body roll, promoting predictable handling.*

### High-Precision Fabrication

<video width="100%" controls>
  <source src="/assets/4%20jaw%20chuck.mp4" type="video/mp4">
</video>

*Dialing in a 4-jaw chuck to ensure concentricity for custom suspension bushings.*

![Bushing Finish](/assets/lathebushing.jpg)
*Finished 4130 steel bushings held to a 0.0005" tolerance for a press-fit assembly.*
