import { gsap } from '../easings.js';
import { timeline,getLayer,resetLayer } from './helpers.js';
export default function({duration,onCover,onDone}){
 const layer=getLayer('stomp'),stage=document.querySelector('#screen');resetLayer(layer);gsap.set(layer,{clipPath:'inset(0% 100% 0% 0%)'});gsap.set(layer.querySelector('.queen-shadow'),{xPercent:-130,scale:1.3});
 const done=()=>{gsap.set(stage,{clearProps:'transform'});onDone();};
 return timeline(done).fromTo(stage,{x:-4},{x:0,repeat:3,yoyo:true,duration:duration*.05,ease:'power3.in'},0)
 .to(layer,{clipPath:'inset(0% 0% 0% 0%)',duration:duration*.38,ease:'power4.in'},duration*.1)
 .fromTo(layer.querySelector('.crack-lines'),{scale:.25,opacity:0},{scale:1.2,opacity:1,duration:duration*.3,ease:'power4.out'},duration*.12)
 .to(layer.querySelector('.queen-shadow'),{xPercent:10,duration:duration*.45,ease:'power3.in'},0)
 .call(onCover).to(layer.querySelector('.queen-shadow'),{xPercent:130,scale:1.6,duration:duration*.48,ease:'power3.in'},duration*.48)
 .to(layer,{clipPath:'inset(0% 0% 0% 100%)',duration:duration*.48,ease:'wonder-snap'},duration*.48);
}
