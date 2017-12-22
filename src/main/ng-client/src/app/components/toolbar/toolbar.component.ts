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
  
  
  
  openCloneDialog() {
    let cloneParams = new CloneParams();
    cloneParams.cloneOd = this.state.currentIssue.datum_vydani;
    cloneParams.cloneDo = this.state.currentIssue.datum_vydani;
    cloneParams.periodicity = this.state.currentIssue.periodicita;
    console.log(cloneParams);
    this.modalService.open(CloneDialogComponent, {"periods": this.periods, "state": this.state, "params": cloneParams});
  }
}
