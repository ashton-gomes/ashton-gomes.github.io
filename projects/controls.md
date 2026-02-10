---
layout: project
title: Feedback Control System
description: PID controller implementation and stability analysis.
tags: [Controls, Simulink, MATLAB]
github_link: "#"
---

## **Overview**
Designed a closed-loop control system to precisely regulate the position of a DC motor under varying load disturbances.


## **Control Strategy**
* **System Modeling:** Derived the transfer function of the DC motor based on electromechanical constants.
* **PID Tuning:** Used the Ziegler-Nichols method to determine initial PID gains ($K_p, K_i, K_d$) and fine-tuned them using MATLAB.
* **Stability Analysis:** Verified system stability using Bode plots and Nyquist criteria to ensure sufficient phase margin.


## **Performance**
* Reduced settling time to under 200ms.
* Eliminated steady-state error using the integral term.
* Maintained stability with <5% overshoot.

![PID Controller](/assets/PIDcontroller.jpg){: width="500" }