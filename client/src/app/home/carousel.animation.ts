import { animation, trigger, transition, animate, style } from '@angular/animations';

export const CarouselAnimation = {
  fadeOut : trigger('carouselFadeOut', [
    transition('* => void', [
      animate('800ms ease-out', style({opacity:0}))
    ])
  ]),
  fadeIn : trigger('carouselFadeIn', [
    transition('void => *', [
      style({opacity:0}),
      animate('800ms ease-in', style({opacity:1}))
    ])
  ])
}




