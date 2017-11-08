import {Component, OnInit, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import {CalendarComponent} from "ap-angular2-fullcalendar";

import {AppService} from '../../app.service';

import * as $ from 'jquery';

@Component({
  selector: 'app-kalendar-full',
  templateUrl: './kalendar-full.component.html',
  styleUrls: ['./kalendar-full.component.scss']
})
export class KalendarFullComponent implements OnInit {
  @ViewChild(CalendarComponent) myCalendar: CalendarComponent;

  calendarOptions: Object = {
    locale: 'cs',

    header: {
      left: 'prev,next today ',
      center: 'title',
      right: 'month,listMonth'
    },
    dayClick: function(date, jsEvent, view) {

        console.log('Clicked on: ' + date.format());
        console.log('Coordinates: ' + jsEvent.pageX + ',' + jsEvent.pageY);
        console.log('Current view: ',view);

        // change the day's background color just for fun
        $(this).css('background-color', 'yellow');

    },
    eventRender: (event, element) => {
      console.log(event);
      if(event['source']['className'][0] === 'issue'){
        let td = $('<td>');
        let span = $('<span>');
        span.text(event['title'] + ' ' + event['podnazev']);
        td.append(span);
        td.click( () => {this.clickIssue(event)});
        return td;
      }
    },
    
    height: 'parent',
    fixedWeekCount: false,
    //defaultDate: '2017-10-12',
    eventLimit: true, // allow "more" link when too many events
    eventSources:[
    { events:
      (start, end, timezone, callback) => {
        this.getSpecialdaysEvents(start, end, timezone, callback); 
      },
      className: 'special'
    },
    { events:
      (start, end, timezone, callback) => {
        this.getIssues(start, end, timezone, callback); 
      },
      className: 'issue'
    }
    ],
//    events: (start, end, timezone, callback) => {
//      this.getEvents(start, end, timezone, callback); 
//    }
    editable: true
  };

  onCalendarInit(initialized: boolean) {
    console.log('Calendar initialized');
  }

  constructor(private service: AppService, private router: Router) {}

  ngOnInit() {
  }
  
  getSpecialdaysEvents(start, end, timezone, callback){
    this.service.getSpecialDays().subscribe( res => {
      
      let events: any[] = res['response']['docs'];
      events.map(event => {event['rendering'] = 'background'});
      callback(events);
    });
  }
  
  getIssues(start, end, timezone, callback){
    this.service.getIssuesOfTitul('kk', '2017-10').subscribe( res => {
      
      //let events: any[] = res['response']['docs'];
      //events.map(event => {event['dayClick'] = this.clickIssue});
      callback(res);
    });
  }

  gotoDate() {
    this.myCalendar.fullCalendar('gotoDate', '2016-10-12')

  }
  
  clickIssue(issue){
    console.log(issue);
    this.router.navigate(['/issue', issue['id']]);
  }
}
