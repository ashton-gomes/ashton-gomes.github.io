---
layout: project
title: Baja SAE Vehicle Dynamics Lead
description: Led a 12-member steering, suspension, and braking team; reduced inside turning radius from 9 ft to 2 ft and control-arm weight by approximately 0.8 lb per arm.
tags: [SolidWorks, MATLAB, Suspension Kinematics, FEA, DFM, DFA, Manual Machining]
hero_image: /assets/bajasae_finalimage.jpg
hero_alt: Completed Stony Brook Motorsports Baja SAE car 99 with its suspension assembled at the competition paddock.
hero_caption: "The completed Baja SAE vehicle at the competition paddock. The assembled car brings the suspension geometry, steering packaging, and fabrication work described below into a single system."
---

## Overview

As **Vehicle Dynamics Lead for Stony Brook Motorsports since June 2025**, I lead a **12-member team** responsible for steering, suspension, and braking. I coordinate design reviews, FEA, and fabrication schedules, completing all three systems by the end of the academic year. The 2025-2026 redesign addressed the previous year's aluminum A-arm failure while improving maneuverability, reducing control-arm mass, and simplifying fabrication.

The updated suspension and steering contributed to the team's **9th-place finish in the overall dynamic-event standings**, an improvement from **40th to 18th in acceleration**, and **18th place in hill climb**.

The completed vehicle shown above is the outcome of that redesign. The process below follows the suspension from the 2025 failure analysis through kinematic modeling, structural validation, precision fabrication, and final integration into the car.

---

## 2025 Failure Analysis

The redesign was motivated by a structural failure and a failure to pass the maneuverability test during competition. The images below document the failure mode that informed the 2026 redesign.

### System-Level View

![Car 92 rear suspension after failure](/assets/bajasae_92failedsides.jpg)
*Car #92 at the 2025 competition following A-arm failure. The collapsed lower control arm geometry is visible, with the suspension being significantly compressed from its proper position, a direct consequence of the weld joint fracture shown below.*

### Fracture Detail

![Failed A-arm weld joint close-up](/assets/bajasae_92failedarm.jpg)
*Close-up of the fractured weld joint at the A-arm tube junction. The failure focused the redesign on weld access, heat-affected regions, and a control-arm geometry that could be jigged and manufactured more consistently.*

The redesign combined a transition from aluminum to 4130 Chromoly Steel with revised tab geometry and a simpler control-arm layout. I eliminated tube bends and halved weld-related heat-affected regions to simplify fabrication and improve weld access.

---

## Design Requirements & Constraints

### 1. Structural Reliability
Reduce control-arm deformation while improving the load path around the shock mounts and welds. Relocating the shock mounts to the upper control arms contributed to a **40% reduction in FEA-predicted deformation**.

### 2. Kinematic Optimization
Focus on precision handling by achieving the following metrics:
* **Steering Geometry:** Replace **40% Ackermann** with **20% anti-Ackermann** and incorporate passive rear steer, reducing the **inside turning radius from 9 ft to 2 ft**.
* **Bump Steer:** Maintain **<0.05°** throughout full travel to prevent unintended steering inputs.
* **Handling & Traction:** Revise roll-center geometry, roll stiffness, and anti-squat, supported by MATLAB suspension-kinematics and damping models.

### 3. Weight Management
Reduce mass alongside the structural and manufacturing changes. Tube wall thickness decreased from **0.085 in to 0.049 in**, helping reduce weight by **approximately 0.8 lb per control arm**.

---

## Engineering Process

### 1. Kinematic Modeling & Simulation

Using **MATLAB** suspension-kinematics and damping models alongside **SolidWorks Layout Sketches**, I evaluated mounting points, motion ratio, and damping selection. The steering redesign replaced **40% Ackermann with 20% anti-Ackermann** and incorporated **passive rear steer**, reducing the **inside turning radius from 9 ft to 2 ft**. Revisions to roll-center geometry, roll stiffness, and anti-squat also improved cornering and acceleration traction.

### Kinematic Synthesis

![Suspension Geometry Analysis](/assets/suspension_geometry.jpg)
*Instant Center layout. The geometry ensures the Roll Center remains stable relative to the Center of Gravity during body roll, promoting predictable handling. Their relative points were tested throughout the entire suspension range to make sure they did not cross over.*

### 2. FEA & Validation

I performed Finite Element Analysis on the A-arms and chassis tabs, simulating a "Worst-Case" scenario involving 400 lbf of braking load, 400 lbf of steering load, and 1200 lbf coming from the wheel load.

- **Result:** Relocated the shock mounts to the upper control arms and reduced tube wall thickness from **0.085 to 0.049 in**, reducing **FEA-predicted deformation by 40%** and weight by **approximately 0.8 lb per control arm**. Eliminating tube bends and halving weld-related heat-affected regions also improved manufacturability and weld access.

### FEA Validation

![Suspension Geometry Analysis](/assets/FEA.png)
*Sample FEA of the front left upper control arm, used to evaluate the revised shock-mount load path and structural response.*

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
*Completed front left corner showing the AFCO 63 coilover, uprights, and A-arm geometry as assembled.*

The finished corner, fitted with the **AFCO 63 coilover** with adjustable rebound, confirmed that the jig process translated the kinematic design into hardware. The geometry matched design targets within tolerance, connecting the MATLAB motion-ratio and damping models to the assembled suspension.

### 4. Precision Manufacturing

To ensure the simulation matched reality, I designed a custom welding jig for the control arms. I personally performed the manual machining for the bushings, holding tolerances of **±0.0005"** on a manual lathe to eliminate slop in the suspension joints.

### High-Precision Fabrication

<video width="100%" controls>
  <source src="/assets/4%20jaw%20chuck.mp4" type="video/mp4">
</video>

*Dialing in a 4-jaw chuck to ensure concentricity for custom suspension and steering bushings.*

![Bushing Finish](/assets/lathebushing.jpg)
*Finished bronze bushings held to a 0.0005" tolerance for a press-fit assembly.*

### 5. Vehicle-Level Integration

![Baja SAE vehicle assembled in the workshop with exposed suspension, coilovers, and drivetrain](/assets/bajasae_VD.jpg)
*Workshop assembly view with the body panels removed, showing the control arms, AFCO coilovers, and suspension packaging within the chassis.*

This stage brought the individually jigged suspension corners into the full vehicle assembly. With the body panels removed, the relationship between the control arms, shock mounts, and surrounding chassis is visible, connecting the hardpoint layout and fabrication process to the finished hardware. The completed car at the top of this page shows the next step: the same vehicle packaged with its bodywork at the competition paddock.

---

## Results & Impact

- **Integration:** Brought the redesigned suspension from kinematic layouts and individually jigged corners into the assembled Baja SAE vehicle.
- **Mass & Structural Response:** Reduced weight by **approximately 0.8 lb per control arm** and **FEA-predicted deformation by 40%**.
- **Manufacturability:** Reduced tube wall thickness from **0.085 to 0.049 in**, eliminated tube bends, and halved weld-related heat-affected regions.
- **Agility:** Reduced **inside turning radius from 9 ft to 2 ft** with **20% anti-Ackermann** geometry and passive rear steer.
- **Competition:** Contributed to **9th overall in dynamic events**, an acceleration improvement from **40th to 18th**, and **18th in hill climb**.
- **Leadership:** Coordinated a **12-member team**, design reviews, FEA, and fabrication schedules across steering, suspension, and braking.

---

## Gallery

### Full Assembly Integration

![Full Assembly Model](/assets/FullAssembly2526.jpg)
*The integrated 2026 chassis model. Body panels are omitted to show suspension packaging and steering rack clearance.*

### Competition

![Car 92 at Competition](/assets/bajasae_92.jpg)
*Car #92 competing in the endurance race course at competition.*
