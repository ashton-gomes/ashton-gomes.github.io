---
layout: project
title: Baja SAE Vehicle Dynamics
category_label: Stony Brook Motorsports · Vehicle dynamics
description: "Leading the steering, suspension, and braking group for Stony Brook's Baja SAE car: from MATLAB kinematic modeling and FEA through jigged fabrication and competition, including a control arm 0.8 lb lighter with 40% less predicted deformation and a turning radius cut from 9 ft to 2 ft."
role: "Vehicle Dynamics Lead (Jun 2025 – present) · previously Steering Lead & Secretary"
timeline: "Aug 2023 – Present"
team: "12-member steering, suspension & brakes group"
tags: [SolidWorks, MATLAB, Suspension Kinematics, Steering Geometry, FEA, Weldment Design, Jig Design, Manual Machining, Composites, Team Leadership]
hero_image: /assets/bajasae_finalimage.jpg
hero_alt: Completed Stony Brook Motorsports Baja SAE car with its suspension assembled at the competition paddock.
hero_caption: "The completed car at the competition paddock, bringing the suspension geometry, steering packaging, and fabrication work below together into one system."
related:
  - title: "Shock dynamometer"
    url: /projects/shockdyno.html
---

## Overview

I joined Stony Brook Motorsports in 2023 and have worked on the car's chassis-side systems every season since: first as **Steering Subsystem Lead** and team **Secretary**, and since June 2025 as **Vehicle Dynamics Lead**. I now lead a **12-member group** responsible for steering, suspension, and brakes. That means coordinating design reviews, FEA, purchasing, and fabrication schedules so all three systems are finished and on the car by the end of the academic year.

<div class="metric-grid">
  <div class="metric"><strong>9 ft → 2 ft</strong><span>inside turning radius, with 20% anti-Ackermann and passive rear steer</span></div>
  <div class="metric"><strong>−0.8 lb</strong><span>per control arm, with 40% less FEA-predicted deformation</span></div>
  <div class="metric"><strong>9th</strong><span>overall in dynamic events (team result)</span></div>
  <div class="metric"><strong>40th → 18th</strong><span>acceleration placing, plus 18th in hill climb</span></div>
</div>

The 2025–26 car is the clearest example of the full cycle: learning from a competition failure, modeling the fix, validating it structurally, building it accurately, and seeing the result on track.

---

## Learning from the 2025 failure

At the 2025 competition, a lower control arm fractured at a weld joint and the car also struggled with the maneuverability event. Both became the brief for the next design.

![Car 92 rear suspension after failure](/assets/bajasae_92failedsides.jpg)
*Car #92 at the 2025 competition after the A-arm failure, with the corner visibly collapsed from its proper ride position.*

![Failed A-arm weld joint close-up](/assets/bajasae_92failedarm.jpg)
*The fractured weld joint at the tube junction. It focused the redesign on load path, weld access, and fewer heat-affected regions.*

The redesign moved from aluminum to **4130 chromoly**, revised the tab geometry, and simplified the arm layout so it could be jigged and welded consistently.

---

## Suspension kinematics in MATLAB

To make geometry decisions with numbers instead of intuition, I wrote a **3D double-wishbone kinematic solver** in MATLAB for the front and rear corners. It sweeps the wheel from 5 in of droop to 10 in of bump over 400 steps and reports **camber, toe (bump steer), caster, kingpin inclination, and front-view roll centre** through travel.

**How it solves each step:**

1. Rotate the lower arm about its inner pivot axis with Rodrigues' formula.
2. Close the upper arm with `fzero` on the fixed upright length, warm-started from the previous step.
3. Orient the upright from its kingpin axis, then solve the steering twist so the outer tie-rod point stays at the tie-rod length from its inner point. The resulting toe change is the bump steer.
4. Extract camber, toe, caster, and KPI from the wheel normal, wheel-forward vector, and kingpin projections.

**Bump-steer optimizer.** On top of the solver I built a bounded optimizer (`fmincon`) for the outer tie-rod location, with per-axis limits set in a configuration block. On the rear, the inner tie-rod point slides along a real frame member, parameterized from the CAD including its 1.205 in tab offset, so the optimizer can only propose positions that can actually be built. The cost function weights compression-side bump steer **five times** more than droop and adds a soft penalty past a droop limit, matching how the car is actually loaded.

**Auditing my own tool.** A line-by-line methodology review of the solver turned up improvements I made before trusting its output:

- My first roll-centre calculation used a midline shortcut that is only correct for parallel, equal-length arms. I replaced it with the standard front-view **instant-centre construction**, a line from the contact patch through the instant centre to the vehicle centreline.
- Bump steer is now referenced to toe at **ride height** rather than to whichever sample happened to have the smallest toe.
- The optimizer runs before the main solve, so results are never computed from stale geometry.

![Suspension Geometry Analysis](/assets/suspension_geometry.jpg)
*Instant-centre layout used to check that the roll centre stays well behaved relative to the centre of gravity through travel.*

The same models also guided **motion ratio, roll-centre height, roll stiffness, and anti-squat** choices. Anti-squat in particular helped the rear put power down without hopping, which contributed to the team's jump from 40th to 18th in acceleration.

---

## Steering: two generations

**2023–24, as Steering Lead.** I redesigned the steering rack and column in SolidWorks, increasing steering range of motion by about **10%** while removing a bending and lock-out problem at full lock. I set tie-rod mounting locations and angles to reduce bump steer, checked transmission angle to keep steering feel, and machined the tie rods and rod ends myself on the mill and lathe, documenting feeds and speeds from trial cuts so teammates could repeat them.

**2025–26, as Vehicle Dynamics Lead.** Baja courses reward tight, slow turns on loose dirt, where the heavily loaded outside front tire does most of the work. The previous car used **40% Ackermann**. We replaced it with **20% anti-Ackermann**, which steers the outside wheel relatively more to use that tire's grip, and added **passive rear steer** through the rear toe-link geometry in roll. The inside turning radius dropped from **9 ft to 2 ft**.

---

## Control-arm redesign

The 2025–26 control arms were rebuilt around a better load path rather than simply a heavier tube:

- **Moved the shock mount to the upper control arm**, shortening the path from wheel load to shock and reducing the bending moment carried by the arm.
- **Reduced wall thickness from 0.085 in to 0.049 in**, which the improved load path made possible.
- **Removed tube bends** in favour of straight members.
- **Halved the weld-related heat-affected regions**, from eight to four, and improved weld access.

FEA covered a worst case combining 400 lbf braking, 400 lbf steering, and 1200 lbf vertical wheel load. The redesign came out **about 0.8 lb lighter per arm** with **40% lower predicted deformation**.

![Control arm FEA](/assets/FEA.png)
*FEA of the front-left upper control arm, used to evaluate the revised shock-mount load path.*

---

## Building it accurately: jigging and machining

Good kinematics on paper only matter if the hardware matches. Plasma-cut tabs and hand-fitted tube stack up tolerance quickly, so I designed and built an **adjustable aluminum plate jig**. It lets component positions be set *relative to each other* until the target geometry is reached, instead of relying on any single part being perfect.

![Height Gauge Setup](/assets/bajasae_heightgauge.jpg)
*Establishing the datum: a Mitutoyo height gauge reading 8.8770 in below the floor-plane tube.*

**Datum.** A Mitutoyo height gauge set **8.8770 in below the floor-plane tube**, corrected by half the 1.25 in tube diameter to the true centreline, as the global reference. That dimension corresponds to the designed **~10 in loaded ride height**, so the hardpoints were set at the same point in travel the kinematics were computed for.

![Lower Control Arm Jigging](/assets/bajasae_lowercontrolarm.jpg)
*Lower control arm tacked on the jig, clamped before the upper arm is set.*

**Geometry.** With the lower arm tacked as the fixed reference, the upper arm was adjusted until **2° static camber and 8° caster** were confirmed. Hardpoints were held **within ±0.1 in** and checked against the kinematic drawings before final welding.

![Front Left Suspension Assembly](/assets/bajasae_frontleftsuspension_setup.jpg)
*Completed front-left corner with the AFCO 63 coilover, upright, and A-arms.*

**Machining.** I turned the suspension and steering bushings on a manual lathe to **±0.0005 in** for a press fit with no joint slop, dialing in a 4-jaw chuck for concentricity.

<video controls muted playsinline preload="metadata">
  <source src="{{ '/assets/4%20jaw%20chuck.mp4' | relative_url }}#t=0.1" type="video/mp4">
</video>

*Dialing in a 4-jaw chuck for concentric bushings.*

![Bushing Finish](/assets/lathebushing.jpg)
*Finished bronze bushings held to 0.0005 in for press-fit assembly.*

![Baja SAE vehicle assembled in the workshop](/assets/bajasae_VD.jpg)
*Workshop integration with the body panels off, showing the arms, AFCO coilovers, and suspension packaging in the chassis.*

---

## Brakes: from symptom to cause

The braking system showed roughly **40% variation in brake bias** between applications. Rather than adjusting the bias bar and moving on, we instrumented the hydraulic circuit with pressure measurements and traced a major contributor to the **pedal assembly twisting** under load. The fix was revised master-cylinder packaging, checked with FEA at factors of safety between 1.2 and 2.6 across its components. It is a good example of chasing a system-level symptom down to a structural root cause.

---

## Composites: carbon-fiber seat

I also produced a custom **carbon-fiber and epoxy seat** from a purpose-made mold, using double-fold vacuum bagging to pull out trapped air for a stiffer, void-free part.

---

## Results

- **Leadership:** lead a 12-member steering, suspension, and brakes group through design reviews, FEA, purchasing, and fabrication scheduling.
- **Analysis tools:** built a MATLAB double-wishbone solver and constrained bump-steer optimizer, and audited and corrected its roll-centre method.
- **Agility:** inside turning radius reduced from **9 ft to 2 ft** with 20% anti-Ackermann and passive rear steer.
- **Structure:** control arms **~0.8 lb lighter** each with **40% less predicted deformation**, thinner wall, no bends, and half the heat-affected regions.
- **Fabrication:** adjustable jig holding hardpoints to ±0.1 in, and bushings machined to ±0.0005 in.
- **Competition (team results):** **Top 25 at Williamsport (2024)**, then **9th overall in dynamic events**, **40th → 18th in acceleration**, and **18th in hill climb**.

---

## Gallery

![Full Assembly Model](/assets/FullAssembly2526.jpg)
*The integrated 2025–26 chassis model, with body panels omitted to show suspension packaging and steering clearance.*

![Car 92 at Competition](/assets/bajasae_92.jpg)
*Car #92 on the endurance course.*
