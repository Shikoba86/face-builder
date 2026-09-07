# Face Builder V1 Alpha

Deterministic anatomical face-builder experiment using the MakeHuman/MPFB CC0 base mesh and CC0 target data at runtime.

## What changed from V0.2
- Replaces the primitive/cartoon head with the actual MakeHuman base anatomy.
- Applies MakeHuman `.target.gz` vertex deltas directly in the browser.
- First curated controls: head, forehead, nose and chin.
- Character DNA remains numeric/deterministic; no generative AI creates identity.
- Touch orbit/zoom and mobile UI remain.

## Alpha note
Assets are fetched at runtime from the official MakeHumanCommunity MPFB2 GitHub repository. Some target paths may change upstream; unavailable targets fail gracefully in the browser console.

MakeHuman/MPFB core graphical assets used here are CC0. The base.obj itself contains an explicit CC0 notice.
