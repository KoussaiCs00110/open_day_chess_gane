import { gsap } from '../easings.js';
import { timeline,getLayer,resetLayer } from './helpers.js';
export default function({duration,onCover,onDone}) {
 const el=getLayer('cards'); resetLayer(el); const cards=el.children;
 gsap.set(cards,{rotationY:90,transformPerspective:800,transformOrigin:'center'});
 return timeline(onDone).to(cards,{rotationY:0,duration:duration*.27,stagger:{amount:duration*.19,from:'center',grid:[5,8]}}).call(onCover).to(cards,{rotationY:-90,duration:duration*.3,stagger:{amount:duration*.2,from:'end',grid:[5,8]},ease:'wonder-anticipate'});
}
