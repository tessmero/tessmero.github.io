---
layout: tech
title: "Idle Game Engine"
shortTitle: "Idle Engine"
---

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

