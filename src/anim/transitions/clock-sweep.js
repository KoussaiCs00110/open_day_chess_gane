import {clockHand} from '../clocks.js';
import { gsap } from '../easings.js';
import { timeline,getLayer,resetLayer } from './helpers.js';
export default function({duration,onCover,onDone,layer}) {
 const el=layer||getLayer('clock');resetLayer(el);gsap.set(el,{'--sweep':'0deg',rotation:0});
 const hand=clockHand(el.querySelector('.clock-hand-minute')||el.querySelector('.clock-hands'));gsap.set(hand,{angle:0});
 const tl=timeline(onDone).to(el,{'--sweep':'360deg',duration:duration*.48,ease:'power2.inOut'},0).to(hand,{angle:360,duration:duration*.48,ease:'power2.inOut'},0).call(()=>{gsap.set(el,{maskImage:'none',webkitMaskImage:'none'});onCover();}).to(el,{scale:1.5,clipPath:'circle(0% at 50% 50%)',duration:duration*.5});return tl;
}
