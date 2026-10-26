---
layout: project
title: Crazyflie Autonomous Arena Mission
category_label: Autonomy · Ongoing project (MEC 569)
description: "A palm-sized Crazyflie quadrotor that takes off, crosses an unknown obstacle field, finds a raised landing pad using only a downward range sensor, maps its edges, and lands on it. Everything runs on onboard sensing, with no external cameras or motion capture."
timeline: "Sep 2026 – Present"
tags: [Python, cflib, Crazyflie 2.x, Flow Deck v2, Multi-ranger, Multithreading, State Machines, Sensor Fusion]
hero_image: /assets/crazyflie_mission.svg
hero_alt: "Top-down mission diagram: start pad, detour around an obstacle, lawnmower search through the landing zone, and the landing pad."
hero_caption: "Mission outline (schematic): cross the obstacle field with range-based detours, sweep the landing zone in a lawnmower pattern, map the raised pad's edges, and land at its centre."
related:
  - title: "Screw-motion planner (research)"
    url: /projects/motion-planner.html
---

## Overview

The goal is a fully autonomous flight with no outside help. A Crazyflie carrying a **Flow deck v2** (downward optical flow and time-of-flight range) and a **Multi-ranger deck** (front, back, left, right, and up range sensors) has to:

1. take off from a start pad,
2. cross a field of obstacles it has never seen,
3. find a **17 cm tall, 33 cm wide landing pad** using only its downward range reading,
4. map the pad and land on it,
5. take off again and return to the start pad.

The drone has no external positioning. Its only sense of where it is comes from its own optical-flow odometry.

<div class="metric-grid">
  <div class="metric"><strong>75 s</strong><span>takeoff to landing on the pad in my best flight</span></div>
  <div class="metric"><strong>5</strong><span>onboard range sensors, plus downward optical flow</span></div>
  <div class="metric"><strong>20 Hz</strong><span>sensor logging and setpoint loops</span></div>
  <div class="metric"><strong>8</strong><span>scan lines used to map the pad's edges</span></div>
</div>

---

## Architecture

I wrote the controller in Python on Bitcraze's `cflib` and split it across **three threads**, so slow decisions never stall the sensor stream or the flight commands:

- **Log thread (20 Hz):** position tracking, range readings, the obstacle memory, and pad detection.
- **Setpoint thread (20 Hz):** streams commands continuously so the drone is never left without a target.
- **Mission thread:** the high-level sequence of take off, cross, search, map, land, and return.

Positions are kept in a fixed **arena frame**: I zero the onboard estimator on the start pad and add the pad's offset in the tracker. I use two command modes. **Hover setpoints** (body velocity plus absolute height) handle travel and search, and **position setpoints** (the firmware's position hold) handle takeoff, final approach, and landing.

I also separated the decision logic from the radio interface. That separation let me test the mission offline against a simulated drone before flying it. The tests cover pad-edge detection with spike rejection, coordinate-frame rotations, clear-side detours, and bounded recovery when optical-flow quality drops.

**Height over a moving floor.** The flow deck measures height above whatever is directly below it. Over the pad, that surface is 17 cm higher, so a naive height hold would make the drone climb 17 cm as it crosses. I compensate by subtracting the pad height whenever the drone is over the pad.

---

## Obstacle avoidance

The drone flies forward at 0.2 m/s. When something appears **0.20 m** ahead, it stops and slides sideways at 0.18 m/s:

- It tries left first, then right, then creeps closer and retries up to twice.
- It resumes forward flight only once the path is clear past **0.30 m plus 12 cm** of body clearance. The gap between the trigger and clear distances is deliberate hysteresis, so the drone doesn't chatter at the threshold.
- A hard stop triggers at 0.10 m.

The Multi-ranger only sees in four directions, so an obstacle that slides out of view would otherwise be forgotten. I store every reading under 0.8 m in a **sparse 3 cm obstacle memory**, ignoring returns from the arena walls. Clearance checks then use the closer of the live sensor and any remembered hits in a narrow corridor ahead. This stops the drone from turning back into the corner of an obstacle it has just passed.

---

## Finding and mapping the pad

**Search.** A lawnmower sweep at 0.25 m/s on lines **20 cm apart**. The pad is 33 cm wide, so every pass that reaches it must cross it. If the first sweep misses, a second runs on lines shifted by 10 cm.

**Detection.** When the drone flies over the pad, the downward range drops by 17 cm, but only briefly, since the height controller corrects within about 0.3 s. I count a detection when the reading drops **more than 10 cm below the floor reference on two consecutive samples**, and I reject single-sample spikes.

**Mapping.** Eight parallel scan lines 8 cm apart find the near edge going one way and the far edge coming back. The pad centre is the midpoint of those edges. If fewer than two lines see the pad, I treat the detection as false and resume the search.

**Landing.** The drone moves to the estimated centre in position hold, lowers its position gains to reduce sway over the small target, descends at 0.10 m/s, and releases position hold below 12 cm.

---

## Flight results

In my best flight, the drone completed the full outbound mission on its own:

- took off from the start pad,
- detected the obstacle and slid around it,
- found the pad with the lawnmower search,
- mapped its edges,
- **landed on the pad at 75 s**.

It then took off again and flew most of the return leg using the same avoidance logic. The flight logs showed the return was limited by battery capacity rather than by the navigation, which points directly at the next round of improvements.

---

## Current work and next steps

This is an ongoing project. I am extending the mission toward a reliable, repeatable round trip:

- **Energy-aware flight:** add a low-voltage check that triggers a controlled landing, and budget the return leg against the remaining battery.
- **Smarter avoidance:** use a narrower avoidance corridor, age out stale obstacle points, and rotate in place to scan before choosing a slide direction.
- **More robust pad detection** at higher search speeds, so the sweep covers the landing zone faster.
- **Code hardening:** use the measured arena dimensions, guarantee progress in the return-search loop, and close a sensor-coverage gap on diagonal moves.
- **Repeatable trials:** run a fixed set of flights and record landing accuracy and mission time for each.
