import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import {Titul} from './models/titul';
import {Issue} from './models/issue';
  
@Injectable()
export class AppState {
  public activePage = '';
  
  private _stateSubject = new Subject();
  public stateChangedSubject: Observable<any> = this._stateSubject.asObservable();
  
  public _configSubject = new Subject();
  public configSubject: Observable<any> = this._configSubject.asObservable();
  
  //Holds client configuration
  config: any;
  configured: boolean = false;
  
  currentLang: string = 'cs';
  
  calendarView: string = 'month';
  
  specialDays: any = {};
  
  currentDay: Date = new Date();
  private _currentDaySubject = new Subject();
  public currentDayChanged: Observable<any> = this._currentDaySubject.asObservable();
  
  currentTitul: Titul = new Titul();
  currentIssue: Issue = new Issue();
  
  setConfig(cfg){
    this.configured = true;
    this._configSubject.next(cfg);
  }
  
  changeCurrentDay(d: Date){
      this.currentDay = d;
      this._currentDaySubject.next(this.currentDay);
  }
  
}
