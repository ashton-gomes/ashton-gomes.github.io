---
layout: project
title: Robot Motion Planning — RRT, ScLERP & Resolved-Rate Control
description: C++ task-space planning and resolved-rate control for a 7-DOF Kinova Gen3, benchmarked in MuJoCo across empty and randomized obstacle scenes.
tags: [C++, MuJoCo, RRT, Dual Quaternions, ScLERP, Resolved-Rate Control]
---

## Overview

As a **Graduate Researcher in the Interacting Robotic Systems Laboratory at Stony Brook University since January 2026**, I develop task-space planning and control for a **7-DOF Kinova Gen3 arm**. The current pipeline is implemented in **C++** and combines **goal-directed Rapidly-exploring Random Trees (RRT)** with **dual-quaternion Screw Linear Interpolation (ScLERP)**.

The planner generates end-effector pose targets, and a resolved-rate controller maps those targets into joint motion. I benchmark the pipeline in **MuJoCo**, using both empty scenes and randomized obstacle scenes to evaluate pose-target completion, planning time, collision checks, and joint-limit checks.

---

## Task-Space Planning: Goal-Directed RRT & ScLERP

The task-space planner uses **goal-directed RRT** to explore toward the requested end-effector pose. **ScLERP** provides the dual-quaternion interpolation between poses, expressing rotation and translation together as a screw motion.

This builds on my earlier Python work in screw-axis kinematics and dual-quaternion interpolation. The current C++ pipeline combines that pose representation with an RRT planner and simulation-based trajectory evaluation.

## Resolved-Rate Motion Control

I implement resolved-rate control using **dual-quaternion forward kinematics**, a **damped Jacobian pseudoinverse**, and **quaternion sign alignment** to track end-effector pose targets.

Forward kinematics provides the current end-effector pose. The controller uses the pose error and Jacobian pseudoinverse to resolve joint motion toward the target. Quaternion sign alignment keeps the pose representation consistent during tracking.

Across **23 validated simulation trials**, the pipeline achieved a **final position error below 0.004 mm**.

---

## MuJoCo Benchmarking

I benchmarked the pipeline across **40 reachable-goal trials** in empty and randomized obstacle scenes. The benchmark achieved **97.5% pose-target completion**, while generated trajectories were evaluated with **240 collision and joint-limit checks per path segment**.

Across the MuJoCo trials that passed collision and joint-limit checks, the planner achieved a **108 ms median planning time**.

| Metric | Result | Evaluation scope |
| --- | --- | --- |
| Planning time | 108 ms median | MuJoCo trials passing collision and joint-limit checks |
| Final position error | Below 0.004 mm | 23 validated simulation trials |
| Pose-target completion | 97.5% | 40 reachable-goal trials in empty and randomized obstacle scenes |
| Trajectory evaluation | 240 collision and joint-limit checks per path segment | Generated path segments |

The planning-time and position-error statistics apply to their stated evaluation groups. Pose-target completion is reported across the full 40-trial benchmark; it is a separate measure from passing trajectory collision and joint-limit checks.

---

## Earlier Python Prototype

The visualizations below document the earlier Python ScLERP and resolved-motion rate control prototype that preceded the current C++ RRT pipeline. The [Kinova Gen3 Kinematics & Trajectory Planning project]({{ '/projects/robotics.html' | relative_url }}) documents the underlying kinematic work.

![End-effector screw-interpolation path from the earlier Python ScLERP prototype](/assets/sclerp_trajectory.png)
*Earlier Python prototype: end-effector poses along a ScLERP interpolation, visualizing coupled rotation and translation.*

![Seven-joint tracking histories from the earlier Python resolved-motion rate control prototype](/assets/sclerp_rmrc.png)
*Earlier Python prototype: joint-angle histories from a resolved-motion rate control tracking run. The current C++ benchmark statistics are reported separately above.*

---

## Results & Impact

- **Planning:** Developed a C++ task-space planner combining goal-directed RRT and dual-quaternion ScLERP for the 7-DOF Kinova Gen3.
- **Control:** Integrated dual-quaternion forward kinematics, a damped Jacobian pseudoinverse, and quaternion sign alignment for end-effector pose tracking.
- **Performance:** Achieved **108 ms median planning time** in MuJoCo trials passing collision and joint-limit checks, and **final position error below 0.004 mm** across **23 validated simulation trials**.
- **Benchmarking:** Evaluated **40 reachable-goal trials** with **97.5% pose-target completion** and **240 collision and joint-limit checks per path segment**.
