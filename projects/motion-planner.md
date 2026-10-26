---
layout: project
title: "Screw-Motion Planner for a 7-DOF Kinova Gen3"
category_label: Robotics research
description: "A C++ motion planner that grows a goal-directed RRT whose every edge is a dual-quaternion screw motion (ScLERP) tracked by resolved-motion rate control, with independent collision and kinematic validation in MuJoCo."
role: Graduate Researcher
timeline: "Jan 2026 – Present"
team: "Interacting Robotic Systems Laboratory, Stony Brook University"
github_link: "https://github.com/ashton-gomes/ashton-motion-planner"
hero_video: /assets/planner_shelf_example.mp4
hero_alt: "Kinova Gen3 arm in MuJoCo reaching from outside a bookshelf into one of its cubbies."
hero_caption: "Fixed-task shelf scene: the arm starts outside the bookshelf and plans into a cubby. The direct screw motion is blocked by the shelf boards, so the planner builds a tree of short screw-motion edges around them."
tags: [C++17, Eigen, MuJoCo, CMake, Dual Quaternions, ScLERP, RMRC, RRT / RRT*, Screw Theory, Benchmarking]
related:
  - title: "RRT variants study"
    url: /projects/rrt-study.html
  - title: "Kinematics foundation"
    url: /projects/robotics.html
---

## Overview

Most manipulator planners work in joint space: they find a collision-free path between two joint configurations and leave the end-effector motion as a side effect. My research asks a different question. If the task is defined by **where the gripper must go and how it must be oriented**, can the planner reason directly about end-effector poses while still producing joint motion that is collision-free and kinematically exact?

The planner I built answers that with three ideas working together:

<ul class="pipeline">
  <li>Goal-directed RRT in task space</li>
  <li>ScLERP screw-motion edges</li>
  <li>RMRC to joint space</li>
  <li>Self + obstacle collision checks</li>
  <li>Independent MuJoCo validation</li>
</ul>

Everything below the MuJoCo model loader is my own C++: the quaternion and dual-quaternion algebra, product-of-exponentials forward kinematics, the spatial Jacobian, the RMRC update, the tree search, and the benchmark harness. MuJoCo supplies the robot geometry, collision queries, and an independent forward-kinematics check. The ScLERP + RMRC formulation follows the published method from the lab of my advisor, Professor Nilanjan Chakraborty; this project implements it in C++ and builds a sampling-based planner around it.

<div class="metric-grid">
  <div class="metric"><strong>5,000</strong><span>seeded benchmark trials across five planner/scene conditions</span></div>
  <div class="metric"><strong>99.1%</strong><span>of random goals reached in free space with sampling (vs. 83.6% for a single direct screw)</span></div>
  <div class="metric"><strong>108 ms</strong><span>median planning time, sampled planner in free space</span></div>
  <div class="metric"><strong>0.0026 mm</strong><span>median final position error, confirmed by independent MuJoCo FK</span></div>
  <div class="metric"><strong>0</strong><span>collisions in 4,736 reached paths under dense playback checks</span></div>
</div>

---

## Planner in action

Each environment defines a fixed start and goal where the straight screw motion between them is blocked. The repository's test suite enforces that: a scene only counts as a planning test if the direct motion fails because of an obstacle.

<div class="video-grid">
  <figure>
    <video controls muted loop playsinline preload="metadata" aria-label="Arm reaching through a window in a wall">
      <source src="{{ '/assets/planner_wall_hole_example.mp4' | relative_url }}#t=0.1" type="video/mp4">
    </video>
    <figcaption><strong>Wall with a window.</strong> The goal sits behind a wall, so the end effector has to thread through a rectangular opening.</figcaption>
  </figure>
  <figure>
    <video controls muted loop playsinline preload="metadata" aria-label="Arm reaching under a tabletop">
      <source src="{{ '/assets/planner_table_example.mp4' | relative_url }}#t=0.1" type="video/mp4">
    </video>
    <figcaption><strong>Under a table.</strong> The arm starts above the tabletop and must route the wrist down and under it without striking the legs.</figcaption>
  </figure>
  <figure>
    <video controls muted loop playsinline preload="metadata" aria-label="Arm reaching between tall cylindrical posts">
      <source src="{{ '/assets/planner_cylinder_example.mp4' | relative_url }}#t=0.1" type="video/mp4">
    </video>
    <figcaption><strong>Tall posts.</strong> Three one-metre cylinders block the direct sweep, so the planner has to keep every link, not just the gripper, clear of them.</figcaption>
  </figure>
  <figure>
    <video controls muted loop playsinline preload="metadata" aria-label="Arm reaching into a bookshelf cubby">
      <source src="{{ '/assets/planner_shelf_example.mp4' | relative_url }}#t=0.1" type="video/mp4">
    </video>
    <figcaption><strong>Bookshelf cubby.</strong> A confined goal between boards on five sides, the tightest of the fixed tasks.</figcaption>
  </figure>
</div>

---

## Why screw motions?

A rigid-body pose has a position and an orientation. A common shortcut interpolates the two separately: a straight line for position and a SLERP for rotation. That produces a valid pose at every instant, but the resulting motion depends on which frame you chose and does not correspond to any natural rigid-body movement.

**Screw linear interpolation (ScLERP)** instead moves the body along a single screw: a simultaneous rotation about and translation along one fixed axis. It is the rigid-body analogue of a straight line, it is independent of the choice of coordinate frame, and it keeps translation and rotation coupled. Representing poses as **unit dual quaternions** makes this practical:

$$\hat{D} = q_r + \varepsilon\, q_d, \qquad q_d = \tfrac{1}{2}\, p\, q_r, \qquad \varepsilon^2 = 0$$

and the interpolation between poses $$\hat{D}_A$$ and $$\hat{D}_B$$ is

$$\hat{D}(\tau) = \hat{D}_A \left(\hat{D}_A^{-1}\hat{D}_B\right)^{\tau}, \qquad \tau \in [0, 1].$$

### Implementing the algebra from scratch

I wrote the dual-quaternion layer directly on top of Eigen's quaternions rather than using a robotics library, which forced me to get every convention right:

- **Multiplication, conjugate, and inverse** for unit dual quaternions, including inverse of the dual part: $$\hat{D}^{-1} = q_r^* - \varepsilon\, q_r^* q_d q_r^*$$.
- **Fractional power** $$\hat{D}^{\tau}$$ through the screw parameters: the rotation angle $$\theta$$, unit axis $$u$$, pitch distance $$d$$ along the axis, and moment $$m$$, evaluated with dual-number sine and cosine.
- **A pure-translation branch** for when the rotation angle approaches zero, where the screw axis is undefined and the general formula divides by $$\sin(\theta/2)$$.
- **Sign alignment.** $$q$$ and $$-q$$ describe the same orientation, so before interpolating or differencing poses the planner flips the target into the same hemisphere. Without this, the arm takes the "long way round" and spins nearly a full turn.
- **Ordering discipline.** Pose vectors are stored scalar-first, `[px, py, pz, w, x, y, z]`, while Eigen's coefficient array is `[x, y, z, w]` and MuJoCo stores `[w, x, y, z]`. Every conversion is explicit and commented.

---

## Kinematics: product of exponentials in dual quaternions

At start-up the planner loads the Kinova Gen3 model, zeroes the joints, and reads each joint's axis $$\omega_i$$ and anchor point $$q_i$$ from MuJoCo. From then on MuJoCo is no longer used for kinematics. Each joint becomes a screw with $$v_i = -\omega_i \times q_i$$, and forward kinematics is a product of exponentials evaluated entirely with dual quaternions:

$$\hat{D}(\theta) = e^{\hat{S}_1\theta_1}\, e^{\hat{S}_2\theta_2} \cdots e^{\hat{S}_7\theta_7}\; \hat{M}$$

where $$\hat{M}$$ is the tool pose at zero configuration. The **spatial Jacobian** is built column by column by carrying each screw axis through the cumulative transform with the adjoint map, $$J_{s,i} = \mathrm{Ad}_{T_{i-1} } S_i$$.

---

## Resolved-motion rate control along each screw

ScLERP describes how the end effector *should* move. **Resolved-motion rate control (RMRC)** turns that into joint motion. The pose is written as a 7-vector $$\gamma = [p;\, Q]$$ (position plus unit quaternion), and a representation Jacobian $$J_2(\gamma)$$ maps pose-coordinate rates to the spatial twist. Each iteration then updates the joints as

$$\theta_{k+1} = \theta_k + \beta\, J_s^{+}(\theta_k)\, J_2(\gamma_k)\, \left(\gamma_{k+1} - \gamma_k\right)$$

with step gain $$\beta = 0.1$$ and a lightly damped pseudoinverse $$J_s^{+} = J_s^T (J_s J_s^T + \lambda I)^{-1}$$ that stays well behaved near singular configurations of the 7-DOF arm.

Along each edge the target walks forward through 20 ScLERP sub-poses, with up to 100 RMRC iterations to settle. An edge is accepted only when the end effector lands within **1 mm and 0.001 rad** of the edge target. After every RMRC step the new configuration is checked for **self-collision** (between non-adjacent links) and **obstacle collision** (robot collision meshes against scene geometry inflated by a 2 cm margin).

---

## Goal-directed RRT built from screw edges

A single screw from start to goal is often blocked, or the RMRC solution along it drives the arm into itself. The planner therefore grows a **tree of short screw-motion edges** in task space:

1. **Goal-directed first attempt.** Each expansion first tries to extend the newest untried node straight toward the goal, so in open space the tree races to the target in a handful of edges.
2. **Random fallback samples.** If that edge fails, up to 10 random targets are drawn from a spherical workspace shell around the base (outer radius = 95% of the summed link lengths), discarding points inside obstacles.
3. **Steer and rotate.** The nearest node steps at most **5 cm** toward the sample, and its orientation advances toward the goal orientation by the same fraction of the remaining distance. That way rotation is spread across the path instead of happening all at the end.
4. **Execute the edge.** ScLERP plus RMRC drive the arm along the edge and run the collision checks above. The joint-space segment between parent and child is also swept with 24 interpolated configurations.
5. **Optional RRT\*.** With `use_rrt_star` enabled, new nodes pick the cheapest collision-free parent within a 10 cm radius and rewire their neighbours, so the tree keeps shortening paths after the first solution.

Every node stores both its pose and the joint configuration that achieved it. A path is therefore a sequence of configurations the arm has actually reached, not a list of poses that still need inverse kinematics.

---

## Validating the result, not just the planner's own checks

A planner that reports success using only its own internal checks can hide errors. After planning, every path goes through a separate **validation pass**:

- **Dense playback:** each sampled edge is re-checked at **240 configurations** for self-collision, obstacle collision, and finite values.
- **Joint limits:** Gen3 joints 2, 4, and 6 have hard limits (±2.24, ±2.57, ±2.09 rad). Every playback configuration is checked against them.
- **Independent forward kinematics:** the final configuration is pushed through MuJoCo's own kinematics, not my dual-quaternion FK, and the pose error is measured again.

A trial counts as *reached* if the planner gets within 1 mm and 0.001 rad of the goal. It counts as *fully validated* only if it also passes everything above. Reporting both rates keeps a reached goal from being mistaken for a deployable motion.

---

## Benchmark

The headless benchmark runs reproducible, seeded trials: trial *i* uses seed *i*, and the goal, workspace, and expansion random streams are reset per trial. Random goals are generated by sampling joint configurations within limits and running FK, so every goal has at least one valid, collision-free joint solution. Failures stay in the denominator; no hard goal is ever swapped for an easier one. Batches run in parallel across eight workers.

| Condition | Trials | Goals reached | Fully validated | Median planning time | Median tree size |
| --- | ---: | ---: | ---: | ---: | ---: |
| Direct screw, free space | 1,000 | 83.6% | 71.7% | 501 ms | 2 nodes |
| Sampled RRT, free space | 1,000 | **99.1%** | 58.6% | **108 ms** | 16 nodes |
| Sampled RRT, obstacle scene 1 | 1,000 | 98.5% | 49.3% | 137 ms | 19 nodes |
| Sampled RRT, obstacle scene 2 | 1,000 | 97.8% | 62.4% | 102 ms | 15 nodes |
| Sampled RRT, obstacle scene 3 | 1,000 | 94.6% | 53.8% | 115 ms | 17 nodes |

*Planning time includes the planner's own collision checks and excludes model loading, goal sampling, and the final validation pass. Trials ran on a local workstation in eight parallel workers. The three obstacle scenes are from the benchmark's first scene set. The fixed-task scenes in the videos above were added afterwards and are next in line for the full 1,000-trial run.*

### What the numbers show

- **Sampling is what makes screw motion practical.** A single direct screw reaches 83.6% of reachable goals, and every one of its 164 failures was the arm colliding with itself while following that one screw. Breaking the motion into short screw edges lets the tree route around those configurations, lifting completion to 99.1% while cutting median planning time by more than 4×.
- **Obstacles cost little.** Across three obstacle scenes the planner still reaches 94.6–98.5% of goals with median times between 102 and 137 ms.
- **Accuracy is set by the solver tolerance, not by drift.** Median final position error is **0.0026 mm** with orientation error near 5 × 10⁻⁶ rad. These are confirmed by MuJoCo's independent kinematics, which shows that my dual-quaternion FK and MuJoCo's model agree.
- **Collision safety held across the board.** All 4,736 reached paths passed the dense 240-check-per-edge playback with zero self- or obstacle collisions.

<div class="callout" markdown="1">
**Where the work is going next: joint-limit-aware RMRC.** The gap between "reached" and "fully validated" has a single cause. Every reached path is collision-free, and the only validation failures are joint 2, 4, or 6 passing its hard limit partway through a path. The current RMRC update uses the pseudoinverse alone and does not yet push the redundant seventh degree of freedom away from those limits. Benchmarking the planner honestly is what exposed this, and it points to a clear next step: project a joint-limit avoidance gradient into the Jacobian null space, and reject edges that exit the limits during planning rather than after it. Both fit into the existing `followEdge` loop.
</div>

---

## Engineering the codebase

The planner began as a single exploratory `main.cpp` (still preserved in the repository's `legacy/` folder) and was restructured into a library the interactive viewer, the benchmark, and the tests all share:

| Module | Responsibility |
| --- | --- |
| `planner.cpp` | Dual-quaternion algebra, PoE forward kinematics, spatial Jacobian, RMRC, collision checkers, `MotionPlanner` API |
| `rrt_star.cpp` | Expansion sampling, nearest-node search, steering, RRT\* parent selection and rewiring |
| `sampler.cpp` | Workspace-shell and reachable-pose sampling, obstacle loading, scene keyframes |
| `benchmark.cpp` | Condition table, seeded trials, CSV reporting |
| `viewer.cpp` | MuJoCo / GLFW playback with start and goal markers |
| `planner_tests.cpp` | Scene validity, home-to-home planning, joint-limit detection, rotation-only goals |

A few design decisions I'm glad I made:

- **One planner core, many front ends.** `MotionPlanner::plan()` has no UI or file I/O, so the interactive app and the headless benchmark exercise exactly the same code. The viewer can be compiled out with `-DBUILD_VIEWER=OFF`.
- **Scenes as data.** Each environment is a MuJoCo XML with optional `start` and `goal` keyframes, and the app lists every scene in the `environments/` folder at launch. Adding a new task requires no code.
- **Tests that guard the benchmark's meaning.** Beyond unit checks, the test suite rejects any fixed-task scene whose direct motion *isn't* blocked by an obstacle, and confirms validation catches a joint-limit violation even when the endpoint looks perfect.
- **Failure diagnostics.** Each rejected edge is counted by cause: self-collision, obstacle collision, swept-path collision, RMRC non-convergence, non-finite values, or no progress. That turns a failed plan into a specific hypothesis instead of a guess.

### A debugging story: the unexpected full spin

An early version reached its goal and then spun the wrist nearly 360° before settling. The pose was right, but the motion wasn't. The cause was two separate continuity problems that looked like one: quaternion double cover (interpolating toward $$-q$$ instead of $$q$$), and the redundant arm jumping between distinct inverse-kinematic branches that reach the same pose. The fixes were hemisphere alignment everywhere a pose is differenced or interpolated, and seeding every edge from its parent's stored joint configuration so that consecutive nodes stay on the same branch. Those two rules are still the backbone of how the planner keeps motion smooth.

---

## Related lab work

Alongside the planner, I build and tune C++ / MuJoCo test cases for **FLIQC**, a third-party optimisation-based obstacle-avoidance controller ([`hwyao/FLIQC_controller_core`](https://github.com/hwyao/FLIQC_controller_core)), on the same Gen3 arm. My contributions there are the integration: a 6-DOF damped-least-squares RMRC guide velocity, distance constraints for all seven links instead of two, null-space posture control that is gated off during avoidance, and retuning the controller's activation band to remove an oscillation near obstacles.

---

## Results

- Built a C++ task-space planner whose RRT edges are **dual-quaternion screw motions** tracked with **resolved-motion rate control**. All of the algebra, kinematics, and search are written from scratch on Eigen.
- Raised free-space goal completion from **83.6% to 99.1%** compared with a single direct screw, at a **108 ms** median planning time.
- Kept **94.6–98.5%** completion across three obstacle scenes, with **zero collisions** in 4,736 reached paths under dense independent validation.
- Achieved **0.0026 mm** median final position error, cross-checked against MuJoCo's own kinematics.
- Designed a reproducible **5,000-trial benchmark** that separates "reached" from "fully validated" and identifies joint-limit-aware RMRC as the next development step.
