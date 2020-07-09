import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { Titul } from './models/titul';
import { Issue } from './models/issue';
import { Filter } from './models/filter';
import { UrlSegment } from '@angular/router';
import { AppConfiguration } from 'src/app/app-configuration';
import { Volume } from 'src/app/models/volume';
import { User } from './models/user';

@Injectable()
export class AppState {
  public activePage = '';

  private _stateSubject = new Subject();
  public stateChangedSubject: Observable<any> = this._stateSubject.asObservable();

  // public _configSubject = new Subject();
  // public configSubject: Observable<any> = this._configSubject.asObservable();

  public _langSubject = new Subject();
  public langSubject: Observable<any> = this._langSubject.asObservable();

  // Holds client configuration
  // config: AppConfiguration;
  periods: string[] = [];
  vdkFormats: string[] = [];
  vydani = [];
  configured = false;
  owners: { name: string, url: string }[] = [];
  stavy: string[] = [];
  states = [];

  currentLang = 'cs';

  user: User;
  isAdmin = false;


  loginError = false;
  loginHttpError = false;
  loginHttpErrorMsg = '';
  logged = false;
  redirectUrl = '/';
  loginuser = '';
  loginpwd = '';

  calendarView = 'month';

  isNewIssue = false;

  specialDays: any = {};

  currentDay: Date = new Date();
  private _currentDaySubject = new Subject();
  public currentDayChanged: Observable<any> = this._currentDaySubject.asObservable();

  tituly: Titul[] = [];

  currentTitul: Titul = new Titul();
  private _currentTitulSubject = new Subject();
  public currentTitulChanged: Observable<any> = this._currentTitulSubject.asObservable();

  // currentVolume: Volume = new Volume(this.datePipe.transform(new Date(), 'yyyy-MM-dd'),
  // this.datePipe.transform(new Date(), 'yyyy-MM-dd'));
  currentVolume: Volume;
  private _currentVolumeSubject = new Subject();
  public currentVolumeChanged: Observable<any> = this._currentVolumeSubject.asObservable();

  currentIssue: Issue = new Issue();

  private _searchSubject = new Subject();
  public searchChanged: Observable<any> = this._searchSubject.asObservable();
  searchResults: any;
  numFound: number;
  pageIndex: number;

  start_date: string; // yyyyMMdd
  end_date: string;
  start_year: string;
  end_year: string;


  private _searchParamsSubject = new Subject();
  public searchParamsChanged: Observable<any> = this._searchParamsSubject.asObservable();

  q: string;
  currentPage = 0;
  rows = 25;
  public filters: Filter[] = [];

  public filterByDate: boolean;

  setConfig(config: AppConfiguration) {


    this.periods = config.periodicity;
    this.stavy = config.stavy;
    this.owners = config.owners;
    this.states = config.states;
    this.vdkFormats = config.vdkFormats;

    config.vydani.map(k => { this.vydani.push(k); });

    this.configured = true;
    // this._configSubject.next(cfg);
  }

  changeLang(lang) {
    this.currentLang = lang;


    this._langSubject.next(lang);
  }

  changeCurrentDay(d: Date) {
    this.currentDay = d;
    this._currentDaySubject.next(this.currentDay);
  }

  setCurrentTitul(titul: Titul) {
    this.currentTitul = titul;
    this._currentTitulSubject.next(this.currentTitul);

  }

  setSearchResults(res: any) {
    this.searchResults = res;
    this.numFound = this.searchResults.response.numFound;
    if (this.searchResults.stats) {
      const stats = this.searchResults.stats.stats_fields.datum_vydani_den;
      this.start_date = stats.min;
      this.end_date = stats.max;
      if (stats.min) {
        this.start_year = this.start_date.substring(0, 4);
        this.end_year = this.end_date.substring(0, 4);
      }
    }

    this._searchSubject.next(this.searchResults);
  }

  addFilter(field: string, value: string) {
    const f: Filter = new Filter(field, value);
    this.filters.push(f);
    this.currentPage = 0;
    this._searchParamsSubject.next(null);
  }

  gotoPage(p: number) {
    this.currentPage = p;
    this._searchParamsSubject.next(null);
  }

  addDateFilter() {
    this.filterByDate = true;
    this.currentPage = 0;
    this._searchParamsSubject.next(null);
  }

  removeDateFilter() {
    this.filterByDate = false;
    this.currentPage = 0;
    this._searchParamsSubject.next(null);
  }

  removeFilter(idx: number) {
    this.filters.splice(idx, 1);
    this.currentPage = 0;
    this._searchParamsSubject.next(null);
  }

  removeAllFilters() {
    this.reset();
    this._searchParamsSubject.next(null);
  }

  removeQuery() {
    this.q = '';
    this._searchParamsSubject.next(null);
  }

  fireSearch() {
    this._searchParamsSubject.next(null);
  }

  reset() {
    this.q = '';
    this.filters = [];
    this.filterByDate = false;
    this.currentPage = 0;
  }

  hasFilter(field: string): boolean {
    for (let i = 0; i < this.filters.length; i++) {
      if (this.filters[i].field === field) {
        return true;
      }
    }
    return false;
  }


  hasFacet(field: string): boolean {
    if (!this.searchResults) { return false; }
    if (!this.searchResults.facet_counts) { return false; }
    if (!this.searchResults.facet_counts.facet_fields.hasOwnProperty(field)) { return false; }
    return this.searchResults.facet_counts.facet_fields![field].length > 1;
  }

}
