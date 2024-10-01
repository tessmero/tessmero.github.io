---
layout: tech
title: 'Physics Character Rig'
shortTitle: 'Character Rig'
---

In a [dynamic physics sim](/techs/dynamic-sim), basic objects are composed together into complex objects like living characters. A character rig, like in 3D modeling, provides convenient handles for animating at different levels of granularity. 

For example, a human character rig could have
- a high level "walk" handle to animate the whole body for general movement
- "leftLeg.kick" to execute a coordinated kick
- "leftFoot" to position the foot precisely 
- "leftAnkle" to manually adjust a single joint 

The character rig is defined in several layers of css-like language. First primitive objects are defined and composed into named body parts. Then poses and animation sequences are defined by referencing the body parts.