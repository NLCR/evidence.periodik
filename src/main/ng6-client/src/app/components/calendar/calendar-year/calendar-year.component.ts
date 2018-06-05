import { Component, OnInit } from '@angular/core';
import {AppState} from '../../../app.state';

@Component({
  selector: 'app-calendar-year',
  templateUrl: './calendar-year.component.html',
  styleUrls: ['./calendar-year.component.scss']
})
export class CalendarYearComponent implements OnInit {

  constructor(
        public state: AppState) { }

  ngOnInit() {
    this.state.calendarView = "year";
  }

}
