import { Component, OnInit, OnDestroy } from '@angular/core';
import { DatePipe, Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { AppConfiguration } from 'src/app/app-configuration';
import { AppState } from '../../../app.state';

@Component({
  selector: 'app-toolbar-pagination-calendar',
  templateUrl: './toolbar-pagination-calendar.component.html',
  styleUrls: ['./toolbar-pagination-calendar.component.scss']
})
export class ToolbarPaginationCalendarComponent implements OnInit, OnDestroy {

  subscriptions: Subscription[] = [];
  month: string;
  year: string;

  constructor(
    public state: AppState,
    private datePipe: DatePipe,
    private location: Location,
    public config: AppConfiguration) { }

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

  setMonth() {
    this.month = this.datePipe.transform(this.state.currentDay, 'LLLL', null, this.state.currentLang);
    this.year = this.datePipe.transform(this.state.currentDay, 'yyyy');
  }

  changeMonth(dir: number) {
    const prevFormattedDate = this.datePipe.transform(this.state.currentDay, 'yyyyMMdd')

    const newDate = new Date(this.state.currentDay.getFullYear(), this.state.currentDay.getMonth() + dir, 1)
    this.state.changeCurrentDay(newDate);

    const newFormattedDate = this.datePipe.transform(newDate, 'yyyyMMdd')
    const newUrl = this.location.path().replace(`month/${prevFormattedDate}`, `month/${newFormattedDate}`)
    this.location.replaceState(newUrl)
  }

  changeYear() {
    const prevFormattedYear = this.datePipe.transform(this.state.currentDay, 'yyyy')

    this.state.changeCurrentDay(new Date(parseInt(this.year), this.state.currentDay.getMonth(), 1));

    const newFormattedYear = this.datePipe.transform(this.state.currentDay, 'yyyy')
    const newUrl = this.location.path().replace(`month/${prevFormattedYear}`, `month/${newFormattedYear}`)
    this.location.replaceState(newUrl)
  }

}
