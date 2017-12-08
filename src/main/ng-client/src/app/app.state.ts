import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
  
@Injectable()
export class AppState {
  public activePage = '';
  
  private _stateSubject = new Subject();
  public stateChangedSubject: Observable<any> = this._stateSubject.asObservable();
  
  public _configSubject = new Subject();
  public configSubject: Observable<any> = this._configSubject.asObservable();
  
  //Holds client configuration
  config: any;
  
  currentLang: string = 'cs';
  configured: boolean = false;
  
  specialDays: any = {};
  
  
  currentDay: Date = new Date();
  private _currentDaySubject = new Subject();
  public currentDayChanged: Observable<any> = this._currentDaySubject.asObservable();
  
  setConfig(cfg){
    this.configured = true;
    this._configSubject.next(cfg);
  }
  
  changeCurrentDay(d: Date){
      this.currentDay = d;
      this._currentDaySubject.next(this.currentDay);
  }
  
}
