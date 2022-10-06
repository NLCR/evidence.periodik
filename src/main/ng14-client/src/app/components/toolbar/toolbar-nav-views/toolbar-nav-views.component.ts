import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AppState } from '../../../app.state';
import { DatePipe } from '@angular/common';
import { AppConfiguration } from 'src/app/app-configuration';

@Component({
  selector: 'app-toolbar-nav-views',
  templateUrl: './toolbar-nav-views.component.html',
  styleUrls: ['./toolbar-nav-views.component.scss']
})
export class ToolbarNavViewsComponent {

  constructor(
    private datePipe: DatePipe,
    public state: AppState,
    private router: Router,
    public config: AppConfiguration) { }

  changeView(view: string) {
    this.state.calendarView = view;
    const d = this.datePipe.transform(this.state.currentDay, 'yyyyMMdd');

    this.router.navigate(['/calendar', this.state.currentTitul.id, view, d]);
  }

}
