---
layout: project
title: Baja SAE Vehicle Dynamics
category_label: Stony Brook Motorsports · Vehicle dynamics
description: "I lead the steering, suspension, and braking group for Stony Brook's Baja SAE car, from MATLAB kinematic modeling and FEA through jigged fabrication and competition. This included a control arm redesign that is 0.8 lb lighter with 40% less predicted deformation, and a reduction in turning radius from 9 ft to 2 ft."
role: "Vehicle Dynamics Lead (Jun 2025 – present) · previously Steering Lead & Secretary"
timeline: "Aug 2023 – Present"
team: "12-member steering, suspension & brakes group"
tags: [SolidWorks, MATLAB, Suspension Kinematics, Steering Geometry, FEA, Weldment Design, Jig Design, Manual Machining, Composites, Team Leadership]
hero_image: /assets/bajasae_finalimage.jpg
hero_alt: Completed Stony Brook Motorsports Baja SAE car with its suspension assembled at the competition paddock.
hero_caption: "The completed car at the competition paddock, with the suspension, steering, and fabrication work described below assembled on the car."
related:
  - title: "Shock dynamometer"
    url: /projects/shockdyno.html
---

## Overview

I joined Stony Brook Motorsports in 2023 and have worked on the car's chassis systems every season since. I started as the Steering Subsystem Lead and team Secretary, and since June 2025 I have been the Vehicle Dynamics Lead. I now lead a 12-member group that is responsible for the steering, suspension, and brakes. This involves coordinating design reviews, FEA, purchasing, and fabrication schedules so that all three systems are finished and on the car by the end of the academic year.

<div class="metric-grid">
  <div class="metric"><strong>9 ft → 2 ft</strong><span>inside turning radius, with 20% anti-Ackermann and passive rear steer</span></div>
  <div class="metric"><strong>−0.8 lb</strong><span>per control arm, with 40% less FEA-predicted deformation</span></div>
  <div class="metric"><strong>9th</strong><span>overall in dynamic events (team result)</span></div>
  <div class="metric"><strong>40th → 18th</strong><span>acceleration placing, plus 18th in hill climb</span></div>
</div>

The 2025–26 car shows the full design process the best. The work started from a failure at competition and went through modeling the fix, checking it with FEA, building it accurately, and then testing the result at competition.

---

## 2025 control arm failure

At the 2025 competition, a lower control arm fractured at a weld joint, and the car also had trouble in the maneuverability event. These two problems became the main goals for the next design.

![Car 92 rear suspension after failure](/assets/bajasae_92failedsides.jpg)
*Car #92 at the 2025 competition after the A-arm failure. The corner has collapsed below its normal ride height.*

![Failed A-arm weld joint close-up](/assets/bajasae_92failedarm.jpg)
*The fractured weld joint at the tube junction. This failure is why the redesign focused on the load path, weld access, and reducing the number of heat-affected regions.*

The redesign changed the material from aluminum to 4130 chromoly, revised the tab geometry, and simplified the arm layout so it could be jigged and welded consistently.

---

## Suspension kinematics in MATLAB

So that geometry decisions could be based on numbers, I wrote a 3D double-wishbone kinematic solver in MATLAB for the front and rear corners. It moves the wheel from 5 in of droop to 10 in of bump over 400 steps and reports the camber, toe (bump steer), caster, kingpin inclination, and front-view roll center through the travel.

At each step, the solver:

1. Rotates the lower arm about its inner pivot axis using Rodrigues' formula.
2. Closes the upper arm with `fzero` using the fixed upright length, starting from the previous step's solution.
3. Orients the upright from its kingpin axis, then solves for the steering rotation that keeps the outer tie-rod point at the tie-rod length from its inner point. The resulting change in toe is the bump steer.
4. Calculates the camber, toe, caster, and KPI from the wheel normal, the wheel's forward vector, and the kingpin projections.

I also built a bounded optimizer (`fmincon`) on top of the solver to choose the outer tie-rod location, with limits for each axis set in a configuration block. On the rear, the inner tie-rod point slides along an actual frame member, which is defined from the CAD including its 1.205 in tab offset. This way the optimizer can only suggest positions that can actually be built. The cost function weights bump steer in compression five times more than in droop and adds a soft penalty past a droop limit, since this is closer to how the car is actually loaded.

Before trusting the solver's results, I reviewed it line by line and made a few corrections:

- My first roll center calculation used a midline shortcut that is only correct when the arms are parallel and equal in length. I replaced it with the standard front-view instant center method, which draws a line from the contact patch through the instant center to the vehicle centerline.
- Bump steer is now measured relative to the toe at ride height, instead of relative to whichever sample had the smallest toe.
- The optimizer now runs before the main solve, so the results are never calculated from outdated geometry.

![Suspension Geometry Analysis](/assets/suspension_geometry.jpg)
*Instant center layout used to check that the roll center stays in a reasonable position relative to the center of gravity through the suspension travel.*

The same models were also used to choose the motion ratio, roll center height, roll stiffness, and anti-squat. The anti-squat in particular helped the rear put power down without hopping, which contributed to the team improving from 40th to 18th in acceleration.

---

## Steering

In 2023–24, as Steering Lead, I redesigned the steering rack and column in SolidWorks. This increased the steering range of motion by about 10% and fixed a problem where the system bent and locked up at full lock. I chose the tie-rod mounting locations and angles to reduce bump steer and checked the transmission angle to keep a good steering feel. I also machined the tie rods and rod ends myself on the mill and lathe, and documented the feeds and speeds from test cuts so other team members could repeat them.

In 2025–26, as Vehicle Dynamics Lead, I focused on making the car turn tighter. Baja courses have a lot of tight, slow turns on loose dirt, where the heavily loaded outside front tire does most of the work. The previous car used 40% Ackermann. We replaced this with 20% anti-Ackermann, which steers the outside wheel relatively more so it can use more of that tire's grip. We also added passive rear steer through the rear toe-link geometry in roll. As a result, the inside turning radius dropped from 9 ft to 2 ft.

---

## Control arm redesign

The 2025–26 control arms were redesigned around a better load path instead of simply using a heavier tube. The main changes were:

- The shock mount was moved to the upper control arm, which shortens the path from the wheel load to the shock and reduces the bending moment in the arm.
- The wall thickness was reduced from 0.085 in to 0.049 in, which the improved load path made possible.
- The tube bends were removed and replaced with straight members.
- The number of heat-affected regions from welding was cut in half, from eight to four, and weld access was improved.

The FEA used a worst-case load combining 400 lbf of braking, 400 lbf of steering, and 1200 lbf of vertical wheel load. The redesigned arm is about 0.8 lb lighter per arm and has 40% lower predicted deformation.

![Control arm FEA](/assets/FEA.png)
*FEA of the front-left upper control arm, used to evaluate the new shock mount load path.*

---

## Jigging and machining

The kinematic design is only useful if the built parts match it. Tolerances add up quickly with plasma-cut tabs and hand-fitted tubes, so I designed and built an adjustable aluminum plate jig. The jig lets the parts be positioned relative to each other until the target geometry is reached, so the final geometry does not depend on any single part being perfect.

![Height Gauge Setup](/assets/bajasae_heightgauge.jpg)
*Setting the datum with a Mitutoyo height gauge reading 8.8770 in below the floor-plane tube.*

The global reference was set with a Mitutoyo height gauge at 8.8770 in below the floor-plane tube, corrected by half of the 1.25 in tube diameter to get to the tube centerline. This dimension matches the designed loaded ride height of about 10 in, so the hardpoints were set at the same point in the travel that the kinematics were calculated for.

![Lower Control Arm Jigging](/assets/bajasae_lowercontrolarm.jpg)
*Lower control arm tacked on the jig and clamped before the upper arm is set.*

With the lower arm tacked in place as the reference, the upper arm was adjusted until 2° of static camber and 8° of caster were confirmed. The hardpoints were held within ±0.1 in and checked against the kinematic drawings before the final welding.

![Front Left Suspension Assembly](/assets/bajasae_frontleftsuspension_setup.jpg)
*Completed front-left corner with the AFCO 63 coilover, upright, and A-arms.*

I turned the suspension and steering bushings on a manual lathe to ±0.0005 in for a press fit with no play in the joints, using a 4-jaw chuck dialed in for concentricity.

<video controls muted playsinline preload="metadata">
  <source src="{{ '/assets/4%20jaw%20chuck.mp4' | relative_url }}#t=0.1" type="video/mp4">
</video>

*Dialing in a 4-jaw chuck to keep the bushings concentric.*

![Bushing Finish](/assets/lathebushing.jpg)
*Finished bronze bushings held to 0.0005 in for press-fit assembly.*

![Baja SAE vehicle assembled in the workshop](/assets/bajasae_VD.jpg)
*The car in the workshop with the body panels off, showing the arms, AFCO coilovers, and suspension packaging in the chassis.*

---

## Brake bias variation

The braking system had roughly 40% variation in brake bias between applications. Instead of just adjusting the bias bar, we added pressure measurements to the hydraulic circuit and found that a major cause was the pedal assembly twisting under load. The fix was a revised master cylinder mounting, which was checked with FEA and had factors of safety between 1.2 and 2.6 across its components.

---

## Carbon fiber seat

I also made a custom carbon fiber and epoxy seat from a mold we built for it. I used double-fold vacuum bagging to remove trapped air, which gave a stiffer part without voids.

---

## Summary

- Lead a 12-member steering, suspension, and brakes group through design reviews, FEA, purchasing, and fabrication scheduling.
- Built a MATLAB double-wishbone solver and a constrained bump-steer optimizer, then reviewed the solver and corrected its roll center method.
- Reduced the inside turning radius from 9 ft to 2 ft using 20% anti-Ackermann and passive rear steer.
- Redesigned the control arms to be about 0.8 lb lighter each with 40% less predicted deformation, using a thinner wall, no bends, and half as many heat-affected regions.
- Built an adjustable jig that held the hardpoints to ±0.1 in, and machined bushings to ±0.0005 in.
- Team competition results: top 25 at Williamsport (2024), then 9th overall in dynamic events, an improvement from 40th to 18th in acceleration, and 18th in hill climb.

---

## Gallery

![Full Assembly Model](/assets/FullAssembly2526.jpg)
*The full 2025–26 chassis model, with the body panels hidden to show the suspension packaging and steering clearance.*

![Car 92 at Competition](/assets/bajasae_92.jpg)
*Car #92 on the endurance course.*
