import { trigger, transition, animate, style, state } from '@angular/animations';

export const HeaderAnimation = {
  fixedHeader : trigger('fixedHeader', [
    state('fixed', style({'backgroundColor': 'white', opacity:0.9, top:'1rem', position: 'fixed', width: '80%'})),
    transition('normal => fixed',[
      style({opacity:0.5, position: 'fixed'}),
      animate('300ms ease', style({'backgroundColor': 'white', opacity:0.9, width: '80%'})),
      animate('300ms ease', style({top:'1rem'}))
    ]),
    transition('fixed => normal',[
      style({opacity:0.5, position: 'absolute'}),
      animate('300ms ease', style({top: 0, left: '50%'})),
      animate('300ms ease', style({width: '100%'}))
    ])
  ]),
  fixedMobileHeader : trigger('fixedMobileHeader', [
    state('fixed', style({ opacity:0.9, position: 'fixed', height: '3rem'})),
    transition('normal => fixed',[
      style({position: 'fixed'}),
      animate('300ms ease', style({ opacity:0.9, height: '3rem'}))
    ]),
    transition('fixed => normal',[
      animate('300ms ease', style({position: 'relative', height: '6rem', opacity: 1})),
    ])
  ]),
  triggerChange: trigger('triggerChange', [
    state('void', style({opacity: 1, transform: 'scale(0)'})),
    state('*', style({opacity:1, transform: 'scale(1)'})),
    transition('void => *', [
      style({opacity: 0, transform: 'scale(0.3)'}),
      animate(100, style({opacity: 1, transform: 'scale(1.2)'}))
    ]),
    transition('* => void', [
      animate(100, style({opacity:0, transform: 'scale(0.3)'}))
    ])
  ])
}








