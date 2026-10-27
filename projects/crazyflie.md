---
layout: project
title: Crazyflie Autonomous Arena Mission
category_label: Autonomy · Ongoing project
description: "A small Crazyflie quadrotor that takes off, crosses an unknown obstacle field, finds a raised landing pad using only a downward range sensor, maps the pad's edges, and lands on it. All of this uses onboard sensing, without external cameras or motion capture."
timeline: "Sep 2026 – Present"
tags: [Python, cflib, Crazyflie 2.x, Flow Deck v2, Multi-ranger, Multithreading, State Machines, Sensor Fusion]
hero_image: /assets/crazyflie_mission.svg
hero_alt: "Top-down mission diagram: start pad, detour around an obstacle, lawnmower search through the landing zone, and the landing pad."
hero_caption: "Mission outline (schematic). The drone crosses the obstacle field using range-based detours, sweeps the landing zone in a lawnmower pattern, maps the edges of the raised pad, and lands at its center."
related:
  - title: "Screw-motion planner (research)"
    url: /projects/motion-planner.html
---

## Overview

The goal of this project is a fully autonomous flight with no outside help. The Crazyflie carries a Flow deck v2, which has a downward optical flow sensor and a time-of-flight range sensor, and a Multi-ranger deck, which has range sensors facing front, back, left, right, and up. Using only these sensors, the drone has to:

1. take off from a start pad,
2. cross a field of obstacles it has not seen before,
3. find a 17 cm tall, 33 cm wide landing pad using only its downward range reading,
4. map the pad and land on it,
5. take off again and return to the start pad.

There is no external positioning system, so the drone only knows where it is from its own optical flow odometry.

<div class="metric-grid">
  <div class="metric"><strong>75 s</strong><span>takeoff to landing on the pad in my best flight</span></div>
  <div class="metric"><strong>5</strong><span>onboard range sensors, plus downward optical flow</span></div>
  <div class="metric"><strong>20 Hz</strong><span>sensor logging and setpoint loops</span></div>
  <div class="metric"><strong>8</strong><span>scan lines used to map the pad's edges</span></div>
</div>

---

## Software structure

I wrote the controller in Python using Bitcraze's `cflib` library and split it into three threads, so that slower decision-making does not hold up the sensor data or the flight commands:

- The log thread runs at 20 Hz and handles position tracking, range readings, the obstacle memory, and pad detection.
- The setpoint thread also runs at 20 Hz and sends commands continuously so the drone always has a target.
- The mission thread runs the overall sequence of taking off, crossing the field, searching, mapping, landing, and returning.

Positions are kept in a fixed arena frame. I zero the onboard estimator on the start pad and add the pad's offset in the position tracker. Two types of commands are used. Hover setpoints, which give a body velocity and an absolute height, are used for travel and searching. Position setpoints, which use the firmware's position hold, are used for takeoff, the final approach, and landing.

I also kept the decision logic separate from the radio interface. This let me test the mission offline against a simulated drone before flying it. The tests cover pad edge detection with spike rejection, coordinate frame rotations, choosing a clear side for detours, and limited recovery attempts when the optical flow quality drops.

One issue was holding height over the pad. The flow deck measures height above whatever surface is directly below it, and the pad surface is 17 cm higher than the floor. A simple height hold would make the drone climb 17 cm as it flies over the pad, so I subtract the pad height whenever the drone is over the pad.

---

## Obstacle avoidance

The drone flies forward at 0.2 m/s. When an obstacle is detected 0.20 m ahead, it stops and moves sideways at 0.18 m/s. It tries moving left first, then right, and then moves slightly closer and tries again, up to two more times. It only continues forward once the path is clear past 0.30 m plus 12 cm of clearance for the drone's body. The difference between the stopping distance and the clear distance is intentional, so the drone does not keep switching back and forth at the threshold. There is also a hard stop at 0.10 m.

Since the Multi-ranger only sees in four directions, an obstacle that moves out of view would otherwise be forgotten. To handle this, I store every reading under 0.8 m in a sparse obstacle memory with 3 cm resolution, ignoring readings from the arena walls. The clearance checks then use whichever is closer, the live sensor reading or any remembered points in a narrow corridor ahead. This keeps the drone from turning back into the corner of an obstacle it just passed.

---

## Finding and mapping the pad

The search uses a lawnmower sweep at 0.25 m/s with lines spaced 20 cm apart. Since the pad is 33 cm wide, any pass that reaches the pad will cross it. If the first sweep does not find it, a second sweep runs with the lines shifted by 10 cm.

When the drone flies over the pad, the downward range reading drops by 17 cm, but only for a short time, because the height controller corrects for it within about 0.3 s. A detection is counted when the reading is more than 10 cm below the floor reference for two samples in a row, and single-sample spikes are ignored.

To map the pad, the drone flies eight parallel scan lines spaced 8 cm apart. It finds the near edge on the way out and the far edge on the way back, and the pad center is taken as the midpoint between those edges. If fewer than two of the lines see the pad, the detection is treated as false and the search continues.

For landing, the drone moves to the estimated center in position hold, lowers its position gains to reduce swaying over the small target, descends at 0.10 m/s, and releases position hold below 12 cm.

---

## Flight results

In my best flight, the drone completed the full outbound part of the mission on its own. It took off from the start pad, detected the obstacle and moved around it, found the pad with the lawnmower search, mapped its edges, and landed on the pad at 75 s.

It then took off again and flew most of the return leg using the same avoidance logic. The flight logs showed that the return was limited by the battery and not by the navigation, which is what the next set of improvements focuses on.

---

## Current work and next steps

This project is still in progress, and I am working toward a reliable round trip that can be repeated. The planned changes are:

- Adding a low-voltage check that triggers a controlled landing, and planning the return leg based on the remaining battery.
- Using a narrower avoidance corridor, removing old obstacle points after some time, and rotating in place to scan before choosing which way to move around an obstacle.
- Making pad detection more reliable at higher search speeds, so the sweep can cover the landing zone faster.
- Using the measured arena dimensions in the code, making sure the return search loop always makes progress, and fixing a gap in sensor coverage during diagonal moves.
- Running a fixed set of flights and recording the landing accuracy and mission time for each one.
