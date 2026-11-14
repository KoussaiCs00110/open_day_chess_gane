import { gsap } from '../easings.js';
import { timeline,getLayer,resetLayer } from './helpers.js';
export default function({duration,onCover,onDone}) {
 const el=getLayer('curtain');resetLayer(el);const panels=el.children;gsap.set(panels,{xPercent:i=>i===0?-105:105,rotation:i=>i===0?-3:3});
 return timeline(onDone).to(panels,{xPercent:0,rotation:0,duration:duration*.47,ease:'wonder-overshoot'}).call(onCover).to(panels,{xPercent:i=>i===0?-105:105,rotation:i=>i===0?4:-4,duration:duration*.5,ease:'wonder-anticipate'});
}
