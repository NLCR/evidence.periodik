import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
  
@Injectable()
export class AppState {

  private _stateSubject = new Subject();
  public stateChangedSubject: Observable<any> = this._stateSubject.asObservable();
  
  public _configSubject = new Subject();
  public configSubject: Observable<any> = this._configSubject.asObservable();
  
  //Holds client configuration
  config: any;
  
  currentLang: string = 'cs';
  configured: boolean = false;
  
  
  setConfig(cfg){
    this.config = cfg;
    this.configured = true;
    this._configSubject.next(cfg);
  }
  
}
