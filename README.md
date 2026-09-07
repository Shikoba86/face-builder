# Face Builder V0.2

Manual, deterministic face-builder prototype. No generative AI creates the identity.

## Current build
- iPhone/desktop responsive UI
- touch rotate + pinch zoom
- six facial control groups
- anatomical-style presets
- 25+ manual parameters
- subtle left/right asymmetry controls
- Undo / Random / Reset / Front view
- Character DNA JSON export
- PWA manifest + basic service worker

## Run locally
Serve the folder through HTTP:

    python3 -m http.server 8080

Open http://localhost:8080

## iPhone
Deploy the folder to any static HTTPS host, open the URL in Safari, then use Share > Add to Home Screen.

## Important limitation
The current face is a procedural prototype assembled from geometry. It proves UI, interaction and deterministic DNA, but it is not the final anatomical asset. The production step is to replace it with a GLB head containing authored morph targets and map these same controls to those morph targets.
