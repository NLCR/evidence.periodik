import {Component, OnInit} from '@angular/core';
import {DatePipe} from '@angular/common';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import { AppConfiguration } from 'src/app/app-configuration';

import {AppState} from '../../../app.state';

@Component({
    selector: 'app-toolbar-pagination-calendar',
    templateUrl: './toolbar-pagination-calendar.component.html',
    styleUrls: ['./toolbar-pagination-calendar.component.scss']
})
export class ToolbarPaginationCalendarComponent implements OnInit {

  subscriptions: Subscription[] = [];
    month: string;
    year: string;
    
    constructor(
        public state: AppState,
        private datePipe: DatePipe,
        public config: AppConfiguration) {}

    ngOnInit() {
      this.setMonth();
      this.subscriptions.push(this.state.currentDayChanged.subscribe((state) => {
        this.setMonth();
      }));
    }

  ngOnDestroy() {
    this.subscriptions.forEach((s: Subscription) => {
      s.unsubscribe();
    });
    this.subscriptions = [];
  }
    
    setMonth(){
      this.month = this.datePipe.transform(this.state.currentDay, 'LLLL',null, this.state.currentLang);
      this.year = this.datePipe.transform(this.state.currentDay, 'yyyy');
    }
    
    changeMonth(dir: number){
        this.state.changeCurrentDay(new Date(this.state.currentDay.getFullYear(), this.state.currentDay.getMonth() + dir, 1));
    }
    
    changeYear(){
      this.state.changeCurrentDay(new Date(parseInt(this.year), this.state.currentDay.getMonth(), 1));
    }

}
