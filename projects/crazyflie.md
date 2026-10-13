---
layout: project
title: Crazyflie Autonomous Navigation & Landing
description: Range-based obstacle avoidance, optical-flow boundary recovery, and landing-pad localization on a Crazyflie drone, with navigation and landing performance evaluated across repeated trials.
tags: [Autonomous Navigation, Optical Flow, Obstacle Avoidance, Controls]
---

## Overview

Since **September 2026**, I have been developing autonomous navigation and landing behaviors for a **Crazyflie drone**. The work combines range-based obstacle detection, recovery when optical-flow positioning becomes uncertain, and landing-pad localization from measured height changes.

I evaluated each behavior through repeated trials: navigation without collisions, return to the operating area after boundary encounters, and landing error measured from the pad center.

---

## Obstacle Detection & Avoidance

I implemented **range-based obstacle detection** and **randomized avoidance maneuvers** to navigate around detected obstacles. The drone completed **8 of 10 navigation trials without collisions**.

## Boundary Recovery

I developed boundary recovery logic that uses **optical-flow surface quality** to detect positioning uncertainty. The recovery behavior returned the drone to the operating area in **9 of 10 boundary encounters**.

## Landing-Pad Localization

The landing logic detects **height changes** and maps **pad edges** to localize the landing surface. Across **10 landing trials**, the drone achieved a **mean landing error of 7 cm from the pad center**.

---

## Results

| Behavior | Result | Evaluation scope |
| --- | --- | --- |
| Navigation | 8 of 10 trials completed without collisions | 10 navigation trials |
| Boundary recovery | Returned to the operating area in 9 of 10 encounters | 10 boundary encounters |
| Landing | 7 cm mean error from the pad center | 10 landing trials |

These results describe separate evaluations of navigation, boundary recovery, and landing. Together, they connect obstacle sensing and positioning confidence to the drone's movement and landing decisions.
