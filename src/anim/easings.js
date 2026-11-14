import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { Flip } from 'gsap/Flip';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
gsap.registerPlugin(CustomEase, Flip, MotionPathPlugin);
CustomEase.create('wonder-snap', '0.16,1,0.3,1');
CustomEase.create('wonder-anticipate', '0.6,-0.18,0.23,1');
CustomEase.create('wonder-overshoot', '0.34,1.4,0.64,1');
export { gsap, Flip, MotionPathPlugin };
