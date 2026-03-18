---
layout: project
title: Baja SAE Vehicle Dynamics Lead
description: Complete redesign of front suspension kinematics and steering geometry following a 2025 structural failure.
tags: [SolidWorks, Python, MATLAB, FEA, Manual Machining]
---

## Overview

As Vehicle Dynamics Lead, I headed the design and fabrication of the Steering, Brakes, and Suspension subsystems. The primary objective for the 2025-2026 season was a ground-up redesign to address the catastrophic fatigue failure of the previous year's aluminum A-arms, while simultaneously improving low-speed maneuverability.

---

## 2025 Failure Analysis

The redesign was motivated by a structural failure during competition. The images below document the failure mode that drove every design decision in the 2026 season.

### System-Level View

![Car 92 rear suspension after failure](/assets/bajasae_92failedsides.jpg)
*Car #92 at the 2025 competition following A-arm failure. The collapsed lower control arm geometry is visible at the rear axle, with the suspension dropping out of its designed travel range, a direct consequence of the weld joint fracture shown below.*

### Fracture Detail

![Failed A-arm weld joint close-up](/assets/bajasae_92failedarm.jpg)
*Close-up of the fractured weld joint at the A-arm tube junction. The crack initiated and propagated through the heat-affected zone (HAZ) at the gusset-to-tube interface, a classic fatigue failure driven by stress concentration at an under-reinforced weld. The Factor of Safety at this joint was effectively 1.0 at the point of fracture.*

The failure mode informed two immediate design changes: a material transition from aluminum to 4130 Chromoly Steel (higher fatigue strength and weldability), and a tab geometry redesign to distribute load away from the weld toe and reduce stress concentration at the critical joint.

---

## Design Requirements & Constraints

### 1. Structural Reliability
Increase **Factor of Safety (FoS)** at critical stress concentrations to **1.4+**, with overall control arm FoS exceeding **5.0**. This ensures the assembly can withstand high-stress events without plastic deformation at the points that caused the previous year's failure.

### 2. Kinematic Optimization
Focus on precision handling by achieving the following metrics:
* **Ackermann Steering:** Achieve **60%** to significantly reduce tire scrub in tight corners.
* **Bump Steer:** Maintain **<0.05°** throughout full travel to prevent unintended steering inputs.
* **Roll Stability:** Optimize Instant Centers to stabilize the Roll Center relative to the Center of Gravity during cornering.

### 3. Weight Management
Limit total mass increase to **<1.0 lb** despite the material transition. This requires aggressive wall-thickness optimization when switching from Aluminum to **4130 Chromoly Steel**.

---

## Engineering Process

### 1. Kinematic Modeling & Simulation

Using a combination of **MATLAB** and **SolidWorks Layout Sketches**, I modeled the suspension linkage to track the virtual swing arm length. This allowed for real-time iteration of mounting points to achieve a **25% reduction in turning radius (10 ft to 7.5 ft)**.

### Kinematic Synthesis

![Suspension Geometry Analysis](/assets/suspension_geometry.jpg)
*Instant Center layout. The geometry ensures the Roll Center remains stable relative to the Center of Gravity during body roll, promoting predictable handling.*

### 2. FEA & Validation

I performed Finite Element Analysis on the A-arms and chassis tabs, simulating a "Worst-Case" 4G landing scenario.

- **Result:** Identified a stress concentration in the previous year's weld joint and shock mounting design. Redesigned the tab geometry to distribute load more evenly, pushing the FoS at the critical failure point from 1.0 to 1.45 (a 45% improvement), while the overall control arm structure exceeds FoS 5.0.

### FEA Validation

![Suspension Geometry Analysis](/assets/FEA.png)
*Sample FEA of the Front Left Upper Control Arm, highlighting the improved factor of safety at the critical stress concentration that caused the 2025 competition failure.*

### 3. Suspension Jigging & Geometric Validation

With the kinematic model finalized, the critical challenge was translating simulation accuracy into physical hardware, particularly given the compounding tolerances inherent in plasma-cut tabs and hand-fabricated tubing. To solve this, I designed and built a custom **in-house aluminum plate jig** specifically to provide an analytical solution to these cumulative errors, allowing individual component positions to be adjusted relative to one another until the target suspension geometry was achieved, rather than relying on the accuracy of any single part.

#### Establishing a Reference Datum

![Height Gauge Setup](/assets/bajasae_heightgauge.jpg)
*Mitutoyo digital height gauge measuring 8.8770" below the floor plane tube, the reference datum for the entire jigging setup.*

The first step was establishing a precise vertical datum. Using a **Mitutoyo digital height gauge**, I measured **8.8770" below the bottom of the floor plane tube**, which serves as the global datum for the entire vehicle. Since the tube has a 1.25" outer diameter, half the tube diameter was subtracted from the raw reading to locate the true centerline reference plane. This 8.8770" dimension corresponds to the designed **neutral ride height of ~10 inches** at the wheel, accounting for driver-loaded static deflection. By jigging the suspension at this exact loaded position, I ensured the hardpoints were set at the precise point in travel where the kinematic calculations were derived, keeping the physical geometry consistent with the CAD model.

#### Lower Control Arm Tack and Geometry Setting

![Lower Control Arm Jigging](/assets/bajasae_lowercontrolarm.jpg)
*Lower control arm tacked in position on the aluminum plate jig, with clamps holding position prior to upper arm adjustment.*

With the datum established, the lower control arm was clamped and tacked in place on the jig. This locked the LCA node positions as the fixed reference for the next step: setting the upper control arm to achieve the target **2° of static camber** and **8° of caster**. Rather than trusting the dimensional accuracy of any individual plasma-cut tab, the jig allowed me to dial in the relative positions of both arms iteratively until the desired angles were confirmed, absorbing compounding fabrication error in the process. Hardpoint placement was held **within ±0.1"** across the assembly, with final geometry verified against the kinematic drawings before any final welds were made.

#### Final Assembled Corner

![Front Left Suspension Assembly](/assets/bajasae_frontleftsuspension_setup.jpg)
*Completed front left corner showing the AFCO 63 coilover (8" travel, adjustable rebound), uprights, and A-arm geometry as assembled.*

The finished corner, fitted with the **AFCO 63 coilover** running 8 inches of travel with adjustable rebound, confirmed that the jig process successfully translated the kinematic design into hardware. The geometry matched design targets within tolerance, validating the jigging approach as an effective method for maintaining simulation accuracy through fabrication.

### 4. Precision Manufacturing

To ensure the simulation matched reality, I designed a custom welding jig for the control arms. I personally performed the manual machining for the bushings, holding tolerances of **±0.0005"** on a manual lathe to eliminate slop in the suspension joints.

### High-Precision Fabrication

<video width="100%" controls>
  <source src="/assets/4%20jaw%20chuck.mp4" type="video/mp4">
</video>

*Dialing in a 4-jaw chuck to ensure concentricity for custom suspension and steering bushings.*

![Bushing Finish](/assets/lathebushing.jpg)
*Finished bronze bushings held to a 0.0005" tolerance for a press-fit assembly.*

---

## Results & Impact

- **Strength:** **45% stronger at critical stress concentrations** (FoS 1.0 to 1.45), with overall control arm FoS exceeding 5.0 and a negligible weight penalty.
- **Agility:** **25% reduction in turning radius** (10 ft to 7.5 ft) and a **10.9° increase** in total steering angle.
- **Stability:** Achieved near-zero bump steer, significantly reducing driver fatigue during endurance heats.

---

## Gallery

### Full Assembly Integration

![Full Assembly Model](/assets/FullAssembly2526.jpg)
*The integrated 2026 chassis model. Body panels are omitted to show suspension packaging and steering rack clearance.*

### Competition

![Car 92 at Competition](/assets/bajasae_92.jpg)
*Car #92 competing in the endurance race course at competition.*
