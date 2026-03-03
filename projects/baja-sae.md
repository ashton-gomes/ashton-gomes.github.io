---
layout: project
title: Baja SAE Vehicle Dynamics
description: Designing and simulating suspension geometry for off-road racing.
tags: [SolidWorks, Python, MATLAB]
---

## **Objective** 
As the Vehicle Dynamics Lead, I am in charge of the Brakes, Steering, and Suspension subsystems. Together, they all let the driver finely control the power coming from the engine and transmitted through the powertrain system. For this year, my main focus was on redesigning the suspension to be stronger and more ideal kinematically. Notably, our aluminum A-arms from the 2025 car failed during the endurance race which ended our run.
<br><br>

## **The Main Goals** 
* **Redesign the suspension system**
    * Make all of the links stronger with minimal weight increase
    * Change the kinematics of the suspension to promote better steering (ex. diving while cornering)
* **Improve overall steering performance**
    * Change to 60% Ackermann
    * Reinforce tie rods and steering rack
    * Update the steering and suspension instant center curves to better preserve itself throughout the motion
    * Minimize bump steer


## **Methodology** 

* **Geometric Optimization:** Used a sequence of complex SolidWorks sketches to accurately model suspension throughout motion given manual parameters. Used Python and MATLAB to verify.
* **FEA Validation:** Ran individual FEA on the control arms and the tabs holding them to validate against last year’s design.
* **Manufacturing:** Greatly improved the control arm jig and manufacturing process to produce much more accurate, lower-tolerance control arms.


## **Results** 
* 10% steering angle increase
* Achieved nearly zero bump steer throughout the entire suspension motion
* 33% reduction in turning radius
* Individual suspension components were 286% stronger while being less than a pound heavier

# Some images of the CAD and Design Process:
![Full Assembly Model](/assets/FullAssembly2526.jpg)
* Here, the full model of the car seen. This includes most of the major components except for outer body panels and such. The car is still currently being fabricated, and I will post more images then.

![FEA Stress Analysis](/assets/suspension_geometry.jpg)
* Here is one of the images of my suspension geometry I calculated and drafted. There are a lot of individual parts that go into it, such as picking the correct values and curves to give the kinematic response I want. In this case, you can see that most of the design stems from the instant center points picked that go off towards the top of the image. 

* The following are some images and videos of my fabrication that I had, in particular lathing bushings to a fraction of a thou (0.0005 inches)

<br><br>
<video width="500" controls> 
  <source src="/assets/4%20jaw%20chuck.mp4" type="video/mp4">
</video>
<br><br>

![FEA Stress Analysis](/assets/lathebushing.jpg){: width="500" }

