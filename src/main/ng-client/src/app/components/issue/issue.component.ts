import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {Router, ActivatedRoute, ParamMap} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';

import {AppState} from '../../app.state';
import {AppService} from '../../app.service';

import {Issue} from '../../models/issue';
import {Titul} from '../../models/titul';
import {StavIssue} from '../../models/stav-issue.enum';
import {StateIssue} from '../../models/state-issue.enum';
import {MzModalService} from 'ng2-materialize';
import {CloneDialogComponent} from '../clone-dialog/clone-dialog.component';
import {CloneParams} from '../../models/clone-params';
import {Exemplar} from '../../models/exemplar';

@Component({
  selector: 'app-issue',
  templateUrl: './issue.component.html',
  styleUrls: ['./issue.component.scss']
})
export class IssueComponent implements OnInit {
  subscriptions: Subscription[] = [];

  stavy = [];
  states = [];
  vydani = [];
  periods = [];

  //issue: Issue = new Issue();
  public options: Pickadate.DateOptions = {
    format: 'dd/mm/yyyy',
    formatSubmit: 'yyyy-mm-dd',
  };

  constructor(
    private cdRef: ChangeDetectorRef,
    private modalService: MzModalService,
    private route: ActivatedRoute,
    public state: AppState,
    private service: AppService) {
    Object.keys(StavIssue).map(k => {this.stavy.push({key: k, value: StavIssue[k]});});
    Object.keys(StateIssue).map(k => {this.states.push({key: k, value: StateIssue[k]});});
  }

  onSubmit() {
    //console.log(this.issue);
  }

  setData(res: any[]) {
    this.vydani = [];
    this.state.config["vydani"].map(k => {this.vydani.push(k);});
    if (res.length > 0) {
      Object.keys(this.state.config['periodicity']).map(k => {this.periods.push({key: k, value: this.state.config['periodicity'][k]});});
      this.state.currentIssue = new Issue().fromJSON(res[0]);
      if (!this.state.currentIssue.hasOwnProperty('exemplare')) {
        this.state.currentIssue['exemplare'] = [];
      }
      console.log(this.state.currentIssue);
      this.service.getTitul(this.state.currentIssue.id_titul).subscribe(res2 => {
        if (res2.length > 0) {
          this.state.currentTitul = res2[0];
        }
      });
    } else {
      this.state.currentIssue = new Issue();
    }
  }

  langChanged() {
    this.stavy = [];
    this.states = [];
    this.vydani = [];
    this.cdRef.detectChanges();
    this.state.config["vydani"].map(k => {this.vydani.push(k);});
    Object.keys(StavIssue).map(k => {this.stavy.push({key: k, value: StavIssue[k]});});
    Object.keys(StateIssue).map(k => {this.states.push({key: k, value: StateIssue[k]});});
    this.cdRef.detectChanges();
  }


  ngOnDestroy() {
    this.subscriptions.forEach((s: Subscription) => {
      s.unsubscribe();
    });
    this.subscriptions = [];
  }

  ngOnInit() {
    this.state.currentTitul = new Titul();
    this.state.currentIssue = new Issue();
    let id = this.route.snapshot.paramMap.get('id');
    if (this.state.config) {
      this.service.getIssue(id).subscribe(res => {
        this.setData(res);
      });
    } else {
      this.subscriptions.push(this.state.configSubject.subscribe((state) => {
        this.service.getIssue(id).subscribe(res => {
          this.setData(res);
        });
      }));
    }


    this.subscriptions.push(this.service.langSubject.subscribe((lang) => {

      this.langChanged();
    }));
  }
  
  addExemplar() {
    this.state.currentIssue.exemplare.push(new Exemplar());
  }
}
