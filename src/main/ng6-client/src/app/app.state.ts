import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import {Titul} from './models/titul';
import {Issue} from './models/issue';
import {Filter} from './models/filter';
  
@Injectable()
export class AppState {
  public activePage = '';
  
  private _stateSubject = new Subject();
  public stateChangedSubject: Observable<any> = this._stateSubject.asObservable();
  
  public _configSubject = new Subject();
  public configSubject: Observable<any> = this._configSubject.asObservable();
  
  public _langSubject = new Subject();
  public langSubject: Observable<any> = this._langSubject.asObservable();
  
  //Holds client configuration
  config: any;
  periods: string[] = [];
  vydani = [];
  configured: boolean = false;
  
  
  stavy : string[] = [];
  states = [];
  
  currentLang: string = 'cs';
  
  calendarView: string = 'month';
  
  specialDays: any = {};
  
  currentDay: Date = new Date();
  private _currentDaySubject = new Subject();
  public currentDayChanged: Observable<any> = this._currentDaySubject.asObservable();
  
  tituly: Titul[] = [];
  
  currentTitul: Titul = new Titul();
  private _currentTitulSubject = new Subject();
  public currentTitulChanged: Observable<any> = this._currentTitulSubject.asObservable();
  currentIssue: Issue = new Issue();
  
  private _searchSubject = new Subject();
  public searchChanged: Observable<any> = this._searchSubject.asObservable();
  searchResults: any;
  numFound: number;
  
  start_date;
  end_date;
  
  
  private _searchParamsSubject = new Subject();
  public searchParamsChanged: Observable<any> = this._searchParamsSubject.asObservable();
  
  public filters: Filter[] = []; 
  
  public filterByDate: boolean;
  
  setConfig(cfg){
    
    this.config = cfg;
    
    this.periods =  this.config['periodicity'];
    this.stavy = this.config['stavy'];
    this.states = this.config['states'];
    
    
    this.config["vydani"].map(k => {this.vydani.push(k);});
    this.configured = true;
    this._configSubject.next(cfg);
  }
  
  changeLang(lang){
    this.currentLang = lang;
    
    
    this._langSubject.next(lang);
  }
  
  changeCurrentDay(d: Date){
      this.currentDay = d;
      this._currentDaySubject.next(this.currentDay);
  }
  
  setCurrentTitul(titul: Titul){
    this.currentTitul = titul;
    this._currentTitulSubject.next(this.currentTitul);
    
  }
  
  setSearchResults(res: any){
    this.searchResults = res;
    this.numFound = this.searchResults['response']['numFound'];
    let stats = this.searchResults['stats']['stats_fields']['datum_vydani_den'];
    this.start_date = stats['min'];
    this.end_date = stats['max'];
    
    this._searchSubject.next(this.searchResults);
  }
  
  addFilter(field: string, value: string){
    let f: Filter = new Filter(field, value);
    this.filters.push(f);
    this._searchParamsSubject.next(null);
  }
  
  addDateFilter(){
    this.filterByDate = true;
    this._searchParamsSubject.next(null);
  }
  
  removeDateFilter(){
    this.filterByDate = false;
    this._searchParamsSubject.next(null);
  }
  
  removeFilter(idx: number){
    this.filters.splice(idx, 1);
    this._searchParamsSubject.next(null);
  }
  
  removeAllFilters(){
    this.filters = [];
    this._searchParamsSubject.next(null);
  }
  
  hasFilter(field: string): boolean{
    for(let i = 0; i< this.filters.length; i++){
      if (this.filters[i].field === field){
        return true;
      }
    }
    return false;
  }
  
  hasFacet(field: string): boolean{
    if (!this.searchResults) return false;
    
    if (!this.searchResults['facet_counts']['facet_fields'].hasOwnProperty(field)) return false;
    
    return this.searchResults['facet_counts']['facet_fields'][field].length > 1;
  }
  
}
