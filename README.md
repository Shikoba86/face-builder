# Face Builder V1.2 — Real Anatomy

This build includes the MakeHuman hm08 base mesh physically in `assets/base.obj`.
The mesh is the uploaded MakeHuman asset and declares CC0 in its own header.

## What changed
- Real local hm08 mesh: no remote dependency for the base character.
- Only the `body` face group is rendered, so helper/joint geometry is excluded.
- Head/nose/chin morph targets are fetched from the official MPFB repository for this alpha.
- Deterministic Character DNA; no generative AI creates identity.
- Old service-worker caching is not used by this build.

## Deploy
Replace the files in the root of the GitHub Pages repository, including the entire `assets` folder.
When loaded correctly the badge reads `V1.2 · LOCAL HM08 · 19,158 VERTICES`.
