import { Component, OnInit, Input } from '@angular/core';

import {AppState} from '../../../../app.state';
import {AppService} from '../../../../app.service';
import { AppConfiguration } from 'src/app/app-configuration';

@Component({
  selector: 'app-calendar-list-item',
  templateUrl: './calendar-list-item.component.html',
  styleUrls: ['./calendar-list-item.component.scss']
})
export class CalendarListItemComponent implements OnInit {

  @Input('day') day: Date;
  @Input('special') special: any;
  @Input('current') current: Date;
  @Input('issues') issues: any[];
  
  isSpecial: boolean;
  //special: any = {};
  
  constructor(
        public state: AppState,
        private service: AppService,
        public config: AppConfiguration) { }

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
