import {gsap} from './easings.js';
// A balanced last step always returns to the initial pose; yoyo alone can end
// at the negative offset and move the next screen or stale board pointer bounds.
export function shake(el,low){
 if(low||!el)return null;
 return gsap.timeline().to(el,{x:-5,duration:.045,ease:'power2.out',overwrite:'auto'}).to(el,{x:5,duration:.065,repeat:3,yoyo:true,ease:'power2.inOut'}).to(el,{x:0,duration:.08,ease:'power2.out'});
}
export const punch=(el,low)=>!low&&el?gsap.fromTo(el,{scale:1.025},{scale:1,duration:.55,ease:'elastic.out(1,.4)',overwrite:'auto'}):null;
