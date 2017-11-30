import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-calendar-month-day',
  templateUrl: './calendar-month-day.component.html',
  styleUrls: ['./calendar-month-day.component.scss']
})
export class CalendarMonthDayComponent implements OnInit {

  @Input('day') day: Date;
  @Input('current') current: Date;
  @Input('issues') issues: any[];
  
  constructor() { }

  ngOnInit() {
  }
  
  isOtherMonth(){
    return this.day.getMonth() !== this.current.getMonth();
  }

}
