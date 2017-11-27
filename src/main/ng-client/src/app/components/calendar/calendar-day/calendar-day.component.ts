import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-calendar-day',
  templateUrl: './calendar-day.component.html',
  styleUrls: ['./calendar-day.component.scss']
})
export class CalendarDayComponent implements OnInit {
  
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
