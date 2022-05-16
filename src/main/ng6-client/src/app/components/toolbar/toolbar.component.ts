import { Component, /*OnInit,*/ OnDestroy } from '@angular/core';

import { AppState } from '../../app.state';
import { AppService } from '../../app.service';

import { CloneDialogComponent } from '../clone-dialog/clone-dialog.component';
import { CloneParams } from '../../models/clone-params';
import { AddVdkExComponent } from '../add-vdk-ex/add-vdk-ex.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { Router, ActivatedRoute } from '@angular/router';
import { Exemplar } from 'src/app/models/exemplar';
import { HttpErrorResponse } from '@angular/common/http';
import { AppConfiguration } from 'src/app/app-configuration';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements /*OnInit,*/ OnDestroy {

  subscriptions: Subscription[] = [];
  periods = [];

  header = '';

  constructor(
    public dialog: MatDialog,
    public state: AppState,
    public service: AppService,
    private router: Router,
    private route: ActivatedRoute,
    public config: AppConfiguration) { }

  /*
  ngOnInit() {
    // this.subscriptions.push(this.state.searchChanged.subscribe(res => {
    //   this.setHeader();
    // }));
  }
  */

  ngOnDestroy() {
    this.subscriptions.forEach(s => {
      s.unsubscribe();
    });
    this.subscriptions = [];
  }

  setHeader() {
    this.header = '';
    const data = this.state.searchResults.response.docs;
    if (data && data.length > 0) {
      this.setCommonColumns(data, 'meta_nazev');
      this.setCommonColumns(data, 'mutace');
      this.setCommonColumns(data, 'vydani');
    }
  }

  setCommonColumns(data: any, field: string) {
    if (!this.state.hasFacet(field)) {
      if (data[0][field] && data[0][field] !== '') {
        this.header += this.service.getTranslation('facet.' + field) + ': ' + data[0][field] + '<span class="app-pipe"></span>';
      }
    }
  }

  showCalendar() {
    return this.state.activePage.indexOf('/calendar') > -1;
  }

  showResult() {
    // this.state.setCurrentTitul(this.item);
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
      if (res === 'error') {
        alert('Invalid data!');
      } else if (res.error) {
        this.service.showSnackBar('snackbar.error_saving_current_title', res.error, true);
      } else {
        this.service.showSnackBar('snackbar.the_current_title_has_been_successfully_saved');
      }
    });
  }

  saveRecord() {

    this.state.currentIssue.exemplare.forEach((ex: Exemplar) => {
      ex.pages = { missing: [], damaged: [] };
      ex.pagesRange.damaged.forEach(p => {
        if (p.sel) {
          ex.pages.damaged.push(p.label);
        }

      });
      ex.pagesRange.missing.forEach(p => {
        if (p.sel) {
          ex.pages.missing.push(p.label);
        }

      });
    });

    this.state.currentIssue.state = 'ok';
    this.service.saveCurrentIssue().subscribe(res => {
      console.log(res);
      if (res === 'error') {
        alert('Invalid data!');
      } else if (res.error) {
        this.service.showSnackBar('snackbar.error_saving_current_issue', res.error, true);
      } else {
        this.service.showSnackBar('snackbar.the_current_issue_was_saved_correctly');
      }
    },
      (error: HttpErrorResponse) => {
        console.log(error);
        this.service.showSnackBar('snackbar.error_saving_current_issue', error.message, true);
      });

  }

  deleteRecord() {

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '650px',
      data: {
        caption: 'modal.delete_record.caption',
        text: 'modal.delete_record.text',
        param: {
          value: this.state.currentIssue.titul.meta_nazev +
            ' ' + this.state.currentIssue.datum_vydani +
            ' ' + this.state.currentIssue.mutace +
            ' ' + this.state.currentIssue.vydani
        }
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.service.deleteIssue(this.state.currentIssue).subscribe(res => {
          console.log(res);
          if (res.error) {
            this.service.showSnackBar('snackbar.error_deleting_volume', res.error, true);
          } else {
            this.router.navigate(['/result']);
          }
        });
      }
    });

  }

  openCloneDialog() {
    const cloneParams = new CloneParams();
    cloneParams.id = this.state.currentIssue.id;
    cloneParams.start_date = this.state.currentIssue.datum_vydani;
    cloneParams.end_date = this.state.currentIssue.datum_vydani;
    cloneParams.start_number = this.state.currentIssue.cislo;
    cloneParams.start_year = parseInt(this.state.currentIssue.rocnik);
    cloneParams.periodicity = this.state.currentIssue.periodicita;

    const dialogRef = this.dialog.open(CloneDialogComponent, {
      width: '650px',
      data: {
        params: cloneParams
      }
    });

  }



  addVDKEx() {

    const dialogRef = this.dialog.open(AddVdkExComponent, {
      width: '650px'
    });
    // this.modalService.open(AddVdkExComponent, { 'state': this.state, 'service': this.service });
  }
}
