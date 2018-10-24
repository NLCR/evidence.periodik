import {Component, OnInit} from '@angular/core';

import {AppState} from '../../app.state';
import {AppService} from '../../app.service';

import {Issue} from '../../models/issue';
import {Titul} from '../../models/titul';
import {MzModalService, MzToastService} from 'ngx-materialize';
import {CloneDialogComponent} from '../clone-dialog/clone-dialog.component';
import {CloneParams} from '../../models/clone-params';
import {AddVdkExComponent} from '../add-vdk-ex/add-vdk-ex.component';
import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component';
import {Router} from '@angular/router';
import {Exemplar} from "src/app/models/exemplar";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {
  periods = [];

  constructor(
    public state: AppState,
    public service: AppService,
    private router: Router,
    private toastService: MzToastService,
    private modalService: MzModalService) {}

  ngOnInit() {
  }

  showCalendar() {
    return this.state.activePage.indexOf('/calendar') > -1;
  }

  showResult() {
    return this.state.activePage.indexOf('/result') > -1;
  }

  showIssue() {
    return this.state.activePage.indexOf('/issue') > -1;
  }

  showAddRecord() {
    return this.state.activePage.indexOf('/add-record') > -1;
  }

  addRecord() {
    this.service.saveCurrentIssue().subscribe(res => {
      //console.log(res);
      if (res === 'error') {
        alert("Invalid data!")
      } else if (res['error']) {
        this.toastService.show(res['error'], 4000, 'red');
      } else {
        this.toastService.show('Saved!!', 2000, 'green');
      }
    });
  }

  saveRecord() {
    //console.log(this.state.currentIssue);
    this.state.currentIssue.exemplare.forEach((ex: Exemplar) => {
      ex.pages = [];
      ex.pagesRange.forEach(p => {
        if (p.sel)
          ex.pages.push(p.label);
      });
    });

    this.state.currentIssue.state = 'ok';
    this.service.saveCurrentIssue().subscribe(res => {
      //console.log(res);
      if (res === 'error') {
        alert("Invalid data!")
      } else if (res['error']) {
        this.toastService.show(res['error'], 4000, 'red');
      } else {
        this.toastService.show('Saved!!', 2000, 'green');
      }
    },
    (error: HttpErrorResponse) =>{
      console.log(error);
      this.toastService.show(error.message, 4000, 'red');
    });

  }

  deleteRecord() {

    let a = this.modalService.open(ConfirmDialogComponent,
      {
        caption: 'modal.delete_record.caption',
        text: "modal.delete_record.text",
        param: {
          value: this.state.currentIssue.titul.meta_nazev +
          ' ' + this.state.currentIssue.datum_vydani +
          ' ' + this.state.currentIssue.mutace +
          ' ' + this.state.currentIssue.vydani
        }
      });
    a.onDestroy(() => {
      let mm = <ConfirmDialogComponent> a.instance;
      if (mm.confirmed) {
        this.service.deleteIssue(this.state.currentIssue).subscribe(res => {
          console.log(res);
          if (res['error']) {
            this.toastService.show(res['error'], 4000, 'red');
          } else {
            this.router.navigate(['/result']);
          }
        });
      }
    });

  }

  openCloneDialog() {
    let cloneParams = new CloneParams();
    cloneParams.id = this.state.currentIssue.id;
    cloneParams.start_date = this.state.currentIssue.datum_vydani;
    cloneParams.end_date = this.state.currentIssue.datum_vydani;
    cloneParams.start_number = this.state.currentIssue.cislo;
    cloneParams.start_year = parseInt(this.state.currentIssue.rocnik);
    cloneParams.periodicity = this.state.currentIssue.periodicita;

    this.modalService.open(CloneDialogComponent, {"state": this.state, "service": this.service, "params": cloneParams});
  }



  addVDKEx() {
    this.modalService.open(AddVdkExComponent, {"state": this.state, "service": this.service});
  }
}
