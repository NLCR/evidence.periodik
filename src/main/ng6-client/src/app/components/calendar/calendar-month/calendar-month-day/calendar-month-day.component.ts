import { Component, OnInit, Input } from '@angular/core';

import {Router, ActivatedRoute} from '@angular/router';

import {AppState} from '../../../../app.state';
import {AppService} from '../../../../app.service';

@Component({
  selector: 'app-calendar-month-day',
  templateUrl: './calendar-month-day.component.html',
  styleUrls: ['./calendar-month-day.component.scss']
})

export class CalendarMonthDayComponent implements OnInit {

  @Input('day') day: Date;
  @Input('special') special: any;
  @Input('current') current: Date;
  @Input('issues') issues: any[];
  
  isSpecial: boolean;
  id: string;
  
  constructor(
    private route: ActivatedRoute,
    public state: AppState,
    private service: AppService) { }

  ngOnInit() {
    let id = this.route.snapshot.parent.paramMap.get('id');
    if (id) {
      this.id = id;
    }
  }
  
  isOtherMonth(){
    return this.day.getMonth() !== this.current.getMonth();
  }

}
