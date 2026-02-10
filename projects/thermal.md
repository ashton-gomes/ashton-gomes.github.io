---
layout: project
title: Finned Phone Case Thermal Analysis
description: Comparative thermal analysis of finned vs. standard TPU phone cases using SolidWorks CFD and analytical modeling.
tags: [Heat Transfer, SolidWorks, Excel, CFD]
github_link: "#"
---

### Problem Statement
Modern mobile devices generate significant heat during high-load operations, and standard protective cases often act as insulators, exacerbating thermal throttling. This study investigated whether adding geometric fins to a phone case could significantly improve heat dissipation compared to a standard TPU design.

### Analysis & Simulation
To evaluate the effectiveness of the proposed design, a comparative study was conducted using both computational fluid dynamics and analytical modeling.

1.  **Experimental Setup:** Modeled two distinct scenarios:
    * **Forced Convection:** A setup utilizing a fan with a known airflow rate to simulate active cooling or windy environments.
    * **Natural Convection:** A static setup to model typical passive cooling in still air.
2.  **CFD Simulation:** Performed simple CFD analysis within SolidWorks to simulate airflow over both the standard TPU case and the custom finned design.
3.  **Analytical Validation:** Conducted extensive heat transfer calculations in Excel. These calculations used empirical correlations for flow over flat plates and finned surfaces to validate the CFD results and provide a robust mathematical model of the system's thermal resistance.

### Results
The addition of fins provided a significant increase in surface area and turbulence, leading to measurable cooling improvements in both test scenarios:

* **Forced Convection:** The finned case demonstrated a 46% improvement in heat transfer efficiency compared to the standard TPU case.
* **Natural Convection:** Under passive cooling conditions, the finned design yielded a 12% improvement.
* **Model Correlation:** The SolidWorks CFD results showed strong agreement with the Excel-based analytical heat transfer models, confirming the validity of the geometry optimization.