# JUPITER: Gas Giant Atelier

A scroll-led 3D website about Jupiter, built with React, Vite and React Three Fiber.
The camera, planet and moons are driven by normalized scroll progress, so scrolling
back always reproduces the same view. Concept project inspired by a reference
scroll-presentation structure (a detailing-studio site), re-themed for space.

## Features

- Procedural Jupiter: GLSL shader with cloud bands and the Great Red Spot, no texture files
- Tilted ring and four orbiting moons, with a ring toggle in the footer
- Palette swatches (Natural, Infrared, Ultraviolet) that recolour planet and ring
- Mission cards for Juno, JUICE and Europa Clipper, with details and a spacecraft schematic
- Interactive footer: scroll progress, fun facts, scene controls, copy link
- Touch support: drag to spin, swipeable cards, bottom-sheet details
- Accessible: keyboard navigation, labelled swatches, reduced-motion support
- Performance: lazy-loaded 3D, capped pixel ratio, lighter settings on phones, CSS fallback without WebGL

## Run locally

    npm install
    npm run dev

## Build

    npm run build
    npm run preview

## Customize

All copy, missions, palettes and form fields live in `src/config.js`.
Camera and planet keyframes per section are in `src/Scene.jsx` (`KEYS`).

## Notes

- The briefing form is a demo and sends nothing until you connect a backend.
- Mission figures are approximate. Verify them against NASA and ESA before publishing.
- Not affiliated with NASA, ESA or any space agency.

## Tech

React · Vite · Three.js · @react-three/fiber · GLSL