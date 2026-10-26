---
layout: project
title: "What Actually Makes RRT Better? A 450-Run Study"
category_label: Motion planning · Course final project
description: "One unified Python planner, nine RRT variants, five environments, ten seeds each. The data showed which enhancements help, which fail outright, and how to combine them into a planner that solved every environment."
timeline: "Spring 2026"
tags: [Python, NumPy, Matplotlib, RRT, RRT-Connect, Sampling Strategies, Benchmark Design, Configuration Space]
hero_image: /assets/rrt_study_tree.svg
hero_alt: "Illustration of a bidirectional RRT: a blue tree from the start and an orange tree from the goal growing around dark obstacles until they connect."
hero_caption: "Bidirectional growth: one tree from the start (blue) and one from the goal (orange), joined into a single path around inflated obstacles. Illustrative example."
related:
  - title: "Screw-motion planner (research)"
    url: /projects/motion-planner.html
---

## The question

The RRT literature proposes dozens of "improvements": more trees, smarter sampling, cleverer expansion. Papers usually test each one in isolation, on environments chosen to flatter it. I wanted to know which enhancements actually help, where they break, and whether good ones can be **combined** safely. I also wanted the answer to come from controlled data rather than from intuition.

## Setup

A disk-shaped differential-drive robot (0.5 m radius) plans in a **30 × 20 m** workspace. Obstacles are inflated by the robot radius (a Minkowski sum), so planning is for a point in configuration space; orientation is dropped, a standard simplification for geometric planning.

Every variant runs through **one unified planner class**, configured by parameters, so every comparison uses the same code path and differences come from the algorithm, not the implementation. Variants span three independent axes:

| Axis | Options |
| --- | --- |
| Number of trees | 1 (unidirectional) · 2 (bidirectional, RRT-Connect style) · 3 (multi-tree with a midpoint seed) |
| Sampling | Uniform · corridor-biased (a tube around the start–goal line) · obstacle-aware (near obstacle boundaries, with uniform fallback) |
| Expansion | Nearest neighbour · cost-weighted · Voronoi-bias frontier |

Five environments were designed to stress different failure modes: **E1 sparse, E2 narrow corridor, E3 maze, E4 cluttered, E5 bug-trap**. The benchmark is **9 algorithms × 5 environments × 10 seeds = 450 runs**, producing 42 figures and a full results CSV.

<div class="metric-grid">
  <div class="metric"><strong>450</strong><span>seeded runs</span></div>
  <div class="metric"><strong>9 × 5</strong><span>algorithms × environments</span></div>
  <div class="metric"><strong>100%</strong><span>success on all five environments for the final data-driven combination</span></div>
</div>

---

## Findings

**Corridor sampling is a trap.** Biasing samples toward the straight start–goal line made it the fastest single-tree planner in the narrow-corridor environment. It also scored **0% success in the maze and the bug-trap**. In the bug-trap, 1,239 nodes piled up inside the pocket while the planner kept sampling toward a goal it could not reach directly.

**Obstacle-aware sampling is safe.** Sampling near obstacle boundaries matched or beat the baseline everywhere, because its uniform fallback (65% of samples) preserves coverage of the whole space.

**Expansion heuristics barely matter.** Cost-weighted expansion produced 5–8% shorter raw paths in the harder environments at 1.5–3.4× the runtime, and the advantage disappeared after path smoothing. Voronoi-bias expansion was within noise of the baseline.

**Naively combining the "best" pieces fails.** Combining the individually fastest choices (bidirectional + corridor sampling + cost-weighted expansion) scored **0% on the maze and bug-trap** and 80% on the corridor. It inherited the corridor sampler's blind spot.

**A data-driven combination works.** Choosing pieces by robustness instead (bidirectional trees + obstacle-aware sampling + Voronoi-bias expansion) reached **100% success on all five environments**, with the fewest tree nodes in four of five (108, 321, 429, 176, and 544 nodes for E1–E5). Its one cost was the maze, where it took 116.6 ms against the baseline's 73.6 ms, a trade-off inherited from the bidirectional search.

<div class="callout" markdown="1">
**The rule I took away:** a component should only enter a combined planner if it *preserves sampling coverage on its own*. A bias that is fast where it works but collapses where it doesn't will drag the whole combination down with it.
</div>

---

## A bug worth catching

The three-tree planner's path-stitching swapped the exit and entry node indices where trees met. The result was paths that were geometrically disconnected but **looked correct after smoothing** collapsed the gap. I found it by adding an end-to-end check that every returned path actually starts at the start and ends at the goal. Since then I build that kind of whole-output sanity check into every benchmark, including my research planner.

---

## From 2D study to 7-DOF research

The study fed directly into my [screw-motion planner for the Kinova Gen3]({{ '/projects/motion-planner.html' | relative_url }}). It pointed to bidirectional growth and obstacle-aware sampling as the first enhancements worth porting to SE(3), and it argued against corridor sampling, since a straight line in the workspace rarely corresponds to a feasible joint-space path for a redundant arm.

**References:** Kuffner & LaValle, RRT-Connect (2000); Amato et al., OBPRM (1998); Karaman & Frazzoli, RRT* (2011); Gammell et al., Informed RRT* (2014); LaValle, *Planning Algorithms* (2006).
