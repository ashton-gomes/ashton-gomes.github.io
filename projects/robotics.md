---
layout: project
title: Kinova Gen3 Kinematics & Trajectory Planning
category_label: Robotics foundation
description: "Screw-theory kinematics, singularity analysis, numerical inverse kinematics, and five trajectory planners for the 7-DOF Kinova Gen3, written from first principles in Python. This is the groundwork for my C++ motion-planning research."
timeline: "Nov – Dec 2025"
tags: [Python, NumPy, Screw Theory, Product of Exponentials, Inverse Kinematics, Trajectory Planning, pytransform3d]
related:
  - title: "Screw-motion planner (research)"
    url: /projects/motion-planner.html
---

## Overview

For this project, I built the kinematics and trajectory planning for the Kinova Gen3, a 7-DOF serial manipulator, from first principles. Instead of using an existing robotics library, every part (forward kinematics, the Jacobian, numerical inverse kinematics, and five trajectory planners) was derived using the screw theory approach from Modern Robotics and written in Python from scratch.

The process starts from the URDF. The joint axes are read in code, converted to space-frame screw axes, and checked against pytransform3d before being used for anything else. The rest of the modules (IK, singularity detection, and trajectory planning) are all built on this checked kinematic model.

This page covers that Python work. In my research in the Interacting Robotic Systems Laboratory, I use the same screw theory model in C++ for dual-quaternion forward kinematics, resolved-motion rate control, and a goal-directed RRT where each edge is a screw motion. More details are on the [screw-motion planner page]({{ '/projects/motion-planner.html' | relative_url }}).

---

## Screw axis derivation and forward kinematics

The first step was getting the robot's kinematic structure directly from the URDF instead of hardcoding DH parameters. For each of the seven active joints, the child link transform at zero configuration was pulled from the transform manager, the local rotation axis was rotated into the global space frame, and the linear screw component was computed as:

$$v_i = -\omega_i \times q_i$$

where $$q_i$$ is the joint's position in the space frame. This gave a 6x7 screw axis matrix $$S$$ and a home configuration $$M \in SE(3)$$, which are the two inputs to the space-form forward kinematics:

$$T_{sb}(\theta) = e^{[S_1]\theta_1} \cdots e^{[S_7]\theta_7} \, M$$

Each matrix exponential is computed using Rodrigues' formula. To verify the result, I set an arbitrary feasible configuration `θ = [0.5, -1.0, 1.5, -1.0, 0.5, 1.0, -0.5]` rad, computed $$T_{sb}$$ analytically, and compared it to the result from the URDF library. The error norm was on the order of $$10^{-14}$$, which confirmed that the screw axes were correct before moving on.

---

## Workspace mapping

With FK validated, a Monte Carlo sweep sampled 3,000 random joint configurations, respecting each joint's limits from the spec file with continuous joints capped at $$\pm 2\pi$$ rad, and recorded the resulting end-effector position. The reachable workspace was plotted as projections in the y-x, z-y, and z-x planes.

The effect of the arm's redundancy can be seen in the workspace plots. The reachable volume is dense and almost symmetric about the vertical axis of the base, without any large empty regions inside it. This is typical of redundant arms, which can reach the same point with many different joint configurations.

---

## Redundancy and singularity analysis

The Kinova Gen3 has 7 joints operating in a 6-DOF task space, so it is kinematically redundant by one degree. The extra DOF is useful because the Jacobian null space can be used for obstacle avoidance or for staying away from joint limits. However, it also means the Jacobian-based IK has to be handled carefully near singularities.

Singular configurations were identified by computing the body Jacobian $$J_b \in \mathbb{R}^{6 \times 7}$$ at candidate poses and checking its condition number and rank. Three main types of singular configurations were found:

- Home configuration: with all joints at zero, several joint axes line up and the Jacobian loses rank.
- Reach singularity: with the arm fully extended horizontally, the wrist is at its maximum distance from the base, and the linear velocity rows of the Jacobian become nearly linearly dependent.
- Wrist singularity: when joint 5 is near zero, the wrist axes become collinear, so the wrist loses a rotational DOF and the condition number increases sharply.

Each configuration was plotted in pytransform3d and checked numerically. These singular regions were then avoided when choosing poses for the trajectory planner.

---

## Numerical inverse kinematics (Newton-Raphson)

The IK solver implements the Newton-Raphson body-form iteration:

$$\theta_{k+1} = \theta_k + J_b^\dagger(\theta_k) \, \mathcal{V}_b$$

The body twist error $$\mathcal{V}_b$$ is found using the matrix logarithm of the error transform $$T_{bd} = T_{sb}^{-1}(\theta_k) \, T_{sd}$$. The pseudoinverse $$J_b^\dagger$$ is used because the robot is redundant. Convergence is checked against separate angular and linear thresholds.

The function signature `IK_BodyForm(Tsd, θ0, ε, B, M)` takes the desired end-effector configuration, an initial guess, the tolerances, the body-frame screw axes, and the home configuration, and does not use any global variables. Internally it calls `FK_BodyForm` and `J_BodyForm` at every iteration.

To check the solver, I generated a target pose from a known feasible configuration, ran IK from a different initial guess, and confirmed that the Frobenius-norm error between the recovered and desired transforms was below $$10^{-8}$$. The joint limits were also checked after convergence.

---

## Trajectory planning

I implemented five trajectory modes, covering both joint-space and task-space planning, with time scaling that gets more complex for each one.

### Joint space with a trapezoidal velocity profile
A straight-line path in joint space with trapezoidal time scaling. Motion time is minimized subject to joint velocity and acceleration limits, and the constant-velocity phase absorbs the remaining time after the ramp segments. This is the cheapest option to compute and does not need IK at all.

### Task space with a straight-line path and 3rd-order polynomial
A straight-line path in SE(3) using matrix exponential interpolation, with a cubic polynomial time scaling. IK is called at each time step to recover the joint trajectory. The start and end poses were chosen to avoid the singular regions found in the Jacobian analysis.

### Decoupled task space with separate position and orientation
Position was interpolated linearly in Cartesian space and orientation via geodesic interpolation in SO(3), each with its own cubic polynomial time scaling. This allows the translation and rotation speeds of the end effector to be controlled separately, which is useful when the straight-line SE(3) path would pass through a poorly conditioned region.

### Circular path with a 5th-order polynomial
The end-effector was commanded to trace a closed circular arc in Cartesian space while holding orientation fixed. A 5th-order polynomial time scaling enforces zero velocity and acceleration at the start and end, which gives a smooth loop. The path is defined by a center point, a radius, and a normal vector for the plane of the circle.

### Via-point cubic splines with continuous accelerations
Position was interpolated through four via points using cubic splines with matched velocity and acceleration constraints at each interior knot, which is a standard tridiagonal system solved with NumPy. The orientation was held fixed the whole time. This is the most flexible of the five planners and is similar to what a real motion controller would use for tasks with several waypoints.

---

## Simulation and verification

For each trajectory mode, the robot was animated in pytransform3d with the computed joint trajectory. Four plots were made for each task, showing the joint positions, velocities, accelerations, and end-effector path, each with the limits from the spec file overlaid. All of the trajectories stayed within the limits, and the IK error for the task-space modes stayed below the convergence threshold the entire time.

<video controls muted playsinline preload="metadata">
  <source src="{{ '/assets/Circle_Animation.mp4' | relative_url }}#t=0.1" type="video/mp4">
</video>

*Circular trajectory with 5th-order polynomial time scaling and a fixed end-effector orientation, simulated on the Kinova Gen3 URDF.*
