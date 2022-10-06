import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';

import { AppState } from '../../app.state';
import { AppService } from '../../app.service';
import { Issue } from '../../models/issue';
import { AddExemplarDialogComponent } from '../add-exemplar-dialog/add-exemplar-dialog.component';

@Component({
  selector: 'app-add-vdk-ex',
  templateUrl: './add-vdk-ex.component.html',
  styleUrls: ['./add-vdk-ex.component.scss']
})
export class AddVdkExComponent {

  // @ViewChild(NgProgressComponent) progressBar: NgProgressComponent;



  public issue: Issue;

  public url = 'https://aleph.vkol.cz/OAI?verb=GetRecord&identifier=oai:aleph.vkol.cz:SVK01_VKOLOAI-000315244&metadataPrefix=marc21';
  public format = 'MESIC_SLOVA';
  public vlastnik = 'VKOL';

  //  public url: string = 'http://vdk.nkp.cz/vdk/original?id=oai:aleph.mzk.cz:MZK01-000244261&wt=xml'  ;
  //  public format: string = 'CISLO'  ;
  //  public vlastnik: string = 'MZK';

  public barcode: string;
  public onspecial = false;

  public prepared = false;
  public exs: any[] = [];
  public exsFiltered: any[] = [];

  public year_filter = '';
  public selection = false;

  displayedColumns = ['id', 'year', 'volume', 'od', 'do', 'add'];
  dataSource: MatTableDataSource<Issue> = new MatTableDataSource(this.exsFiltered);

  loading = false;

  constructor(
    public dialogRef: MatDialogRef<AddExemplarDialogComponent>,
    public state: AppState,
    private service: AppService) {
  }

  prepare() {
    /* if (this.progressBar) {
      this.progressBar.start();
    } */
    this.loading = true;
    const ops = {
      format: this.format,
      vlastnik: this.vlastnik,
      periodicity: this.state.currentIssue.periodicita,
      barcode: this.barcode,
      onspecial: this.onspecial
    };
    this.service.prepareVdkEx(this.state.currentIssue, this.url, ops).subscribe(res => {

      if (res.error) {
        // this.toastService.show(res['error'], 4000, 'red');
      } else {
        this.exs = [];
        res.exs.sort((ex1: any, ex2: any) => {
          if (ex1.add.start_date && ex2.add.start_date) {
            return parseInt(ex1.add.start_date) - parseInt(ex2.add.start_date);
          } else {
            return parseInt(ex1.add.year) - parseInt(ex2.add.year);
          }
        });

        for (let i = 0; i < res.exs.length; i++) {
          const orig: any = {};
          Object.assign(orig, res.exs[i]);
          orig.isOrig = true;
          this.exs.push(orig);
          this.exs.push(res.exs[i]);
        }
        this.filter();
      }

      this.prepared = true;
      this.loading = false;
    });

  }

  toggleSelection() {
    //    this.selection = !this.selection;
    this.exsFiltered.forEach(ex => { ex.selected = this.selection; });
  }

  checkSelection() {
    const all = this.exsFiltered.filter(ex => {
      return ex.selected;
    }).length === this.exsFiltered.length;

    const none = this.exsFiltered.filter(ex => {
      return ex.selected;
    }).length === 0;

    if (all) {
      this.selection = true;
    } else if (none) {
      this.selection = false;
    } else {
      this.selection = null;
    }
  }

  isOrigRow = (index, item) => item.isOrig;

  filter() {
    this.exsFiltered = [];
    if (this.year_filter === '') {
      this.exsFiltered = this.exs;
    } else {
      this.exsFiltered = this.exs.filter(ex => {
        return ex.add.year === this.year_filter;
      });
    }

    this.dataSource = new MatTableDataSource(this.exsFiltered);
  }

  cancel() {

  }

  ok() {
    const ops = {
      format: this.format,
      vlastnik: this.vlastnik,
      periodicity: this.state.currentIssue.periodicita,
      barcode: this.barcode,
      onspecial: this.onspecial
    };

    const toIndex = this.exsFiltered.filter(ex => {
      return ex.selected;
    });
    this.indexNext(toIndex);
    //
    //    toIndex.forEach(ex => {
    //      this.service.duplicateExemplar(this.state.currentIssue, this.vlastnik,
    //        ex['add']['start_cislo'],
    //        this.onspecial,
    //        ex['permonik'],
    //        ex['add']['start_date'],
    //        ex['add']['end_date']).subscribe(res => {
    //          if (res['error']) {
    //            this.toastService.show(res['error'], 4000, 'red');
    //          }
    //        });
    //    });
  }

  indexNext(toIndex: any[]) {
    if (toIndex.length > 0) {
      const ex = toIndex[0];
      this.service.duplicateExemplar(this.state.currentIssue, this.vlastnik,
        ex.add.start_cislo,
        this.onspecial,
        ex.permonik,
        ex.add.start_date,
        ex.add.end_date).subscribe(res => {
          if (res.error) {
            // this.toastService.show(res['error'], 4000, 'red');
          } else {
            if (toIndex.length > 1) {
              this.indexNext(toIndex.slice(1));
            }
          }
        });
    }
  }

  stringify(ex: any): string {
    return JSON.stringify(ex);
  }

  hasError(ex: any): boolean {
    return ex.add.start_cislo === '-1' ||
      !ex.add.hasOwnProperty('start_date') ||
      !ex.add.hasOwnProperty('end_date');
  }
}
