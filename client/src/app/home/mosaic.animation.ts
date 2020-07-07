import { animation, trigger, transition, animate, style, state } from '@angular/animations';

export const MosaicAnimation = {
  fadeIn : trigger('mosaicFadeIn', [
    state('idle', style({opacity: 0})),
    state('display', style({opacity: 1})),
    transition('idle => display', [
      style({transform: 'translateY(40px)'}),
      animate('700ms ease-in-out')
    ]),
    transition('display => idle', [
      animate('700ms ease-in-out', style({opacity: 0, transform: 'translateY(40px)'}))
    ])
  ]),
  linkFadeIn: trigger('linkFadeIn', [
    state('idle', style({opacity: 0})),
    state('display', style({opacity: 1})),
    transition('idle => display', [
      style({transform: 'translateY(-20px)'}),
      animate('700ms ease-in-out')
    ]),
    transition('display => idle', [
      animate('700ms ease-in-out', style({opacity: 0, transform: 'translateY(-20px)'}))
    ])
  ])
}




