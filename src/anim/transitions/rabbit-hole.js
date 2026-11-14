import { gsap } from '../easings.js';
import { timeline,getLayer,resetLayer } from './helpers.js';
export default function({duration,onCover,onDone}) {
 const el=getLayer('rabbit');resetLayer(el);gsap.set(el,{clipPath:'circle(0% at 50% 50%)',rotation:0});
 const rings=el.querySelector('.spiral'),stage=document.querySelector('#screen');gsap.set(rings,{rotation:-100,scale:.4});
 const done=()=>{gsap.set(stage,{clearProps:'transform,clipPath'});onDone();};
 return timeline(done)
  .to(el,{clipPath:'circle(150% at 50% 50%)',duration:duration*.48,ease:'wonder-anticipate'},0)
  .to(stage,{scale:.05,rotation:-18,clipPath:'circle(0% at 50% 50%)',duration:duration*.48,ease:'power3.in'},0)
  .to(rings,{rotation:110,scale:1.2,duration:duration*.48},0)
  .call(()=>{onCover();gsap.set(stage,{scale:.05,rotation:18,clipPath:'circle(0% at 50% 50%)'});})
  .to(el,{clipPath:'circle(0% at 50% 50%)',duration:duration*.5,ease:'wonder-snap'},duration*.48)
  .to(stage,{scale:1,rotation:0,clipPath:'circle(150% at 50% 50%)',duration:duration*.5,ease:'wonder-snap'},duration*.48)
  .to(rings,{rotation:270,scale:2,duration:duration*.5},duration*.48);
}
