---
layout: project
title: "RRT Planner Enhancement Benchmark"
category_label: Motion planning · Benchmark study
description: "I extended my single-tree RRT planner with extra search trees, biased sampling, and new node-expansion rules, then tested nine variants across five environments with ten seeds each. The 450 runs showed which changes helped, which ones failed completely, and which combination solved every environment."
timeline: "Spring 2026"
tags: [Python, NumPy, Matplotlib, RRT, RRT-Connect, Sampling Strategies, Benchmark Design, Configuration Space]
hero_image: /assets/rrt_e5_combined_v2.png
hero_alt: "Bug-trap environment: a blue tree grows from a start point inside a C-shaped obstacle, out through its open side and around the bottom, meeting a red tree grown from the goal. A dark smoothed path connects start to goal."
hero_caption: "The final combined planner in the bug-trap environment (E5). The start tree (blue) grows out of the open side of the trap while the goal tree (red) grows back to meet it. The navy line is the raw RRT path and the black line is the path after shortcut smoothing (46.6 m to 36.2 m)."
related:
  - title: "Screw-motion planner (research)"
    url: /projects/motion-planner.html
---

## Motivation

There are a large number of proposed improvements to the Rapidly-exploring Random Tree (RRT) planner, such as adding more trees, biasing where samples are drawn, and changing which node the tree grows from. These are usually tested one at a time on environments where they are expected to do well. For this project, I wanted to test several of these enhancements under the same conditions to see where each one helps, where it fails, and whether combining them actually improves the planner.

## Setup

The robot is modeled as a disc with a 0.5 m radius in a 30 × 20 m workspace. The obstacles are axis-aligned rectangles and circles, and each one is inflated by the robot radius (a Minkowski sum) so the planner only has to plan for a point in configuration space. Since the robot is round, its orientation does not affect collisions and was left out of the configuration space.

The starting point was my own single-tree RRT, which uses uniform sampling with a 5% goal bias, nearest-neighbor expansion, and a fixed 0.6 m step size. Each enhancement was written as a modular add-on to the same planner class instead of a separate implementation, so any difference in the results comes from the algorithm itself. The enhancements fall into three groups:

| Category | Options |
| --- | --- |
| Number of trees | 1 (baseline) · 2 (bidirectional, similar to RRT-Connect) · 3 (adds a tree at the start–goal midpoint, connected using a union-find structure) |
| Sampling | Uniform · corridor-biased (Gaussian samples with σ = 2.5 m around the start–goal line) · obstacle-aware (35% of samples near anchor points just outside each obstacle, 65% uniform) |
| Expansion | Nearest neighbor · cost-weighted (best of the 8 nearest nodes by distance + 0.3 × path cost) · Voronoi-bias frontier (30% of the time, grow from the nodes with the fewest children) |

I made five test environments to target different ways the planner could fail: E1 sparse, E2 narrow corridors, E3 maze, E4 cluttered, and E5 bug-trap. Nine algorithms were each run on all five environments with ten seeds, for a total of 450 runs. Every successful path was shortcut-smoothed for 300 iterations, and each run recorded success, runtime, iterations, tree nodes, and raw and smoothed path length.

<div class="metric-grid">
  <div class="metric"><strong>450</strong><span>seeded runs</span></div>
  <div class="metric"><strong>9 × 5</strong><span>algorithms × environments</span></div>
  <div class="metric"><strong>100%</strong><span>success on all five environments for the final combined planner</span></div>
</div>

<figure class="figure-single">
  <img src="{{ '/assets/rrt_success_rate.png' | relative_url }}" alt="Heatmap of success rate for nine algorithms across five environments. All cells are 100% except Corridor_Sample at 0% on E3 and E5, and Combined_Best at 80% on E2 and 0% on E3 and E5." loading="lazy" decoding="async">
  <figcaption>Success rate for each algorithm and environment over 10 seeds. Seven of the nine planners solved every environment, and both of the planners that failed used corridor-biased sampling.</figcaption>
</figure>

---

## Results by enhancement

### Multiple trees

Adding a second tree that grows from the goal never lowered the success rate. In the sparse environment it used about a third fewer nodes than the baseline (154 vs. 238), and it was faster than the baseline in most of the environments. The maze was the exception. There, the only route follows the outer edge of the workspace, so both trees have to travel a long distance before they can meet.

<div class="figure-grid">
  <figure>
    <img src="{{ '/assets/rrt_e3_bidirectional.png' | relative_url }}" alt="Maze environment with a blue start tree and red goal tree joined along the bottom edge of the workspace." loading="lazy" decoding="async">
    <figcaption>E3 maze with two trees. The path follows the edge of the workspace, so the two trees do not split the search evenly.</figcaption>
  </figure>
  <figure>
    <img src="{{ '/assets/rrt_e4_multi_tree.png' | relative_url }}" alt="Cluttered environment of circular obstacles, with blue, green, and red trees joined into one path from left to right." loading="lazy" decoding="async">
    <figcaption>E4 cluttered with three trees. The midpoint tree (green) starts inside the obstacle field and connects to both of the other trees quickly.</figcaption>
  </figure>
</div>

The third tree was only a clear improvement in the cluttered environment, where it cut the runtime roughly in half compared to the baseline and used 206 iterations instead of 476. In the other environments it was usually slower than using two trees, since the middle tree has to pass through the same narrow gaps and also needs to connect at both ends. More trees did not automatically lead to a better planner.

### Sampling

Corridor-biased sampling places most of its samples close to the straight line between the start and the goal. This works well when that line is mostly clear, but it had a 0% success rate in both the maze and the bug-trap. In those environments the path has to pass through regions that the sampler almost never draws from. In the bug-trap, the tree filled the inside of the trap with more than 3,000 nodes and never found the way out.

<figure class="figure-single">
  <img src="{{ '/assets/rrt_e5_corridor_failed.png' | relative_url }}" alt="Bug-trap environment where a dense blue tree fills the inside of a C-shaped obstacle and never escapes; no path reaches the goal." loading="lazy" decoding="async">
  <figcaption>E5 bug-trap with corridor sampling (failed). The samples stay concentrated against the back wall of the trap, in line with the goal, until the 10,000-iteration cap is reached.</figcaption>
</figure>

Obstacle-aware sampling draws 35% of its samples near the corners and edges of obstacles and the other 65% uniformly. The uniform part keeps the whole workspace covered, and as a result it matched or beat the baseline in every environment. In the bug-trap it gave shorter smoothed paths (34.5 m vs. 36.5 m) while using fewer nodes (650 vs. 790).

### Expansion

The expansion heuristics had a fairly small effect in 2D. Cost-weighted expansion produced shorter raw paths in the harder environments, but most of that difference went away after smoothing. It also took up to about 3× the runtime and used twice as many nodes as the baseline in the bug-trap. Voronoi-bias expansion stayed close to the baseline and added very little overhead.

<div class="figure-grid">
  <figure>
    <img src="{{ '/assets/rrt_runtime.png' | relative_url }}" alt="Grouped bar chart of mean runtime on a log scale for nine algorithms in five environments. Corridor_Sample and Combined_Best are an order of magnitude slower on E3 and E5." loading="lazy" decoding="async">
    <figcaption>Mean runtime (log scale). Runs that fail use the entire iteration cap, which is why the corridor-based planners take much longer in E3 and E5.</figcaption>
  </figure>
  <figure>
    <img src="{{ '/assets/rrt_nodes.png' | relative_url }}" alt="Grouped bar chart of mean tree nodes per run. Corridor_Sample and Combined_Best use thousands of nodes in E3 and E5; the final combined planner is among the lowest in every environment." loading="lazy" decoding="async">
    <figcaption>Mean tree nodes per run, which gives a rough idea of how much searching each planner needed.</figcaption>
  </figure>
</div>

---

## Combining the enhancements

The first combined planner was chosen before running any benchmarks. I picked the option from each category that seemed strongest based on the literature: two trees, corridor sampling, and cost-weighted expansion. This ended up being the worst of all nine planners. It had a 0% success rate on the maze and bug-trap and 80% on the corridor environment, mostly because it inherited the same problem as the corridor sampler.

<figure class="figure-single">
  <img src="{{ '/assets/rrt_e2_combined_best.png' | relative_url }}" alt="Corridor environment where a small blue start tree and a large dense red goal tree fill most of the right half before connecting." loading="lazy" decoding="async">
  <figcaption>E2 corridors with the first combined planner. Even in this successful run it needed 1,500 nodes, more than three times the baseline's average of 422.</figcaption>
</figure>

For the second combined planner, I used the per-category results to choose each part. Each enhancement had to meet three conditions: it could not lower the success rate, it had to keep the whole workspace reachable by the sampler, and it could only add a small amount of cost per iteration. This led to two trees, obstacle-aware sampling, and Voronoi-bias expansion. The revised planner reached 100% success on all five environments. It used the fewest tree nodes of any planner in three of the five environments (108, 321, and 544 nodes in E1, E2, and E5), and it was the fastest planner in the sparse environment. Its smoothed paths were the shortest in the maze and the bug-trap and within about 2% of the shortest path in the other environments. The one drawback was the maze, where it took about 1.5× the baseline's runtime. This comes from the bidirectional search, which had the same issue on its own.

<div class="figure-grid">
  <figure>
    <img src="{{ '/assets/rrt_e4_combined_v2.png' | relative_url }}" alt="Cluttered environment with a sparse blue tree and red tree joined by a nearly straight smoothed path through the obstacles." loading="lazy" decoding="async">
    <figcaption>E4 cluttered with the final combined planner: 180 nodes and a 27.6 m smoothed path.</figcaption>
  </figure>
  <figure>
    <img src="{{ '/assets/rrt_path_length.png' | relative_url }}" alt="Grouped bar chart of mean smoothed path length per environment, with most planners within a few metres of each other and missing bars where planners failed." loading="lazy" decoding="async">
    <figcaption>Mean smoothed path length. After smoothing, all of the successful planners end up within a few meters of each other. Missing bars are environments that a planner never solved.</figcaption>
  </figure>
</div>

The main thing I learned from comparing the two combined planners is that the enhancements are not independent of one another. A sampling bias that is fast in some environments but cannot reach parts of the workspace will cause the whole combined planner to fail in those environments. Keeping full sampling coverage turned out to be the most important requirement when choosing parts for a combined planner.

---

## Path-stitching bug

The three-tree planner builds its final path by entering each tree at one connection node and leaving it at another. In an early version, the entry and exit nodes were swapped. This produced paths that were actually disconnected, but they still looked correct after smoothing closed the gap. I found the problem by adding a check that every returned path starts at the start point and ends at the goal. Since then I have added this kind of end-to-end check to all of my benchmarks, including the one for my research planner.

---

## Next steps

- Informed RRT\* uses ellipsoidal sampling, which would likely work much better than the corridor sampler. It only focuses the samples after a first path has been found, so the initial search still keeps uniform coverage.
- More complex or higher-dimensional problems would likely show a larger difference between the expansion heuristics. In a 2D room with a few thousand nodes, the Voronoi bias that comes from nearest-neighbor selection already seems to be enough.

## Connection to my research

This study fed into my [screw-motion planner for the Kinova Gen3]({{ '/projects/motion-planner.html' | relative_url }}). Based on these results, bidirectional growth and obstacle-aware sampling were the first enhancements I considered porting to SE(3). It also argued against corridor sampling, since a straight line in the workspace rarely corresponds to a feasible joint-space path for a redundant arm.

References: Kuffner & LaValle, RRT-Connect (2000); Amato et al., OBPRM (1998); Karaman & Frazzoli, RRT\* (2011); Gammell et al., Informed RRT\* (2014); LaValle, *Planning Algorithms* (2006).
