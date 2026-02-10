---
layout: project
title: Baja SAE Vehicle Dynamics
description: Designing and simulating suspension geometry for off-road racing.
tags: [SolidWorks, Python, MATLAB]
---

## Objective
As the Vehicle Dynamics Lead, I am in charge of the Brakes, Steering, and Suspension subsystems. Together, they all let the driver finely control the power coming from the engine and transmitted through the powertrain system. For this year, my main focus was on redesigning the suspension to be stronger and more ideal kinematically. Notably, our aluminum A-arms from the 2025 car failed during the endurance race which ended our run.

---

## The Main Goals

* Redesign the suspension system
    * Make all of the links stronger with minimal weight increase
    * Change the kinematics of the suspension to promote better steering (ex. diving while cornering)
* Improve overall steering performance
    * Change to 60% Ackermann
    * Reinforce tie rods and steering rack
    * Update the steering and suspension instant center curves to better preserve itself throughout the motion
    * Minimize bump steer

---

## Methodology

1. **Geometric Optimization:** Used a sequence of complex SolidWorks sketches to accurately model suspension throughout motion given manual parameters. Used Python and MATLAB to verify.
2. **FEA Validation:** Ran individual FEA on the control arms and the tabs holding them to validate against last year’s design.
3. **Manufacturing:** Greatly improved the control arm jig and manufacturing process to produce much more accurate, lower-tolerance control arms.

---

## Results

* 10% steering angle increase
* Achieved nearly zero bump steer throughout the entire suspension motion
* 33% reduction in turning radius
* Individual suspension components were 286% stronger while being less than a pound heavier


![Machining with a 4 Jaw Chuck](/assets/4%20jaw%20chuck.mp4){: width="500" }
![FEA Stress Analysis](/assets/lathebushing.jpg){: width="500" }

