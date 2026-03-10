---
layout: project
title: Baja SAE Vehicle Dynamics Lead
description: Complete redesign of front suspension kinematics and steering geometry following a 2025 structural failure.
tags: [SolidWorks, Python, MATLAB, FEA, Manual Machining]
---

## Overview

As Vehicle Dynamics Lead for Stony Brook Motorsports, I owned the full design-to-fabrication cycle for the Steering, Brakes, and Suspension subsystems. The 2025–2026 season demanded a ground-up redesign after our aluminum A-arms suffered a catastrophic fatigue failure during the 2025 endurance race — ending our run early. The goals were clear: build something stronger, lighter, and more precise.

---

## Design Requirements

Before any CAD was opened, I defined a set of quantitative targets to keep the design accountable:

- **Structural Reliability:** Factor of Safety ≥ 2.5 on all control arms under a worst-case 4G impact load.
- **Ackermann Geometry:** Achieve 60% Ackermann steering to minimize tire scrub in tight, low-speed corners.
- **Bump Steer:** Hold toe change to < 0.05° across full suspension travel to prevent unintended steering inputs.
- **Roll Center Stability:** Optimize Instant Center locations to keep the Roll Center stable relative to the Center of Gravity during body roll.
- **Weight Budget:** Total mass increase < 1.0 lb despite switching from aluminum to 4130 Chromoly Steel, requiring aggressive wall-thickness optimization.

---

## Engineering Process

### 1 — Kinematic Modeling & Simulation

Using **MATLAB** and **SolidWorks Layout Sketches** in tandem, I modeled the full suspension linkage to track virtual swing arm length in real time. Iterating mounting point positions against live kinematic feedback, I converged on a geometry that achieved all handling targets — most notably a **33% reduction in turning radius**.

![Suspension Geometry Analysis](/assets/suspension_geometry.jpg)
*Instant Center layout diagram. The geometry keeps the Roll Center stable relative to the Center of Gravity throughout body roll, producing predictable, progressive handling.*

---

### 2 — FEA & Structural Validation

I ran Finite Element Analysis on the A-arms and chassis attachment tabs, simulating a worst-case 4G landing event. The analysis revealed a critical stress concentration in the previous year's clevis design — the exact location of the 2025 failure. I redesigned the tab geometry to redistribute load across a wider contact area at the bulkhead, pushing the Factor of Safety from **1.1 to 3.1**.

![FEA Results](/assets/FEA.png)
*FEA of the Front Left Upper Control Arm. The redesigned tab geometry eliminates the stress riser that caused the 2025 competition failure.*

---

### 3 — Precision Manufacturing

Simulation accuracy is only as good as the parts you build. To close the gap between model and reality, I designed a custom welding jig to hold control arm geometry during TIG welding. I personally machined all suspension bushings on a manual lathe, holding tolerances of **±0.0005"** to achieve a true press-fit assembly with zero slop in the joints.

<video width="100%" controls>
  <source src="/assets/4%20jaw%20chuck.mp4" type="video/mp4">
</video>
*Dialing in a 4-jaw chuck to hold concentricity for the custom suspension bushings.*

![Finished Bushings](/assets/lathebushing.jpg)
*Finished 4130 Chromoly bushings. Surface finish and dimensional accuracy ensure a press-fit that eliminates joint play.*

---

## Results

| Metric | 2025 (Previous) | 2026 (Redesign) | Improvement |
|---|---|---|---|
| Control Arm FoS | 1.1 | 3.1 | **+182%** |
| Turning Radius | Baseline | −33% | **33% reduction** |
| Total Steering Angle | Baseline | +10% | **10% increase** |
| Bump Steer | Unmeasured | < 0.05° | **Near-zero** |
| Weight Delta | — | < +1.0 lb | **Target met** |

---

## Full Assembly

![Full Assembly Model](/assets/FullAssembly2526.jpg)
*Integrated 2026 chassis model with body panels removed to show suspension packaging and steering rack clearance.*
