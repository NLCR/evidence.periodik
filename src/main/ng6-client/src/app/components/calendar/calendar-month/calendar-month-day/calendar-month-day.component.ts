import { Component, OnInit, Input } from '@angular/core';

import {Router, ActivatedRoute} from '@angular/router';

import {AppState} from '../../../../app.state';
import {AppService} from '../../../../app.service';
import { AppConfiguration } from 'src/app/app-configuration';

@Component({
  selector: 'app-calendar-month-day',
  templateUrl: './calendar-month-day.component.html',
  styleUrls: ['./calendar-month-day.component.scss']
})

export class CalendarMonthDayComponent implements OnInit {

  @Input() day: Date;
  @Input() special: any;
  @Input() current: Date;
  @Input() issues: any[];
  
  isSpecial: boolean;
  id: string;
  
  constructor(
    private route: ActivatedRoute,
    public state: AppState,
    private service: AppService,
    public config: AppConfiguration) { }

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
