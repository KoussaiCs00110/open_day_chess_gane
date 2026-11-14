import { gsap } from '../easings.js';
import { timeline,getLayer,resetLayer } from './helpers.js';
export default function({duration,onCover,onDone}){
 const layer=getLayer('glass'),stage=document.querySelector('#screen');resetLayer(layer);
 gsap.set(layer,{clipPath:'circle(0% at 50% 50%)',rotationY:-35,scale:.8});
 gsap.set(layer.querySelector('.mirror-alice'),{xPercent:-80,scale:.6});
 const done=()=>{gsap.set(stage,{clearProps:'transform'});onDone();};
 return timeline(done).to(layer,{clipPath:'circle(150% at 50% 50%)',rotationY:0,scale:1,duration:duration*.43,ease:'wonder-anticipate'},0)
 .fromTo(layer.querySelectorAll('.ripple-ring'),{scale:.2},{scale:2.2,duration:duration*.55,stagger:.025,transformOrigin:'center',ease:'power2.out'},0)
 .to(layer.querySelector('.mirror-alice'),{xPercent:40,scale:1,duration:duration*.46,ease:'power2.inOut'},0)
 .call(()=>{onCover();gsap.set(stage,{rotationY:-145,scale:.85});},[],duration*.46)
 .to(layer,{clipPath:'circle(0% at 50% 50%)',scale:1.2,duration:duration*.5,ease:'wonder-snap'},duration*.46)
 .to(stage,{rotationY:0,scale:1,duration:duration*.5,ease:'wonder-overshoot'},duration*.46);
}
