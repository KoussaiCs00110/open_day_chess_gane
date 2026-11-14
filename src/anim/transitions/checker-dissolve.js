import { gsap } from '../easings.js';
import { timeline,getLayer,resetLayer } from './helpers.js';
export default function({duration,onCover,onDone}){
 const layer=getLayer('checker');resetLayer(layer);const cells=layer.children;
 gsap.set(cells,{rotationX:90,y:0,scale:1,transformPerspective:600,transformOrigin:'50% 0%'});
 return timeline(onDone).to(cells,{rotationX:0,duration:duration*.32,stagger:{amount:duration*.15,grid:[8,8],from:0},ease:'wonder-snap'})
 .call(onCover).to(cells,{y:()=>innerHeight*1.25,rotationX:-110,rotation:25,scale:.7,duration:duration*.33,stagger:{amount:duration*.17,grid:[8,8],from:0},ease:'power3.in'});
}
