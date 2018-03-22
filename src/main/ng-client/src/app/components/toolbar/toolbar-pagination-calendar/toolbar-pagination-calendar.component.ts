import {Component, OnInit} from '@angular/core';
import {DatePipe} from '@angular/common';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';

import {AppState} from '../../../app.state';

@Component({
    selector: 'app-toolbar-pagination-calendar',
    templateUrl: './toolbar-pagination-calendar.component.html',
    styleUrls: ['./toolbar-pagination-calendar.component.scss']
})
export class ToolbarPaginationCalendarComponent implements OnInit {

  subscriptions: Subscription[] = [];
    month: string;
    constructor(
        public state: AppState,
        private datePipe: DatePipe) {}

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
        this.month = this.datePipe.transform(this.state.currentDay, 'LLLL yyyy',null, this.state.currentLang);
    }
    
    changeMonth(dir: number){
        this.state.changeCurrentDay(new Date(this.state.currentDay.getFullYear(), this.state.currentDay.getMonth() + dir, 1));
    }

}
