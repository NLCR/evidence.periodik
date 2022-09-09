import { Component, OnInit, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { AppState } from '../../../app.state';
import { AppService } from '../../../app.service';

@Component({
  selector: 'app-calendar-month',
  templateUrl: './calendar-month.component.html',
  styleUrls: ['./calendar-month.component.scss']
})
export class CalendarMonthComponent implements OnInit, OnDestroy {

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
    private datePipe: DatePipe) { }

  ngOnInit() {
    this.state.calendarView = 'month';
    this.subscriptions.push(this.state.currentDayChanged.subscribe((state) => {
      this.setDays();
    }));

    this.setDays();

    this.subscriptions.push(this.state.searchChanged.subscribe(res => {
      this.setIssues();
    }));

    const day = this.route.snapshot.paramMap.get('day');

    if (day) {
      const d: Date = new Date(parseInt(day.substring(0, 4), 10), parseInt(day.substring(4, 6), 10) - 1, parseInt(day.substring(6, 8), 10));
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
    const exact = this.datePipe.transform(d, 'yyyyMMdd');
    const partial = this.datePipe.transform(d, 'MMdd');
    for (const i in this.specialDays) {
      if (this.specialDays[i].id === exact || this.specialDays[i].id === partial) {
        return this.specialDays[i];
      }
    }
    return {};
  }

  setDays() {
    this.days = [];
    this.service.getSpecialDaysOfMonth(this.state.currentDay).subscribe(res => {

      this.specialDays = res;
      const firstDayOfMonth = new Date(this.state.currentDay.getFullYear(), this.state.currentDay.getMonth(), 1);
      // console.log(firstDayOfMonth)
      const start = firstDayOfMonth.getDay() + 6; // pridame 6 aby zacatek byl pondeli
      // const start = firstDayOfMonth.getDay(); // pridame 6 aby zacatek byl pondeli
      // console.log(start)
      for (let i = 0; i < 42; i++) {
        const d: Date = new Date(firstDayOfMonth);
        d.setDate(firstDayOfMonth.getDate() + (i - start));
        this.days.push(d);
      }

      this.getIssues();

    });
  }

  issuesOfDay(d: Date): any[] {
    const str1 = this.datePipe.transform(d, 'yyyy-MM-dd');
    // let str2 =  this.datePipe.transform(this.currentDay, 'yyyy-MM');
    return this.issues.filter(e => this.datePipe.transform(new Date(e.datum_vydani), 'yyyy-MM-dd') === str1);
  }


  getIssues() {
    const month = this.datePipe.transform(this.state.currentDay, 'yyyy-MM');
    if (this.state.currentTitul.id && this.state.currentTitul.id !== '') {
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
    this.issues = this.state.searchResults.response.docs;
  }

}
