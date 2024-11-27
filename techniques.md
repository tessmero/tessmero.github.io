---
layout: post
title: "Techniques"
shortTitle: "Techniques"
---

Here is writing that was previously on a series of "technique" pages on this website.

## Idle Game Engine

My "no-bake cookie" browser javascript game engine.

Games built with this engine can run as static web pages directly from raw source code.

This means if a game is open source [like raincatcher](https://github.com/tessmero/idle), anyone can download the code and run the game locally in their web browser. You can edit to the source code in any text editor to make changes to the game. You can copy the source files to a free static website to publish it online.

Optional advanced tools:

In a code editor like VSCode with [ESLint](https://eslint.org/) enabled, individual source files are continuously compiled with [Babel](https://babeljs.io/) and analyzed. Custom rules emulate features from other languages, like object types in TypeScript. Violations are highlighted in the editor and can sometimes be fixed automatically. 

<div style="text-align: center;">
  <img src="/assets/images/single-ast.png" alt="single code file flowchart" style="max-width: 100%; height: auto; max-height: 100px;">
  <p style="font-size: 0.9rem; margin-top: 5px;"> <span style="font-style: italic">During editing, the file is compiled into an Abstract Syntax Tree (AST)</span><br><tt style="font-weight: bold;">npx eslint --fix myfile.js</tt>
  </p>
</div>

The whole game may also be compiled into one combined AST. Then additional rules and tests can be applied. Finally the combined AST can be transformed into a product.


<div style="text-align: center;">
  <img src="/assets/images/combined-ast.png" alt="combined code flowchart" style="max-width: 100%; height: auto; max-height: 100px;">
  <p style="font-size: 0.9rem; margin-top: 5px;"> <span style="font-style: italic">Project is compiled into one AST and transformed.</span><br><tt style="font-weight: bold;">npm run build:prod</tt>
  
  </p>
</div>


## Infinite Canvas

A group of 2 or 4 html elements are moved using CSS to create the appearance of scrolling endlessly. In some situations this offers better performance than a stationary canvas.

![quad canvas animation](/assets/gifs/quad_infinite_canvas.gif)

The idle game engine provides a graphics context to draw on the group as if they were one infinite canvas.




## Procedural Motion

Natural motion is produced by formulas that represent real physical laws integrated over time. They tend to involve parabolas, trigonometry, and logs. 

May be combined with pseudo-random number generators to create a large number of distinct elements.

These types of animations are stable and efficient. The downside is that they don't produce novel emergent behavior like dynamic physics simulations.


## Procedural World

A game world is generated from perlin noise. The world can extend infinitely without repeating. Noise generators can be layered to produce a variety of randomized natural shapes. Seeds can be used to consistently regenerate the same world.

Large-scale regions (biomes) and special features (villages) may be randomized or static/pre-built.


## Physics Character Rig

In a dynamic physics sim, basic objects are composed together into complex objects like living characters. A character rig, like in 3D modeling, provides convenient handles for animating at different levels of granularity. 

For example, a human character rig could have
- a high level "walk" handle to animate the whole body for general movement
- "leftLeg.kick" to execute a coordinated kick
- "leftFoot" to position the foot precisely 
- "leftAnkle" to manually adjust a single joint 

The character rig is defined in several layers of css-like language. First primitive objects are defined and composed into named body parts. Then poses and animation sequences are defined by referencing the body parts.


## Dynamic Physics Simulation

Basic objects like balls and springs follow Newtonian mechanics and Hooke's law. They are simulated by estimating their motion over small time intervals. They are composed together to form more complex objects.

![dynamic physics animation](/assets/gifs/puppy.gif)

This technique can produce a lot of life-like emergent behavior from a small amount of animation work. On the other hand it is prone to chaotic explosions and requires tuning of variables like time-step, spring constant, damping, and gravity.

Complex objects can be animated using a physics character rig

## HTML5 Canvas Composite

This technique encompasses a variety of layered rendering tricks that can be applied to a **single** HTML5 canvas.

Main concepts:

- **Dilate/erode** - solid shapes can be morphed and layered to form edges that would otherwise be hard to compute.

- **Non-clearing** - Typically the canvas is cleared every frame before drawing, but this may be skipped to create a chalk board or etch-a-sketch effect.

- **Blending** determines how layers stack and can create special effects like color inversion. This involves using the globalCompositeOperation property specific to the HTML5 2D graphics context.