import { Component, OnInit } from '@angular/core';

import {AppState} from '../../app.state';
import {AppService} from '../../app.service';

import {Issue} from '../../models/issue';
import {Titul} from '../../models/titul';
import {StavIssue} from '../../models/stav-issue.enum';
import {StateIssue} from '../../models/state-issue.enum';
import {MzModalService} from 'ng2-materialize';
import {CloneDialogComponent} from '../clone-dialog/clone-dialog.component';
import {CloneParams} from '../../models/clone-params';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {
  stavy = [];
  states = [];
  periods = [];

  constructor(
    public state: AppState,
    public service: AppService,
    private modalService: MzModalService) { }

  ngOnInit() {
  }
  
  showCalendar(){
    return this.state.activePage.indexOf('/calendar') > -1;
  }
  
  showResult(){
    return this.state.activePage.indexOf('/result') > -1;
  }

  showIssue(){
    return this.state.activePage.indexOf('/issue') > -1;
  }
  
  showAddRecord(){
    return this.state.activePage.indexOf('/add-record') > -1;
  }
  
  addRecord(){
    this.service.saveIssue().subscribe(res => {
      console.log(res);
    });
  }
  
  saveRecord(){
    this.service.saveIssue().subscribe(res => {
      console.log(res);
    });
    
  }
  
  openCloneDialog() {
    let cloneParams = new CloneParams();
    cloneParams.id = this.state.currentIssue.id;
    cloneParams.start_date = this.state.currentIssue.datum_vydani;
    cloneParams.end_date = this.state.currentIssue.datum_vydani;
    cloneParams.start_number = this.state.currentIssue.cislo;
    cloneParams.start_year = this.state.currentIssue.rocnik_number;
    
    this.modalService.open(CloneDialogComponent, {"periods": this.periods, "state": this.state, "service": this.service, "params": cloneParams});
  }
}
