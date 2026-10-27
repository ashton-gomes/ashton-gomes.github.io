---
layout: project
title: Baja SAE Vehicle Dynamics
category_label: Stony Brook Motorsports · Vehicle dynamics
description: "I lead the steering, suspension, and braking group for Stony Brook's Baja SAE car. The work runs from kinematic and ride simulation in MATLAB and Python, through FEA and jigged fabrication, to testing and competition. It included a control arm redesign that is 0.8 lb lighter with 40% less predicted deformation, and a reduction in turning radius from 9 ft to 2 ft."
role: "Vehicle Dynamics Lead (Jun 2025 – present) · previously Steering Lead & Secretary"
timeline: "Aug 2023 – Present"
team: "12-member steering, suspension & brakes group"
tags: [SolidWorks, MATLAB, Python, NumPy / SciPy, Suspension Kinematics, Quarter-Car Modeling, Damping Optimization, Steering Geometry, FEA, Weldment Design, Jig Design, Manual Machining, Composites, Team Leadership]
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

The 2025–26 car shows the full design process the best. The work started from a failure at competition and went through modeling the fix, checking it with FEA, building it accurately, and then testing the result. Most of the design decisions on this page came out of the same set of simulation tools, which take the suspension hardpoints from CAD and carry them through to spring rates and damper targets:

<ul class="pipeline">
  <li>CAD hardpoints</li>
  <li>Linkage kinematics</li>
  <li>Motion ratio & shock mount</li>
  <li>Springs & ride frequency</li>
  <li>Quarter-car damping</li>
  <li>FEA & fabrication</li>
  <li>Dyno & track testing</li>
</ul>

---

## 2025 control arm failure

At the 2025 competition, a lower control arm fractured at a weld joint, and the car also had trouble in the maneuverability event. These two problems became the main goals for the next design.

![Car 92 rear suspension after failure](/assets/bajasae_92failedsides.jpg)
*Car #92 at the 2025 competition after the A-arm failure. The corner has collapsed below its normal ride height.*

![Failed A-arm weld joint close-up](/assets/bajasae_92failedarm.jpg)
*The fractured weld joint at the tube junction. This failure is why the redesign focused on the load path, weld access, and reducing the number of heat-affected regions.*

The redesign changed the material from aluminum to 4130 chromoly, revised the tab geometry, and simplified the arm layout so it could be jigged and welded consistently. Moving the shock mount was also part of the redesign, which meant the motion ratio, spring rates, and damping all had to be worked out again from the new geometry.

---

## Suspension kinematics in MATLAB

So that geometry decisions could be based on numbers, I first wrote a 3D double-wishbone kinematic solver in MATLAB for the front and rear corners. It moves the wheel from 5 in of droop to 10 in of bump over 400 steps and reports the camber, toe (bump steer), caster, kingpin inclination, and front-view roll center through the travel.

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

---

## Python suspension model

The MATLAB solver was good for placing hardpoints, but the spring and damping calculations were still in a separate notebook that used a constant, hand-entered motion ratio. To connect the two, I built a Python model of both corners that takes the current CAD hardpoints and uses them for everything downstream. A single parameter file holds the hardpoints, shock eye locations, corner weights, and targets, and every calculator reads the motion ratio and travel limits from the same installation module, so the spring, ride frequency, travel, and damping results cannot disagree with each other.

### Linkage solver

Each corner is modeled as a rigid upright held by five links: the two legs of the upper arm, the two legs of the lower arm, and the tie rod or toe link. For a commanded wheel-center height, the solver finds the upright position and rotation that keeps all five link lengths fixed, using a least-squares solve. It steps outward from ride height in 0.05 in increments, starting each step from the previous solution, so it stays on the same assembly branch the whole way. The shock is attached to the upper arm, and the sweep stops where the shock reaches its 14.68 in or 23.68 in eye-to-eye limit. This gives 3.4 in of droop and 9.3 in of bump at the front.

Every sweep is checked afterwards for link lengths, fixed pivots, rigid upright distances, and return to the reference pose. The largest closure error is about 4 × 10⁻¹³ in.

<figure class="figure-single">
  <video controls muted loop playsinline preload="metadata" poster="{{ '/assets/baja_corner_motion_poster.jpg' | relative_url }}" aria-label="Animated front suspension corner moving from ride height to full bump, full droop, and back, with camber and motion ratio plots tracking the travel">
    <source src="{{ '/assets/baja_corner_motion.mp4' | relative_url }}" type="video/mp4">
  </video>
  <figcaption>Front corner solved from the CAD hardpoints and moved through its full travel. Blue is the upper arm, orange the lower arm, purple the tie rod, green the upright, and yellow the shock. The plots on the right follow the camber and motion ratio at the current position.</figcaption>
</figure>

The model also has an interactive OpenGL viewer, where both corners can be rotated, scrubbed through travel with a slider, and compared against live kinematic curves. This was useful for catching setup errors that are easy to miss in a table. For example, the shock eye coordinates come from a CAD frame with different axes than the suspension points, and until the two origins were aligned correctly the shocks extended in bump instead of compressing.

<figure class="figure-single">
  <img src="{{ '/assets/baja_kinematic_curves.png' | relative_url }}" alt="Four plots against wheel-center travel for front and rear: camber falling from about +1 to -9 degrees front and -1 to -8 degrees rear, bump steer within about ±0.25 degrees front and up to 1.3 degrees rear in droop, steering-axis inclination rising with bump, and wheel-center lateral shift under 1.4 inches." loading="lazy" decoding="async">
  <figcaption>Kinematic curves from the current hardpoints. The front gains 0.7–0.9° of negative camber per inch of bump and keeps bump steer within ±0.25° over the full 12.7 in of travel. The rear toe link gives about 1.3° of toe change at full droop, which is the next thing I would like to reduce.</figcaption>
</figure>

### Motion ratio and shock mounting

Running the CAD geometry through the solver showed that the motion ratios in the old spring calculations were wrong. The notebook used 0.625 front and 0.600 rear, but the solved ratio at ride height is 0.668 front and 0.642 rear. Since wheel rate scales with the motion ratio squared, the old values understated the wheel rate by about 14% at each end. The ratio also rises through bump, to 0.795 at the front at full bump, so the wheel rate at full bump is about 40% higher than at ride height. A single constant motion ratio hides this, so the wheel rate calculation now includes the rising-rate term, $$K_w = K_s\,MR^2 + (W_s/MR)\,\tfrac{dMR}{dx}$$.

<figure class="figure-single">
  <img src="{{ '/assets/baja_motion_ratio.png' | relative_url }}" alt="Left: shock compression against wheel-center travel for front and rear, both close to linear. Right: local motion ratio rising from about 0.64 to 0.80 at the front and 0.64 to 0.69 at the rear, with averages of 0.707 and 0.658." loading="lazy" decoding="async">
  <figcaption>Shock compression and local motion ratio through travel. The front ratio rises much more than the rear, so the front suspension gets noticeably stiffer as it approaches full bump.</figcaption>
</figure>

Because the shock mount was being moved anyway, I made the shock eye position a variable. In the model, the eye can slide along a line on the upper arm, and the solver can either take a position and report the resulting motion ratio, or take a target motion ratio and find the position that gives it (using Brent's method). This turned the mount location into a design trade that could be read directly from a plot. Moving the eye outboard raises the motion ratio by about 0.045 per inch at the front, which allows a softer spring for the same ride frequency. However, it also uses up droop travel before the shock tops out.

<figure class="figure-single">
  <img src="{{ '/assets/baja_mount_scan.png' | relative_url }}" alt="Three plots against shock eye offset along the arm: motion ratio rising from about 0.45 to 0.79, droop travel to the shock stop falling from about 9 inches to 1 inch, and the spring rate needed for the target ride frequency falling from about 270 to 60 lbf/in." loading="lazy" decoding="async">
  <figcaption>Effect of sliding the shock eye along the upper arm. The CAD position (offset 0) leaves 3.4 in of droop at the front while keeping the required spring rate under 100 lbf/in.</figcaption>
</figure>

### Spring rates and ride frequency

The spring calculations start from target ride frequencies of 1.65 Hz front and 1.815 Hz rear. The earlier calculation treated the target as a wheel-only frequency, but the tire acts as a second spring in series with the suspension, so the actual ride rate is $$K_R = K_W K_T / (K_W + K_T)$$. Including the tire, the springs needed for the targets are 83 lbf/in front and 132 lbf/in rear.

Checking the springs that were installed on the car against this gave 1.80 Hz front and 1.73 Hz rear. The model also showed that with these springs the car could not settle down to its CAD ride height even with no preload, and would sit about 0.8 in high at the front and 1.6 in high at the rear. This is the kind of result that is hard to see from separate hand calculations, since it depends on the motion ratio, spring rate, shock length, and corner weight all at once.

---

## Damping: quarter-car model and optimization

To choose damper settings, I modeled each corner as a two-mass quarter car. The sprung mass (117 lb at the front) is connected to the unsprung mass (33 lb) by the spring and damper, and the unsprung mass is connected to the road by the tire:

$$m_s\,\ddot z_s = -F_{susp}, \qquad m_u\,\ddot z_u = F_{susp} + K_t\,(z_r - z_u), \qquad F_{susp} = K_w\,(z_s - z_u) + F_{damper}$$

The damper force uses a two-stage curve for compression and rebound, with a knee at 3 in/s shaft speed. Each of the four slopes is a fraction of critical damping, $$2\sqrt{K_w m_s}$$, converted to the shaft with the motion ratio. Since the damper curve changes slope and is different in compression and rebound, the equations have no closed-form solution. They are integrated in time with a fixed-step 4th-order Runge-Kutta method at 2 ms, and all candidate damper settings and road inputs are run together as one NumPy array, which keeps the search fast.

The model has two natural modes, body bounce at about 1.65 Hz and wheel hop at about 8.5 Hz front and 9.3 Hz rear. A damper has to control both, so the road inputs were chosen to excite each of them: a 1 in bump and a 1 in dip taken in 0.2 s, and 0.25 in rough roads at 0.8, 2, and 8 Hz.

<figure class="figure-single">
  <img src="{{ '/assets/baja_quarter_car_bump.png' | relative_url }}" alt="Body displacement after a 1 inch bump for front and rear corners. The baseline damping overshoots to about -0.33 inches front and -0.4 inches rear before settling; the optimized damping overshoots to only about -0.05 inches front and -0.18 inches rear." loading="lazy" decoding="async">
  <figcaption>Body response to a 1 in bump with the starting damper targets (dashed) and the optimized targets. The optimized front damping reduces settling time from 0.64 s to 0.42 s and removes most of the undershoot.</figcaption>
</figure>

To pick the damping ratios, an optimizer runs the quarter-car model for a few hundred candidate settings per axle. It first sweeps a single common ratio from 0.1 to 1.2, then adjusts the four branches one at a time in coarse and then fine steps. Each candidate is scored with a grip-weighted objective (70% RMS tire-load variation, 15% RMS body acceleration, 15% RMS suspension travel), normalized to the starting setup so a score of 1.0 means no change. Settings that run into the shock stops or unload the tire are penalized.

<figure class="figure-single">
  <img src="{{ '/assets/baja_damping_optimization.png' | relative_url }}" alt="Six-panel figure: common-ratio sweeps for front and rear with minimums near 0.4 to 0.5, tire load time histories on the 8 Hz road for baseline and optimized settings, and bar charts of tire-load variation by road input." loading="lazy" decoding="async">
  <figcaption>Optimizer output. Left: score against a single common damping ratio. Middle: tire load on the 8 Hz road. Right: tire-load variation for each road input, with a 7.6% mean reduction at the rear and 1.4% at the front.</figcaption>
</figure>

The result has the same overall pattern at both ends: high low-speed damping (about 0.7–0.85 of critical) to control the body, and low high-speed damping (0.13–0.28) so the wheel can follow sharp inputs. At the rear, the lowest predicted tire load across all of the road tests rose from 42 lbf to 71 lbf. The front improvement in tire load was small, and most of the front gain came from faster settling. The optimized settings are then converted into force-velocity targets for each damper.

<figure class="figure-single">
  <img src="{{ '/assets/baja_damping_curves.png' | relative_url }}" alt="Damper force against shaft velocity for front and rear compression and rebound, with a knee at 3 inches per second, dotted baseline curves, and a force table from 0 to 9 inches per second." loading="lazy" decoding="async">
  <figcaption>Target damper curves from the optimizer, with the starting targets dotted. These are the curves the shock dynamometer measurements are compared against when choosing a valving setup.</figcaption>
</figure>

### Checking the simulation

Since the optimizer only reports the best result for its own model, I checked the model separately before using it:

- The RK4 integrator was compared against an independently written adaptive ODE solver on all five road inputs, and the tire forces agreed within about 0.01 lbf. Halving the time step changed the results by less than 0.001%.
- A separate differential-evolution search over the same bounds landed within about 0.1% of the coordinate search's score, so the search does not seem to be stuck in a poor local minimum.
- The motion ratio code was tested on a simple synthetic linkage where the answers can be worked out by hand, and matched them to 6–9 decimal places. The wheel rate was also checked with a spring-energy calculation that does not use the motion ratio code.

The main limitation is the tire. Its vertical stiffness of 200 lbf/in is an estimate, since the manufacturer does not publish it, and the damping results are sensitive to it. The model also leaves out roll, pitch, and bump-stop contact. For these reasons I use it to compare damper settings against each other, and not to predict absolute grip.

---

## Steering

In 2023–24, as Steering Lead, I redesigned the steering rack and column in SolidWorks. This increased the steering range of motion by about 10% and fixed a problem where the system bent and locked up at full lock. I chose the tie-rod mounting locations and angles to reduce bump steer and checked the transmission angle to keep a good steering feel. I also machined the tie rods and rod ends myself on the mill and lathe, and documented the feeds and speeds from test cuts so other team members could repeat them.

In 2025–26, as Vehicle Dynamics Lead, I focused on making the car turn tighter. Baja courses have a lot of tight, slow turns on loose dirt, where the heavily loaded outside front tire does most of the work. The previous car used 40% Ackermann. We replaced this with 20% anti-Ackermann, which steers the outside wheel relatively more so it can use more of that tire's grip. We also added passive rear steer through the rear toe-link geometry in roll. As a result, the inside turning radius dropped from 9 ft to 2 ft.

---

## Control arm redesign

The 2025–26 control arms were redesigned around a better load path instead of simply using a heavier tube. The main changes were:

- The shock mount was moved to the upper control arm, which shortens the path from the wheel load to the shock and reduces the bending moment in the arm. Its exact position along the arm was chosen with the shock mount trade study above.
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

With the lower arm tacked in place as the reference, the upper arm was adjusted until 2° of static camber and 8° of caster were confirmed. These are the same reference values the kinematic model is built around. The hardpoints were held within ±0.1 in and checked against the kinematic drawings before the final welding.

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

## Testing and next steps

The simulation results are only as good as their inputs, so the next steps are about replacing estimates with measurements:

- The team logged rear shock position on the car with linear potentiometers. Differentiating this data gives shaft velocities and estimated shock loads, which were used to set the design load for the [shock dynamometer]({{ '/projects/shockdyno.html' | relative_url }}).
- The dyno's first test of the stock AFCO shocks showed they are lightly damped in all four regions. The optimized curves above give the target to revalve toward.
- Measuring the tire's vertical stiffness at operating pressure would remove the largest uncertainty in the damping model.
- Changing the springs to the calculated rates, or adjusting the preload, would bring the car down to its design ride height so it runs at the point in the travel the kinematics were designed for.

---

## Summary

- Lead a 12-member steering, suspension, and brakes group through design reviews, FEA, purchasing, and fabrication scheduling.
- Built a MATLAB double-wishbone solver and a constrained bump-steer optimizer, then reviewed the solver and corrected its roll center method.
- Built a Python suspension model that solves both corners from the CAD hardpoints and feeds the motion ratio, travel limits, spring rates, and ride frequencies from one source. This found that the old motion ratios understated the wheel rate by about 14%.
- Made the shock mount position a design variable that can be solved for a target motion ratio, and used it to trade motion ratio against droop travel and spring rate.
- Wrote a two-mass quarter-car model and damping optimizer that produced target damper curves, checked against an independent ODE solver and a second optimizer.
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
