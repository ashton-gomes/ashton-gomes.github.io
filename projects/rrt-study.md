---
layout: project
title: "RRT Planner Enhancement Benchmark"
category_label: Motion planning · Benchmark study
description: "My single-tree RRT planner, extended with extra search trees, biased sampling, and new node-expansion rules, then tested across nine variants, five environments, and ten seeds each. The 450 runs showed which enhancements help, which fail outright, and how to combine them into a planner that solved every environment."
timeline: "Spring 2026"
tags: [Python, NumPy, Matplotlib, RRT, RRT-Connect, Sampling Strategies, Benchmark Design, Configuration Space]
hero_image: /assets/rrt_e5_combined_v2.png
hero_alt: "Bug-trap environment: a blue tree grows from a start point inside a C-shaped obstacle, out through its open side and around the bottom, meeting a red tree grown from the goal. A dark smoothed path connects start to goal."
hero_caption: "The final combined planner escaping the bug-trap (E5): the start tree (blue) works out of the trap's open side while the goal tree (red) grows back to meet it. The navy line is the raw RRT path; black is the path after shortcut smoothing (46.6 m → 36.2 m)."
related:
  - title: "Screw-motion planner (research)"
    url: /projects/motion-planner.html
---

## The question

The RRT literature proposes dozens of "improvements": more trees, smarter sampling, cleverer expansion. Each is usually tested on its own, on environments that suit it. I wanted to know which enhancements help, where they break, and whether good ones can be **combined** safely. I also wanted the answer to come from controlled data rather than from intuition.

## Setup

A disc-shaped robot (0.5 m radius) plans in a **30 × 20 m** workspace. Obstacles are axis-aligned rectangles and circles, inflated by the robot radius (a Minkowski sum), so the planner works with a point in configuration space. Orientation is dropped, a standard simplification for geometric planning with a round robot.

The starting point was my own single-tree RRT: uniform sampling with a 5% goal bias, nearest-neighbour expansion, and a fixed 0.6 m step. Every enhancement was written as a **modular add-on to one planner class**, so each variant runs through the same code path and differences come from the algorithm, not the implementation. Variants span three independent axes:

| Axis | Options |
| --- | --- |
| Number of trees | 1 (baseline) · 2 (bidirectional, RRT-Connect style) · 3 (adds a tree at the start–goal midpoint, joined with a union-find) |
| Sampling | Uniform · corridor-biased (Gaussian tube, σ = 2.5 m, around the start–goal line) · obstacle-aware (35% of samples near anchors just outside each obstacle, 65% uniform) |
| Expansion | Nearest neighbour · cost-weighted (best of 8 neighbours by distance + 0.3 × path cost) · Voronoi-bias frontier (30% of the time, grow from the least-expanded nodes) |

Five environments were designed to stress different failure modes: **E1 sparse, E2 narrow corridors, E3 maze, E4 cluttered, E5 bug-trap**. The benchmark is **9 algorithms × 5 environments × 10 seeds = 450 runs**, with every successful path shortcut-smoothed (300 iterations) and logged for success, runtime, iterations, tree nodes, and raw and smoothed path length.

<div class="metric-grid">
  <div class="metric"><strong>450</strong><span>seeded runs</span></div>
  <div class="metric"><strong>9 × 5</strong><span>algorithms × environments</span></div>
  <div class="metric"><strong>100%</strong><span>success on all five environments for the final data-driven combination</span></div>
</div>

<figure class="figure-single">
  <img src="{{ '/assets/rrt_success_rate.png' | relative_url }}" alt="Heatmap of success rate for nine algorithms across five environments. All cells are 100% except Corridor_Sample at 0% on E3 and E5, and Combined_Best at 80% on E2 and 0% on E3 and E5." loading="lazy" decoding="async">
  <figcaption><strong>Success rate, 10 seeds per cell.</strong> Seven of nine planners solved every environment. The two failures share one component: corridor-biased sampling.</figcaption>
</figure>

---

## Findings

**Bidirectional search is a safe default.** Growing a second tree from the goal never reduced success, cut tree size by about a third in the sparse environment (154 vs. 238 nodes), and was faster than the baseline in most environments. Its weak spot is the maze, where the only route runs along the outer edge and both trees must travel far to meet.

<div class="figure-grid">
  <figure>
    <img src="{{ '/assets/rrt_e3_bidirectional.png' | relative_url }}" alt="Maze environment with a blue start tree and red goal tree joined along the bottom edge of the workspace." loading="lazy" decoding="async">
    <figcaption><strong>E3 maze, bidirectional.</strong> The real route hugs the workspace boundary, so the trees split the work less evenly.</figcaption>
  </figure>
  <figure>
    <img src="{{ '/assets/rrt_e4_multi_tree.png' | relative_url }}" alt="Cluttered environment of circular obstacles, with blue, green, and red trees joined into one path from left to right." loading="lazy" decoding="async">
    <figcaption><strong>E4 cluttered, three trees.</strong> The midpoint tree (green) sits inside the obstacle field and links both ends quickly.</figcaption>
  </figure>
</div>

**A third tree helps only in clutter.** In the cluttered environment the midpoint tree roughly halved runtime against the baseline, using 206 iterations instead of 476. Elsewhere it was usually slower than two trees, since the middle tree must squeeze through the same gaps and connect at both ends. More trees is not automatically better.

**Corridor sampling is a trap.** Concentrating samples around the straight start–goal line works when that line is nearly clear. It scored **0% success in the maze and the bug-trap**, because it puts almost no samples in the regions the path has to pass through. In the bug-trap, the tree filled the pocket with more than 3,000 nodes and never found the way out.

<figure class="figure-single">
  <img src="{{ '/assets/rrt_e5_corridor_failed.png' | relative_url }}" alt="Bug-trap environment where a dense blue tree fills the inside of a C-shaped obstacle and never escapes; no path reaches the goal." loading="lazy" decoding="async">
  <figcaption><strong>E5 bug-trap, corridor sampling (failed).</strong> Samples pile up against the back wall of the trap, in line with the goal, until the 10,000-iteration cap.</figcaption>
</figure>

**Obstacle-aware sampling is the sampler that helps everywhere.** Sampling near obstacle corners and edges, with a 65% uniform fallback that keeps the whole space covered, matched or beat the baseline throughout. In the bug-trap it gave shorter smoothed paths (34.5 m vs. 36.5 m) with fewer nodes (650 vs. 790).

**Expansion heuristics matter little in 2D.** Cost-weighted expansion produced shorter raw paths in the harder environments, but the difference largely disappeared after smoothing, and it cost up to about 3× the runtime (twice the nodes in the bug-trap). Voronoi-bias expansion stayed close to the baseline at very little overhead.

<div class="figure-grid">
  <figure>
    <img src="{{ '/assets/rrt_runtime.png' | relative_url }}" alt="Grouped bar chart of mean runtime on a log scale for nine algorithms in five environments. Corridor_Sample and Combined_Best are an order of magnitude slower on E3 and E5." loading="lazy" decoding="async">
    <figcaption><strong>Mean runtime (log scale).</strong> Failed runs exhaust the iteration cap, which is why the corridor-based planners tower over the rest in E3 and E5.</figcaption>
  </figure>
  <figure>
    <img src="{{ '/assets/rrt_nodes.png' | relative_url }}" alt="Grouped bar chart of mean tree nodes per run. Corridor_Sample and Combined_Best use thousands of nodes in E3 and E5; the final combined planner is among the lowest in every environment." loading="lazy" decoding="async">
    <figcaption><strong>Mean tree nodes per run.</strong> A rough measure of how much searching each planner had to do.</figcaption>
  </figure>
</div>

---

## Combining enhancements

**The "best on paper" combination came last.** Before running any benchmarks, I picked the option on each axis with the strongest case from the literature: two trees, corridor sampling, and cost-weighted expansion. It scored **0% on the maze and bug-trap and 80% on the corridor environment**, the weakest result of all nine planners, because it inherited the corridor sampler's blind spot.

<figure class="figure-single">
  <img src="{{ '/assets/rrt_e2_combined_best.png' | relative_url }}" alt="Corridor environment where a small blue start tree and a large dense red goal tree fill most of the right half before connecting." loading="lazy" decoding="async">
  <figcaption><strong>E2 corridors, first combination.</strong> Even when it succeeds, it needs 1,500 nodes, more than three times the baseline's average of 422.</figcaption>
</figure>

**A data-driven combination works.** For the second version, each piece had to pass three tests from the per-axis results: it never lowers success, it keeps the full space reachable, and its per-iteration cost stays small. That selected **two trees + obstacle-aware sampling + Voronoi-bias expansion**, which reached **100% success on all five environments**. It used the fewest tree nodes of any planner in three of the five (108, 321, and 544 nodes in E1, E2, and E5), was the fastest planner in the sparse environment, and its smoothed paths were the shortest in the maze and bug-trap and within about 2% of the best elsewhere. Its one trade-off was the maze, where it took about 1.5× the baseline's runtime, inherited from the bidirectional search.

<div class="figure-grid">
  <figure>
    <img src="{{ '/assets/rrt_e4_combined_v2.png' | relative_url }}" alt="Cluttered environment with a sparse blue tree and red tree joined by a nearly straight smoothed path through the obstacles." loading="lazy" decoding="async">
    <figcaption><strong>E4 cluttered, final combination.</strong> 180 nodes, smoothed path 27.6 m.</figcaption>
  </figure>
  <figure>
    <img src="{{ '/assets/rrt_path_length.png' | relative_url }}" alt="Grouped bar chart of mean smoothed path length per environment, with most planners within a few metres of each other and missing bars where planners failed." loading="lazy" decoding="async">
    <figcaption><strong>Mean smoothed path length.</strong> After smoothing, every successful planner lands within a few metres; gaps are environments a planner never solved.</figcaption>
  </figure>
</div>

<div class="callout" markdown="1">
**The rule I took away:** a component should only enter a combined planner if it *keeps sampling coverage on its own*. A bias that is fast where it works but collapses where it doesn't will drag the whole combination down with it.
</div>

---

## A bug worth catching

The three-tree planner stitches its final path across trees, entering each tree at one connection node and leaving at another. An early version swapped those entry and exit nodes, which produced paths that were geometrically disconnected but **looked correct after smoothing** closed the gap. I found it by adding an end-to-end check that every returned path actually starts at the start and ends at the goal. Since then I build that kind of whole-output check into every benchmark, including my research planner.

---

## Next steps

- **Informed (ellipsoidal) sampling** from Informed RRT\* is the natural replacement for the corridor sampler: it focuses samples only after a first path is found, so the initial search keeps uniform coverage.
- **Higher-dimensional problems** should separate the expansion heuristics more clearly, since the natural Voronoi bias of nearest-neighbour selection is already enough in a 2D room with a few thousand nodes.

## From 2D study to 7-DOF research

The study fed directly into my [screw-motion planner for the Kinova Gen3]({{ '/projects/motion-planner.html' | relative_url }}). It pointed to bidirectional growth and obstacle-aware sampling as the first enhancements worth porting to SE(3), and it argued against corridor sampling, since a straight line in the workspace rarely corresponds to a feasible joint-space path for a redundant arm.

**References:** Kuffner & LaValle, RRT-Connect (2000); Amato et al., OBPRM (1998); Karaman & Frazzoli, RRT\* (2011); Gammell et al., Informed RRT\* (2014); LaValle, *Planning Algorithms* (2006).
