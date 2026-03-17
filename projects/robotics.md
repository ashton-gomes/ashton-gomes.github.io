---
layout: project
title: Kinova Gen3 Kinematic Modeling & Trajectory Planning
description: Full kinematic stack for a 7-DOF redundant manipulator — screw axis derivation, workspace mapping, singularity analysis, Newton-Raphson IK, and multi-mode trajectory planning.
tags: [Python, Robotics, Kinematics, Trajectory Planning, NumPy, Modern Robotics]
---

## Overview

This project built a complete kinematic and trajectory planning stack for the Kinova Gen3, a 7-DOF serial manipulator, from first principles. Rather than relying on a pre-built robotics library, every component — forward kinematics, Jacobian computation, numerical inverse kinematics, and five distinct trajectory planners — was derived from the Modern Robotics (screw theory) framework and implemented in Python from scratch.

The pipeline starts at the URDF level: joint axes are parsed programmatically, converted to space-frame screw axes, and validated against the pytransform3d ground truth before anything downstream is trusted. Every subsequent module — IK, singularity detection, trajectory planning — chains off that verified kinematic model.

---

## Screw Axis Derivation & Forward Kinematics

The first step was extracting the robot's kinematic structure directly from the URDF rather than hardcoding DH parameters. For each of the seven active joints, the child link transform at zero configuration was pulled from the transform manager, the local rotation axis was rotated into the global space frame, and the linear screw component was computed as $v_i = -\omega_i \times q_i$, where $q_i$ is the joint's position in the space frame.

This produced a $6 \times 7$ screw axis matrix $S$ and a home configuration $M \in SE(3)$ — the two inputs to the space-form forward kinematics:

$$T_{sb}(\theta) = e^{[S_1]\theta_1} \cdots e^{[S_7]\theta_7} \, M$$

Each matrix exponential is computed via Rodrigues' formula. Verification was done by setting an arbitrary feasible configuration $\theta = [0.5, -1.0, 1.5, -1.0, 0.5, 1.0, -0.5]$ rad, computing $T_{sb}$ analytically, and comparing against the URDF library's ground truth. The resulting error norm was on the order of $10^{-14}$, confirming the screw axes were correct before any downstream work.

---

## Workspace Mapping

With FK validated, a Monte Carlo workspace sweep sampled 3,000 random joint configurations — respecting each joint's limits from the spec file, with continuous joints capped at $\pm 2\pi$ rad — and recorded the resulting end-effector position. The bounding box of the reachable workspace was plotted as projections in the $y$-$x$, $z$-$y$, and $z$-$x$ planes.

The 7-DOF kinematic redundancy is immediately visible in the workspace plots: the accessible volume is dense and nearly symmetric about the base vertical axis, with no large interior voids, which is characteristic of redundant arms that can reach a given point from many different joint configurations.

---

## Redundancy & Singularity Analysis

The Kinova Gen3 has 7 joints operating in a 6-DOF task space, making it kinematically redundant by one degree. That extra DOF is useful — it allows the null-space of the Jacobian to be exploited for obstacle avoidance or joint limit management — but it also means the Jacobian-based IK must be handled carefully near singularities.

Singular configurations were identified by computing the body Jacobian $J_b \in \mathbb{R}^{6 \times 7}$ at candidate poses and checking its condition number and rank. Three meaningful singular families were characterized:

- **Home configuration** — with all joints at zero, several joint axes align and the Jacobian loses rank.
- **Reach singularity** — arm fully extended horizontally, placing the wrist at its maximum radial distance from the base. The linear velocity rows of the Jacobian become nearly linearly dependent.
- **Wrist singularity** — collinear wrist axes ($\theta_5 \approx 0$), causing the wrist to lose a rotational DOF and the condition number to spike.

Each configuration was plotted in pytransform3d and verified numerically. These singular zones were then used as no-go regions in the trajectory planner to prevent the IK solver from being called in ill-conditioned regions.

---

## Numerical Inverse Kinematics (Newton-Raphson)

The IK solver implements the Newton-Raphson body-form iteration:

$$\theta_{k+1} = \theta_k + J_b^\dagger(\theta_k) \, \mathcal{V}_b$$

where the body twist error $\mathcal{V}_b$ is extracted via the matrix logarithm of $T_{bd} = T_{sb}^{-1}(\theta_k) \, T_{sd}$, and the pseudoinverse $J_b^\dagger$ is used because the robot is redundant. Convergence is checked against separate angular ($\epsilon_\omega$) and linear ($\epsilon_v$) thresholds.

The function signature `IK_BodyForm(Tsd, θ0, ε, B, M)` takes the desired end-effector configuration, an initial guess, tolerance thresholds, body-frame screw axes, and the home configuration — no global state. Internally it calls `FK_BodyForm` and `J_BodyForm` at every iteration.

Validation was done by generating a target pose from a known feasible $\theta^*$, running IK from a different initial guess, and confirming that $\|FK(\hat{\theta}) - T_{sd}\|_F < 10^{-8}$. Joint limit compliance was checked explicitly after convergence.

---

## Trajectory Planning

Five trajectory modes were implemented, covering both joint-space and task-space planning with progressively more complex time scaling.

### Joint-Space: Trapezoidal Velocity Profile
A straight-line path in joint space $\theta(s) \in \mathbb{R}^7$ with trapezoidal time scaling $s(t)$. The motion time $T$ is minimized subject to joint velocity and acceleration limits, and the trapezoidal profile's constant-velocity phase absorbs the remaining time after the ramp segments. This is the computationally cheapest option and avoids IK entirely.

### Task-Space: Straight-Line Path with 3rd-Order Polynomial
A straight-line path in $SE(3)$ using the matrix exponential interpolation $T(s) = T_{start} \, e^{\log(T_{start}^{-1} T_{end}) \, s}$, with a cubic polynomial time scaling. IK is called at each time step to recover $\theta_d(t)$. Configurations near the singular zones identified in the Jacobian analysis were explicitly avoided when selecting start/end poses.

### Decoupled Task-Space: Separate Position and Orientation
Position was interpolated linearly in $\mathbb{R}^3$ and orientation via geodesic interpolation in $SO(3)$, each with its own cubic polynomial time scaling. This gives independent control over how fast the end-effector translates versus rotates, which is useful when the straight-line $SE(3)$ path would sweep through a bad region.

### Circular Path: 5th-Order Polynomial
The end-effector was commanded to trace a closed circular arc in Cartesian space while holding orientation fixed. A 5th-order polynomial time scaling enforces zero velocity and acceleration at the start and end, producing a smooth, continuous loop. The circular path was parameterized by center point, radius, and a normal vector defining the plane of the circle.

### Via-Point Splines: Cubic Splines with Continuous Accelerations
Position was interpolated through four via points (including start and end) using cubic splines with matched velocity and acceleration constraints at each interior knot — standard tridiagonal system solved with NumPy. Orientation was held fixed throughout. This is the most flexible planner and mirrors what a real motion controller would use for multi-waypoint tasks.

---

## Simulation & Verification

For each trajectory mode, the robot was animated in pytransform3d with the computed $\theta_d(t)$ sequence. Alongside the animation, four diagnostic plots were generated per task: $p(t)$, $\theta_d(t)$, $\dot{\theta}_d(t)$, and $\ddot{\theta}_d(t)$, each overlaid with the joint position, velocity, and acceleration limits from the spec file. All trajectories remained within limits, and the IK error for task-space modes stayed below the convergence threshold throughout.

The desired end-effector path (straight line, circle, or spline curve) and the start/end frames were plotted in 3D alongside the simulated robot to confirm the motion matched the planned path geometrically.

<video width="500" controls>
  <source src="/assets/Circle_Animation.mp4" type="video/mp4">
</video>

*Circular trajectory: 5th-order polynomial time scaling, fixed end-effector orientation, simulated on the Kinova Gen3 URDF.*
