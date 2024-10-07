---
layout: tech
title: "Dynamic Physics Simulation"
shortTitle: "Dynamic Sim"
---

Basic objects like balls and springs follow Newtonian mechanics and Hooke's law. They are simulated by estimating their motion over small time intervals. They are composed together to form more complex objects.

![quad canvas animation](/assets/gifs/puppy.gif)

This technique can produce a lot of life-like emergent behavior from a small amount of animation work. On the other hand it is prone to chaotic explosions and requires tuning of variables like time-step, spring constant, damping, and gravity.

Complex objects can be animated using a [physics character rig](/techs/character-rig)
