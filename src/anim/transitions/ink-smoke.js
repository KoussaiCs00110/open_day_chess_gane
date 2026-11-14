import { gsap } from '../easings.js';
import { timeline,getLayer,resetLayer } from './helpers.js';
export default function({duration,onCover,onDone,point}) {
 const el=getLayer('ink');resetLayer(el);const origin=`${point?.x??innerWidth/2}px ${point?.y??innerHeight/2}px`;gsap.set(el,{clipPath:`circle(0% at ${origin})`,rotation:0});
 return timeline(onDone).to(el,{clipPath:`circle(150% at ${origin})`,duration:duration*.47,ease:'wonder-anticipate'}).call(onCover).to(el,{clipPath:`circle(0% at ${origin})`,duration:duration*.5,ease:'wonder-snap'});
}
