---
layout: tech
title: 'HTML5 Canvas Composite'
shortTitle: 'HTML5 Composite'
---

This technique encompasses a variety of layered rendering tricks that can be applied to a **single** HTML5 canvas.

![composite animation](/assets/gifs/composite.gif)

Main concepts:

- **Dilate/erode** - solid shapes can be morphed and layered to form edges that would otherwise be hard to compute.

- **Non-clearing** - Typically the canvas is cleared every frame before drawing, but this may be skipped to create a chalk board or etch-a-sketch effect.

- **Blending** determines how layers stack and can create special effects like color inversion. This involves using the globalCompositeOperation property specific to the HTML5 2D graphics context.