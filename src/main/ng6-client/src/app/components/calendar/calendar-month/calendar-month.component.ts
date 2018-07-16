import {Component, OnInit} from '@angular/core';
import {DatePipe} from '@angular/common';
import {Router, ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';

import {AppState} from '../../../app.state';
import {AppService} from '../../../app.service';

import * as $ from 'jquery';

@Component({
  selector: 'app-calendar-month',
  templateUrl: './calendar-month.component.html',
  styleUrls: ['./calendar-month.component.scss']
})
export class CalendarMonthComponent implements OnInit {

  subscriptions: Subscription[] = [];

  weekdays: string[] = ['po', 'út', 'st', 'čt', 'pá', 'so', 'ne'];
  days: Date[] = [];
  issues: any[] = [];
  specialDays: any[] = [];

  constructor(
    public state: AppState,
    private service: AppService,
    private router: Router,
    private route: ActivatedRoute,
    private datePipe: DatePipe) {}

  ngOnInit() {
    this.state.calendarView = "month";
    this.subscriptions.push(this.state.currentDayChanged.subscribe((state) => {
      this.setDays();
    }));

    this.subscriptions.push(this.state.configSubject.subscribe((state) => {
      this.setDays();
    }));

    this.subscriptions.push(this.state.searchChanged.subscribe(res => {
      this.setIssues();
    }));

    let day = this.route.snapshot.paramMap.get('day');

    if (day) {
      let d: Date = new Date(parseInt(day.substr(0, 4)), parseInt(day.substr(4, 2)) - 1, parseInt(day.substr(6, 2)));
      this.state.changeCurrentDay(d);
    } else {
      this.state.changeCurrentDay(new Date());
    }

  }

  ngOnDestroy() {
    this.subscriptions.forEach((s: Subscription) => {
      s.unsubscribe();
    });
    this.subscriptions = [];
  }

  getSpecial(d: Date) {
    let exact = this.datePipe.transform(d, 'yyyyMMdd');
    let partial = this.datePipe.transform(d, 'MMdd');
    for (let i in this.specialDays) {
      if (this.specialDays[i]['id'] === exact || this.specialDays[i]['id'] === partial) {
        return this.specialDays[i];
      }
    }
    return {}
  }

  setDays() {
    if (!this.state.config) {
      return;
    }
    this.days = [];
    this.service.getSpecialDaysOfMonth(this.state.currentDay).subscribe(res => {

      this.specialDays = res;
      var firstDayOfMonth = new Date(this.state.currentDay.getFullYear(), this.state.currentDay.getMonth(), 1);
      let start = firstDayOfMonth.getDay() + 6; //pridame 6 aby zacatek byl pondeli

      for (let i = 0; i < 42; i++) {
        let d: Date = new Date(firstDayOfMonth);
        d.setDate(firstDayOfMonth.getDate() + (i - start));
        this.days.push(d);
      }

      this.getIssues();

    });
  }

  issuesOfDay(d: Date): any[] {
    let str1 = this.datePipe.transform(d, 'yyyy-MM-dd');
    //let str2 =  this.datePipe.transform(this.currentDay, 'yyyy-MM');
    return this.issues.filter(e => this.datePipe.transform(new Date(e['datum_vydani']), 'yyyy-MM-dd') === str1);
  }


  getIssues() {
    let month = this.datePipe.transform(this.state.currentDay, 'yyyy-MM');
    if (this.state.currentTitul.id && this.state.currentTitul.id !== "") {
      this.service.searchCalendar(month).subscribe(res => {
        this.state.setSearchResults(res);
      });
    } else {
      this.subscriptions.push(this.state.currentTitulChanged.subscribe((state) => {
        this.service.searchCalendar(month).subscribe(res => {
          this.state.setSearchResults(res);
        });
      }));
    }
  }

  setIssues() {
    this.issues = this.state.searchResults['response']['docs'];
  }

}
