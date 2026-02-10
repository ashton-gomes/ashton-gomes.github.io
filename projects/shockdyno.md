---
layout: project
title: Custom Scotch Yoke Shock Dynamometer
description: Design and fabrication of a custom dynamometer for objective suspension tuning and characterization.
tags: [Mechanical Design, Vehicle Dynamics, DAQ, Controls]
github_link: "#"
---

## **Problem Statement**
In off-road racing, vehicles frequently utilize over 12 inches of suspension travel to absorb high-velocity impacts. Relying on subjective "driver feel" for tuning is insufficient for managing such complex dynamics. This project focused on building a tool to generate objective data, allowing for precise damping characterization and optimization of suspension performance.

## **System Design & Controls**
To achieve repeatable and accurate data, a custom dynamometer was engineered from the ground up.


1.  **Mechanical Architecture:** Designed a **Scotch Yoke mechanism** to convert rotary motion into perfect sinusoidal linear motion. The system was engineered to deliver a peak velocity of **18 in/s** over a **4-inch stroke**, simulating realistic suspension velocities encountered on the trail.
2.  **Power & Control:** Developed the power transmission system utilizing a high-torque **AC motor** driven by a **Variable Frequency Drive (VFD)**.
3.  **Data Acquisition:** Integrated a load cell and position sensor DAQ system to capture real-time force and velocity data during actuation.


## **Results**
* Enabled the generation of precise **Force-Velocity (FV) curves**, replacing guesswork with quantifiable metrics.
* Allowed for the isolation and tuning of compression and rebound damping circuits to maximize tire contact and vehicle stability in rough terrain.
* Validated the system's capability to run variable velocity profiles for comprehensive shock analysis.