import { animation, trigger, transition, animate, style } from '@angular/animations';

export const Animations = {
  flyIn : trigger('flyIn', [
    transition('void => *', [
      style({opacity:0, transform: 'translateY(30px)'}),
      animate('500ms', style({opacity:1, transform: 'translateY(0)'}))
    ])
  ])
}




