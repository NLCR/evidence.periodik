import { Component, OnInit, Input } from '@angular/core';

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
  //special: any = {};
  
  constructor(
        public state: AppState,
        private service: AppService) { }

  ngOnInit() {
//    this.service.isSpecial(this.day).subscribe(res => {
//        if(res.length > 0){
//            this.special = res[0];
//            this.isSpecial = true;
//        }
//    });
  }
  
  isOtherMonth(){
    return this.day.getMonth() !== this.current.getMonth();
  }

}
