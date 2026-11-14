import { gsap } from '../easings.js';
export function timeline(onDone) { return gsap.timeline({ paused:true, onComplete:onDone, defaults:{ease:'wonder-snap'} }); }
export const getLayer = name => document.querySelector(`[data-transition="${name}"]`);
export function resetLayer(layer) { gsap.set(layer,{display:'block',clearProps:'transform,clipPath,opacity,maskImage,webkitMaskImage'}); }
