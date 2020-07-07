import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-order-done',
  templateUrl: './order-done.component.html',
  styleUrls: ['./order-done.component.scss']
})
export class OrderDoneComponent implements OnInit, OnDestroy {
  anonymousMode: boolean = true;
  resultMode: string = 'fail';
  querySub: Subscription;

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.querySub = this.route.queryParams.subscribe((queryParams) => {
      const result = queryParams['result'];
      const anon = queryParams['anon'];

      if (result === 'success') {
        this.resultMode = 'success';
      } else {
        this.resultMode = 'fail';
      }

      if (anon === 'false') {
        this.anonymousMode = false;
      } else {
        this.anonymousMode = true;
      }
    })
  }

  ngOnDestroy() {
    this.querySub.unsubscribe();
  }

}
