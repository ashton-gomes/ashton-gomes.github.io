---
layout: project
title: Robotic Manipulator Control
description: Kinematic solvers and trajectory planning for a Kinova Gen3 arm.
tags: [Python, Robotics, Kinematics]
github_link: "#"
---

### Project Overview
This project involved developing a custom control interface for a Kinova Gen3 robotic manipulator. The goal was to implement autonomous pick-and-place operations using inverse kinematics.

### Methodology
* **Kinematics:** derived the Denavit-Hartenberg (DH) parameters to calculate the forward kinematics transformation matrix.
* **Path Planning:** Implemented a Jacobian-based numerical inverse kinematics solver in **Python (NumPy)** to calculate joint angles for desired end-effector coordinates.
* **Simulation:** Validated trajectories in a simulation environment before deploying to hardware.

### Key Outcomes
* Achieved positional accuracy within **2mm**.
* Implemented collision avoidance algorithms to navigate around static obstacles.