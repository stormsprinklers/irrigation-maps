export const STYLIZE_PROPERTY_PROMPT = `Use the input image as the authoritative site reference and create a polished top-down aerial rendering of the same property.

Your primary goal is fidelity to the source image. Your secondary goal is visual beauty.

Rules:
1. Preserve the exact site layout as closely as possible.
2. Do not add new landscape features, trees, sidewalks, beds, or structures unless they are clearly visible in the source image.
3. Do not remove visible site features.
4. Do not change the footprint, orientation, or proportions of the buildings, parking lots, roads, or lawn areas.
5. Maintain the same overall composition and property boundaries visible in the image.

Enhance the image by:
- cleaning up graininess
- sharpening edges
- making turf look smooth and healthy
- making pavement, roofs, and hardscape look clean and professional
- giving the image a refined, presentation-ready site-plan appearance

Desired style:
- top-down orthographic aerial view
- realistic but polished
- elegant, professional, presentation quality
- suitable as a base map for irrigation design overlays

The final result should be a faithful, beautiful rendering of the original property, not a reinterpretation.`;
