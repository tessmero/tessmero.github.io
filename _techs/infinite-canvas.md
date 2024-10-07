---
layout: tech
title: "Infinite Canvas"
shortTitle: "Infinite Canvas"
---

A group of 2 or 4 html elements are moved using CSS to create the appearance of scrolling endlessly. In some situations this offers better performance than a stationary canvas.

![quad canvas animation](/assets/gifs/quad_infinite_canvas.gif)

The [idle game engine](/techs/idle-engine) provides a graphics context to draw on the group as if they were one infinite canvas.

Typically used to to pan over a big background scene without having to draw the scene every frame. Care must be taken because the canvas is not truly infinite. The scene can't be drawn all at once during a loading screen. Some parts may need to be redrawn if the player moves some distance and then comes back. 


