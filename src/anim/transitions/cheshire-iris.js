import { gsap } from '../easings.js';
import { timeline,getLayer,resetLayer } from './helpers.js';
// An even-odd polygon makes a real opening in the middle of the dark cover.
const mouthIris=(rx,ry)=>{
 const points=Array.from({length:17},(_,i)=>{const angle=i/16*Math.PI*2;return `${(50+Math.cos(angle)*rx).toFixed(3)}% ${(50+Math.sin(angle)*ry).toFixed(3)}%`;});
 return `polygon(evenodd,0% 0%,100% 0%,100% 100%,0% 100%,0% 0%,${points.join(',')},0% 0%)`;
};
export default function({duration,onCover,onDone}) {
 const el=getLayer('grin');resetLayer(el);gsap.set(el,{clipPath:'circle(0% at 50% 50%)'});const mouth=el.querySelector('.giant-grin');gsap.set(mouth,{scale:.4,rotation:-8});
 return timeline(onDone)
  .to(el,{clipPath:'circle(150% at 50% 50%)',duration:duration*.32,ease:'wonder-anticipate'},0)
  .to(mouth,{scale:1,rotation:0,duration:duration*.42},0)
  .call(()=>{onCover();gsap.set(el,{clipPath:mouthIris(0,0)});})
  .to(mouth,{scale:6,duration:duration*.55,ease:'power3.in'},duration*.42)
  .to(el,{clipPath:mouthIris(125,150),duration:duration*.55,ease:'wonder-anticipate'},duration*.42);
}
