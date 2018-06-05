import {Component, OnInit} from '@angular/core';
import {DatePipe} from '@angular/common';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';

import {AppState} from '../../../app.state';
import {AppService} from '../../../app.service';

import * as $ from 'jquery';

@Component({
  selector: 'app-calendar-list',
  templateUrl: './calendar-list.component.html',
  styleUrls: ['./calendar-list.component.scss']
})
export class CalendarListComponent implements OnInit {

   subscriptions: Subscription[] = [];

    weekdays: string[] = ['po', 'út', 'st', 'čt', 'pá', 'so', 'ne'];
    days: Date[] = [];
    issues: any[] = [];
    specialDays: any[] = [];

    constructor(
        public state: AppState,
        private service: AppService,
        private router: Router,
        private datePipe: DatePipe) {}

    ngOnInit() {
    this.state.calendarView = "list";
        if (this.state.config) {
            this.setDays();
        } else {
            this.subscriptions.push(this.state.configSubject.subscribe((state) => {
                this.setDays();
            }));
        }

        this.subscriptions.push(this.state.currentDayChanged.subscribe((state) => {
            this.setDays();
        }));

    }

    ngOnDestroy() {
        this.subscriptions.forEach((s: Subscription) => {
            s.unsubscribe();
        });
        this.subscriptions = [];
    }
    
    getSpecial(d: Date){
        let exact = this.datePipe.transform(d, 'yyyyMMdd');
        let partial = this.datePipe.transform(d, 'MMdd');
        for(let i in this.specialDays){
            if(this.specialDays[i]['id'] === exact || this.specialDays[i]['id'] === partial){
                return this.specialDays[i];
            }
        }
        return {}
    }

    setDays() {
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
        //let month = '' + this.currentDay.getFullYear() + '-' + this.currentDay.getMonth();
        this.service.getIssuesOfTitul("d2677fbe-f660-4da2-a55d-035c12c09aab", month).subscribe(res => {
            this.issues = res;
        });
    }

}
