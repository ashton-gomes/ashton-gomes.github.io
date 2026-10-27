---
layout: project
title: "Screw-Motion Planner for a 7-DOF Kinova Gen3"
category_label: Robotics research
description: "A C++ motion planner that grows a goal-directed RRT where each edge is a dual-quaternion screw motion (ScLERP) tracked with resolved-motion rate control. Every path is checked again for collisions and kinematic accuracy in MuJoCo."
role: Graduate Researcher
timeline: "Jan 2026 – Present"
team: "Interacting Robotic Systems Laboratory, Stony Brook University"
github_link: "https://github.com/ashton-gomes/ashton-motion-planner"
hero_video: /assets/planner_shelf_example_web.mp4
hero_poster: /assets/planner_shelf_example_poster.jpg
hero_alt: "Kinova Gen3 arm in MuJoCo reaching from outside a bookshelf into one of its cubbies."
hero_caption: "Shelf task: the arm starts outside the bookshelf and plans into one of the cubbies. The direct screw motion is blocked by the shelf boards, so the planner builds a tree of short screw-motion edges around them."
tags: [C++17, Eigen, MuJoCo, CMake, Dual Quaternions, ScLERP, RMRC, RRT / RRT*, Screw Theory, Benchmarking]
related:
  - title: "RRT enhancement benchmark"
    url: /projects/rrt-study.html
  - title: "Kinematics foundation"
    url: /projects/robotics.html
---

## Overview

Most manipulator planners work in joint space. They find a collision-free path between two joint configurations, and the motion of the end effector is whatever results from that path. My research looks at the problem from the other side. If a task is defined by where the gripper needs to go and how it needs to be oriented, the planner should be able to work with end-effector poses directly while still producing joint motion that is collision-free and kinematically accurate.

The planner I built does this in the following steps:

<ul class="pipeline">
  <li>Goal-directed RRT in task space</li>
  <li>ScLERP screw-motion edges</li>
  <li>RMRC to joint space</li>
  <li>Self + obstacle collision checks</li>
  <li>Independent MuJoCo validation</li>
</ul>

Apart from MuJoCo's model loading, the planner is my own C++ code. This includes the quaternion and dual-quaternion algebra, the product-of-exponentials forward kinematics, the spatial Jacobian, the RMRC update, the tree search, and the benchmark. MuJoCo is used for the robot geometry, collision queries, and a separate forward-kinematics check. The ScLERP and RMRC formulation is based on the published method from my advisor Professor Nilanjan Chakraborty's lab. My project implements it in C++ and builds a sampling-based planner around it.

<div class="metric-grid">
  <div class="metric"><strong>5,000</strong><span>seeded benchmark trials across five planner/scene conditions</span></div>
  <div class="metric"><strong>99.1%</strong><span>of random goals reached in free space with sampling (vs. 83.6% for a single direct screw)</span></div>
  <div class="metric"><strong>108 ms</strong><span>median planning time, sampled planner in free space</span></div>
  <div class="metric"><strong>0.0026 mm</strong><span>median final position error, checked with MuJoCo's own FK</span></div>
  <div class="metric"><strong>0</strong><span>collisions in 4,736 reached paths under dense playback checks</span></div>
</div>

---

## Example tasks

Each task environment has a fixed start and goal where the direct screw motion between them is blocked. The test suite in the repository enforces this, so a scene only counts as a planning test if the direct motion fails because of an obstacle.

<div class="video-grid">
  <figure>
    <video controls muted loop playsinline preload="metadata" poster="{{ '/assets/planner_wall_hole_example_poster.jpg' | relative_url }}" aria-label="Arm reaching through a window in a wall">
      <source src="{{ '/assets/planner_wall_hole_example_web.mp4' | relative_url }}" type="video/mp4">
    </video>
    <figcaption>Wall with a window. The goal is behind a wall, so the end effector has to pass through a rectangular opening.</figcaption>
  </figure>
  <figure>
    <video controls muted loop playsinline preload="metadata" poster="{{ '/assets/planner_table_example_poster.jpg' | relative_url }}" aria-label="Arm reaching under a tabletop">
      <source src="{{ '/assets/planner_table_example_web.mp4' | relative_url }}" type="video/mp4">
    </video>
    <figcaption>Under a table. The arm starts above the tabletop and has to move the wrist down and under it without hitting the legs.</figcaption>
  </figure>
  <figure>
    <video controls muted loop playsinline preload="metadata" poster="{{ '/assets/planner_cylinder_example_poster.jpg' | relative_url }}" aria-label="Arm reaching between tall cylindrical posts">
      <source src="{{ '/assets/planner_cylinder_example_web.mp4' | relative_url }}" type="video/mp4">
    </video>
    <figcaption>Tall posts. Three 1 m cylinders block the direct path, so every link of the arm has to stay clear of them, including the ones far from the gripper.</figcaption>
  </figure>
  <figure>
    <video controls muted loop playsinline preload="metadata" poster="{{ '/assets/planner_shelf_example_poster.jpg' | relative_url }}" aria-label="Arm reaching into a bookshelf cubby">
      <source src="{{ '/assets/planner_shelf_example_web.mp4' | relative_url }}" type="video/mp4">
    </video>
    <figcaption>Bookshelf cubby. The goal is enclosed by boards on five sides, which makes this the tightest of the fixed tasks.</figcaption>
  </figure>
</div>

---

## Screw motions

A rigid-body pose is made up of a position and an orientation. A common approach is to interpolate the two separately, using a straight line for position and SLERP for rotation. This gives a valid pose at every point, but the resulting motion depends on which coordinate frame was chosen and does not match any natural rigid-body motion.

Screw linear interpolation (ScLERP) moves the body along a single screw instead, which is a rotation about a fixed axis combined with a translation along that same axis. It can be thought of as the rigid-body version of a straight line. It does not depend on the coordinate frame, and it keeps the translation and rotation coupled together. Representing poses as unit dual quaternions makes this practical to compute:

$$\hat{D} = q_r + \varepsilon\, q_d, \qquad q_d = \tfrac{1}{2}\, p\, q_r, \qquad \varepsilon^2 = 0$$

The interpolation between two poses $$\hat{D}_A$$ and $$\hat{D}_B$$ is then

$$\hat{D}(\tau) = \hat{D}_A \left(\hat{D}_A^{-1}\hat{D}_B\right)^{\tau}, \qquad \tau \in [0, 1].$$

### Dual-quaternion implementation

I wrote the dual-quaternion layer directly on top of Eigen's quaternions instead of using a robotics library, which meant every convention had to be handled correctly by hand. The main parts are:

- Multiplication, conjugate, and inverse for unit dual quaternions, including the inverse of the dual part, $$\hat{D}^{-1} = q_r^* - \varepsilon\, q_r^* q_d q_r^*$$.
- The fractional power $$\hat{D}^{\tau}$$, computed from the screw parameters (rotation angle $$\theta$$, unit axis $$u$$, distance $$d$$ along the axis, and moment $$m$$) using dual-number sine and cosine.
- A separate pure-translation case for when the rotation angle approaches zero. In that case the screw axis is undefined and the general formula would divide by $$\sin(\theta/2)$$.
- Sign alignment. Since $$q$$ and $$-q$$ describe the same orientation, the planner flips the target into the same hemisphere before interpolating or differencing two poses. Without this, the arm can take the long way around and rotate almost a full turn.
- Consistent ordering. Pose vectors are stored scalar-first as `[px, py, pz, w, x, y, z]`, while Eigen's coefficient array is `[x, y, z, w]` and MuJoCo uses `[w, x, y, z]`. Every conversion between them is explicit and commented.

---

## Kinematics with product of exponentials

When the planner starts, it loads the Kinova Gen3 model, sets all joints to zero, and reads each joint's axis $$\omega_i$$ and anchor point $$q_i$$ from MuJoCo. After that, MuJoCo is not used for kinematics. Each joint becomes a screw with $$v_i = -\omega_i \times q_i$$, and forward kinematics is computed as a product of exponentials entirely with dual quaternions:

$$\hat{D}(\theta) = e^{\hat{S}_1\theta_1}\, e^{\hat{S}_2\theta_2} \cdots e^{\hat{S}_7\theta_7}\; \hat{M}$$

where $$\hat{M}$$ is the tool pose at the zero configuration. The spatial Jacobian is built one column at a time by carrying each screw axis through the cumulative transform with the adjoint map, $$J_{s,i} = \mathrm{Ad}_{T_{i-1} } S_i$$.

---

## Resolved-motion rate control along each screw

ScLERP describes how the end effector should move, and resolved-motion rate control (RMRC) converts that into joint motion. The pose is written as a 7-vector $$\gamma = [p;\, Q]$$ (position and unit quaternion), and a representation Jacobian $$J_2(\gamma)$$ maps the rate of change of those coordinates to the spatial twist. Each iteration updates the joints as

$$\theta_{k+1} = \theta_k + \beta\, J_s^{+}(\theta_k)\, J_2(\gamma_k)\, \left(\gamma_{k+1} - \gamma_k\right)$$

with a step gain of $$\beta = 0.1$$ and a lightly damped pseudoinverse, $$J_s^{+} = J_s^T (J_s J_s^T + \lambda I)^{-1}$$, which stays stable near singular configurations of the 7-DOF arm.

Along each edge, the target moves forward through 20 ScLERP sub-poses, with up to 100 RMRC iterations allowed to converge. An edge is only accepted if the end effector ends up within 1 mm and 0.001 rad of the edge target. After every RMRC step, the new configuration is checked for self-collision between non-adjacent links and for collision between the robot meshes and the scene geometry, which is inflated by a 2 cm margin.

---

## Goal-directed RRT with screw-motion edges

A single screw motion from the start to the goal is often blocked, or the RMRC solution along it causes the arm to collide with itself. To get around this, the planner grows a tree of short screw-motion edges in task space:

1. Each expansion first tries to extend the newest untried node straight toward the goal. In open space, this lets the tree reach the target in only a few edges.
2. If that edge fails, up to 10 random targets are drawn from a spherical shell around the base (with an outer radius of 95% of the summed link lengths), and any points inside obstacles are thrown out.
3. The nearest node moves at most 5 cm toward the sample, and its orientation moves toward the goal orientation by the same fraction of the remaining distance. This spreads the rotation out over the whole path instead of leaving it all for the end.
4. ScLERP and RMRC then move the arm along the edge while running the collision checks described above. The joint-space segment between the parent and child nodes is also checked at 24 interpolated configurations.
5. When `use_rrt_star` is enabled, new nodes choose the lowest-cost collision-free parent within a 10 cm radius and rewire their neighbors, so the tree keeps shortening paths after the first solution is found.

Each node stores both its pose and the joint configuration that reached it. As a result, a path is a sequence of configurations the arm has actually reached, and no inverse kinematics is needed afterwards.

---

## Independent validation

If a planner only uses its own internal checks to report success, errors in those checks can go unnoticed. To avoid this, every path goes through a separate validation step after planning:

- Each edge is replayed and checked again at 240 configurations for self-collision, obstacle collision, and finite values.
- Joints 2, 4, and 6 of the Gen3 have hard limits (±2.24, ±2.57, and ±2.09 rad), and every playback configuration is checked against them.
- The final configuration is run through MuJoCo's own forward kinematics instead of my dual-quaternion FK, and the pose error is measured again.

A trial counts as reached if the planner gets within 1 mm and 0.001 rad of the goal. It only counts as fully validated if it also passes all of the checks above. Reporting both numbers makes it clear when a goal was reached but the motion would not be safe to run on the real arm.

---

## Benchmark

The headless benchmark runs reproducible, seeded trials. Trial *i* uses seed *i*, and the random streams for the goal, workspace, and expansion are reset for each trial. Random goals are generated by sampling joint configurations within the limits and running forward kinematics, so every goal has at least one valid, collision-free joint solution. Failed trials are kept in the results, and difficult goals are never replaced with easier ones. The trials run in parallel across eight workers.

| Condition | Trials | Goals reached | Fully validated | Median planning time | Median tree size |
| --- | ---: | ---: | ---: | ---: | ---: |
| Direct screw, free space | 1,000 | 83.6% | 71.7% | 501 ms | 2 nodes |
| Sampled RRT, free space | 1,000 | 99.1% | 58.6% | 108 ms | 16 nodes |
| Sampled RRT, obstacle scene 1 | 1,000 | 98.5% | 49.3% | 137 ms | 19 nodes |
| Sampled RRT, obstacle scene 2 | 1,000 | 97.8% | 62.4% | 102 ms | 15 nodes |
| Sampled RRT, obstacle scene 3 | 1,000 | 94.6% | 53.8% | 115 ms | 17 nodes |

*Planning time includes the planner's own collision checks, but not model loading, goal sampling, or the final validation step. The trials were run on a local workstation with eight parallel workers. The three obstacle scenes come from the benchmark's first set of scenes. The fixed tasks shown in the videos above were added later and have not had the full 1,000-trial run yet.*

### Discussion of results

Breaking the motion into short screw edges is what makes this approach practical. A single direct screw reaches 83.6% of the reachable goals, and all 164 of its failures were caused by the arm colliding with itself while following that one screw. With the tree, the planner can route around those configurations, which raised the completion rate to 99.1% and reduced the median planning time by more than 4×.

The obstacles did not slow the planner down much. Across the three obstacle scenes, it still reached 94.6–98.5% of goals with median planning times between 102 and 137 ms.

The final accuracy is set by the solver tolerance, and there does not appear to be any drift. The median final position error is 0.0026 mm, with an orientation error of about 5 × 10⁻⁶ rad. These values were measured with MuJoCo's own kinematics, which also shows that my dual-quaternion FK agrees with MuJoCo's model.

All 4,736 reached paths passed the 240-check-per-edge playback with no self-collisions or obstacle collisions.

### Next step: joint-limit-aware RMRC

The difference between the reached and fully validated rates comes from one cause. Every reached path is collision-free, and the only validation failures happen when joint 2, 4, or 6 goes past its hard limit partway through a path. The current RMRC update only uses the pseudoinverse and does not yet use the arm's redundant seventh degree of freedom to stay away from those limits. The next step is to project a joint-limit avoidance gradient into the Jacobian null space and to reject edges that go past the limits during planning instead of after it. Both of these changes fit into the existing `followEdge` loop.

---

## Code structure

The planner started as a single exploratory `main.cpp`, which is still kept in the repository's `legacy/` folder. I later restructured it into a library that the interactive viewer, the benchmark, and the tests all use:

| Module | Responsibility |
| --- | --- |
| `planner.cpp` | Dual-quaternion algebra, PoE forward kinematics, spatial Jacobian, RMRC, collision checkers, `MotionPlanner` API |
| `rrt_star.cpp` | Expansion sampling, nearest-node search, steering, RRT\* parent selection and rewiring |
| `sampler.cpp` | Workspace-shell and reachable-pose sampling, obstacle loading, scene keyframes |
| `benchmark.cpp` | Condition table, seeded trials, CSV reporting |
| `viewer.cpp` | MuJoCo / GLFW playback with start and goal markers |
| `planner_tests.cpp` | Scene validity, home-to-home planning, joint-limit detection, rotation-only goals |

Some of the design choices that ended up being the most useful were:

- `MotionPlanner::plan()` has no UI or file I/O, so the interactive app and the headless benchmark run exactly the same code. The viewer can also be compiled out with `-DBUILD_VIEWER=OFF`.
- Each environment is a MuJoCo XML file with optional `start` and `goal` keyframes, and the app lists every scene in the `environments/` folder when it launches. Adding a new task does not require any code changes.
- Along with the unit checks, the test suite rejects any fixed-task scene where the direct motion is not blocked by an obstacle. It also confirms that the validation step catches a joint-limit violation even when the final pose is correct.
- Every rejected edge is counted by its cause: self-collision, obstacle collision, swept-path collision, RMRC not converging, non-finite values, or no progress. This makes it much easier to figure out why a plan failed.

### Fixing an unexpected wrist spin

An early version of the planner reached its goal but then spun the wrist almost 360° before settling. The final pose was correct, but the motion was not. This turned out to be caused by two separate continuity problems. The first was quaternion double cover, where the planner interpolated toward $$-q$$ instead of $$q$$. The second was the redundant arm jumping between different inverse-kinematic solutions that reach the same pose. I fixed these by aligning the hemisphere everywhere a pose is differenced or interpolated, and by starting every edge from its parent's stored joint configuration so that consecutive nodes stay on the same solution. Both of these rules are still what keeps the planner's motion smooth.

---

## Related lab work

Along with the planner, I build and tune C++ / MuJoCo test cases for FLIQC, a third-party optimization-based obstacle-avoidance controller ([`hwyao/FLIQC_controller_core`](https://github.com/hwyao/FLIQC_controller_core)), on the same Gen3 arm. My work on it is the integration. I added a 6-DOF damped-least-squares RMRC guide velocity, extended the distance constraints from two links to all seven, added null-space posture control that turns off during avoidance, and retuned the controller's activation band to remove an oscillation near obstacles.

---

## Summary

- Built a C++ task-space planner where the RRT edges are dual-quaternion screw motions tracked with resolved-motion rate control. All of the algebra, kinematics, and search code was written from scratch on top of Eigen.
- Raised free-space goal completion from 83.6% to 99.1% compared to a single direct screw, with a 108 ms median planning time.
- Reached 94.6–98.5% completion across three obstacle scenes, with no collisions in 4,736 reached paths under independent validation.
- Reached a 0.0026 mm median final position error, checked against MuJoCo's own kinematics.
- Set up a reproducible 5,000-trial benchmark that separates reached goals from fully validated ones, which identified joint-limit-aware RMRC as the next step.
