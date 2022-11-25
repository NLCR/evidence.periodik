import { Component, OnInit, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Issue } from '../../models/issue';
import { AppState } from '../../app.state';
import { AddExemplarDialogComponent } from '../add-exemplar-dialog/add-exemplar-dialog.component';
import { AppService } from '../../app.service';
import { Titul } from '../../models/titul';
import { Router } from '@angular/router';
import { Exemplar } from '../../models/exemplar';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { AppConfiguration } from 'src/app/app-configuration';
import { Subscription } from 'rxjs';
import { SvazekOverviewComponent } from '../svazek-overview/svazek-overview.component';

@Component({
  selector: 'app-result-table',
  templateUrl: './result-table.component.html',
  styleUrls: ['./result-table.component.scss']
})
export class ResultTableComponent implements OnInit, OnDestroy {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  subscriptions: Subscription[] = [];
  data: Issue[];
  vlastnici: { name: string, collapsed: boolean }[] = [];
  exs: any = {};
  displayedColumns = ['meta_nazev', 'mutace', 'datum_vydani', 'nazev', 'vydani'];
  header = '';
  dataSource: MatTableDataSource<Issue>;
  loading = true;

  constructor(
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog,
    private router: Router,
    public state: AppState,
    public service: AppService,
    private translate: TranslateService,
    public config: AppConfiguration) { }

  ngOnInit() {

    // this.dataSource = new MatTableDataSource([]);
    this.data = [];
    this.setData();

    this.subscriptions.push(this.state.searchChanged.subscribe(res => {
      this.dataSource = null;
      this.vlastnici = null;
      this.data = [];
      setTimeout(() => {
        this.setData();
      }, 1);
    }));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => {
      s.unsubscribe();
    });
    this.subscriptions = [];
  }

  addColumn(field: string) {
    if (this.state.hasFacet(field)) {
      this.displayedColumns.push(field);
    } else {
      if (this.data[0][field] && this.data[0][field] !== '') {
        this.header += field + ': ' + this.data[0][field] + '; ';
      }
    }
  }

  setData() {

    this.dataSource = null;
    this.loading = true;
    if (!this.state.searchResults) {
      return;
    }
    // Extract exemplare per vlastnik
    this.vlastnici = [];
    this.exs = {};
    this.displayedColumns = [];
    this.header = '';
    this.data = [];
    this.state.searchResults.grouped.id_issue.groups.forEach((group) => {
      const issue = new Issue().fromJSON(group.doclist.docs[0]);
      issue.id = group.groupValue;
      issue.exemplare = [];
      group.doclist.docs.forEach(doc => {
        issue.exemplare.push(doc);
      });
      this.data.push(issue);
    });
    // this.data = Object.assign([], this.state.searchResults.response.docs);
    if (this.data.length === 0) {
      this.loading = false;
      return;
    }

    this.addColumn('meta_nazev');
    this.addColumn('mutace');
    this.displayedColumns.push('datum_vydani');
    this.addColumn('nazev');
    this.addColumn('vydani');


    this.displayedColumns.push('cislo', 'pocet_stran', 'add');
    this.data.forEach((issue: Issue) => {
      if (!issue.znak_oznaceni_vydani) {
        issue.znak_oznaceni_vydani = '*';
      }
      if (issue.exemplare) {
        issue.exemplare = issue.exemplare.sort((ex1, ex2) => ex1.carovy_kod.localeCompare(ex2.carovy_kod) > 0 ? 1 : -1);
        const exs = issue.exemplare;
        exs.forEach(ex => {
          const vlastnik = ex.vlastnik;
          if (!this.exs.hasOwnProperty(vlastnik) && vlastnik !== '') {
            this.vlastnici.push({ name: vlastnik, collapsed: false });
            this.exs[vlastnik] = ex;
            this.displayedColumns.push(vlastnik);
          } else {

          }
        });
      }
    });
    this.dataSource = new MatTableDataSource(this.data);
    this.dataSource.paginator = this.paginator;
    this.loading = false;
    this.cdr.detectChanges();
  }

  cellColor(row: Issue, vlastnik: string): string {
    if (row.hasOwnProperty('exemplare')) {
      for (let i = 0; i < row.exemplare.length; i++) {
        if (row.exemplare[i].vlastnik === vlastnik) {
          return this.classByVlastnik(vlastnik);
        }
      }
    }
    return '';
  }

  iconByStav(ex: Exemplar): string {
    if (ex.stav) {
      if (ex.stav.length === 0) {
        return this.config.icons.uncontrolled;
      } else if (ex.stav.indexOf('OK') > -1) {
        return this.config.icons.check_circle;
      } else if (ex.stav.indexOf('ChS') > -1) {
        return this.config.icons.missing_page;
      } else {
        return this.config.icons.damaged_document;
      }
    } else {
      return this.config.icons.uncontrolled;
    }

  }

  classByStav(ex: Exemplar): string {
    if (ex.stav) {
      if(ex.stav.includes("ChS")){
        return "exStav app-icon-missing-page"
      }
      if(ex.stav.some(es => this.state.stavy.filter(s => s !== "OK").includes(es))){
        return 'exStav app-icon-damaged-document';
      }
      if(ex.stav.includes("OK")){
        return 'exStav app-icon-complete';
      }
      if (ex.stav.length === 0) {
        return 'exStav app-icon-uncontrolled';
      }
    } else {
      return 'exStav app-icon-uncontrolled';
    }
  }

  classByVlastnik(vlastnik: string): string {
    switch (vlastnik) {
      case 'MZK': {
        return 'app-header-cell-mzk';
      }
      case 'NKP': {
        return 'app-header-cell-nkp';
      }
      case 'UKF': {
        return 'app-header-cell-ukf';
      }
      case 'VKOL': {
        return 'app-header-cell-vkol';
      }
      default: {
        return 'app-header-cell-default';
      }
    }
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  addClick(issue: Issue) {

    const dialogRef = this.dialog.open(AddExemplarDialogComponent, {
      width: '650px',
      data: { issue, exemplar: new Exemplar(), editType: 'new' }
    });

  }

  viewClick(issue: Issue, ex: Exemplar) {

    const dialogRef = this.dialog.open(AddExemplarDialogComponent, {
      width: '650px',
      data: { issue, exemplar: ex, editType: 'edit' }
    });

  }

  deleteEx(issue: Issue, ex: Exemplar, idxex: number) {

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '650px',
      data: {
        caption: 'modal.delete_exemplar.caption',
        text: 'modal.delete_exemplar.text',
        param: {
          value: ex.carovy_kod
        }
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        issue.exemplare[idxex].numExists = false;
        issue.exemplare[idxex].cislo = 0;
        issue.exemplare[idxex].signatura = '';
        issue.exemplare[idxex].stav_popis = '';
        issue.exemplare[idxex].pages = { missing: [], damaged: [] };
        issue.exemplare[idxex].oznaceni = '';
        issue.exemplare[idxex].poznamka = '';
        issue.exemplare[idxex].nazev = '';
        issue.exemplare[idxex].podnazev = '';
        issue.exemplare[idxex].vydani = '';
        issue.exemplare[idxex].mutace = '';
        issue.exemplare[idxex].periodicita = '';
        issue.exemplare[idxex].rocnik = '';
        issue.exemplare[idxex].cas_vydani = 0;
        issue.exemplare[idxex].pocet_stran = 0;
        issue.exemplare[idxex].stav = [];
        this.service.saveIssue(issue).subscribe(res => {
          this.service.showSnackBar('snackbar.delete_success');
          issue.exemplare.splice(idxex, 1);
        });
      }
    });

  }

  duplicate(issue: Issue, ex: Exemplar) {
    console.warn("Using bad endpoint!!! Remove issue")
    const dialogRef = this.dialog.open(AddExemplarDialogComponent, {
      width: '650px',
      data: { issue, exemplar: ex, editType: 'duplicate' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.service.search().subscribe(res => {
          this.state.setSearchResults(res);
        });
      }
    });
  }


  onCalendarClick(issue: Issue) {
    this.state.currentTitul = new Titul();
    this.state.currentTitul.id = issue.id_titul;
    this.state.currentTitul.meta_nazev = issue.nazev;
    this.router.navigate(['/calendar', issue.id_titul, this.state.calendarView, issue.datum_vydani_den]);

  }

  viewIssue(issue: Issue) {
    this.state.currentTitul = new Titul();
    this.state.currentTitul.id = issue.id_titul;
    this.state.currentTitul.meta_nazev = issue.nazev;
    this.router.navigate(['/issue', issue.id]);
  }

  viewSvazek(car_kod: string) {
    this.state.currentTitul = new Titul();
    this.router.navigate(['/svazek', car_kod]);
  }

  formatStav(ex: Exemplar): string {
    if (ex.stav) {
      let ret = '';
      for (let i = 0; i < ex.stav.length; i++) {
        if (ex.stav.length > 1) {
          ret += this.translate.instant('record.StavIssue.' + ex.stav[i]);
          if (ex.stav_popis) {
            ret += ' "' + ex.stav_popis + '"';
          }
          if (i < ex.stav.length - 1) {
            ret += ' | ';
          }

        } else if (ex.stav.length === 1) {
          ret += this.translate.instant('record.StavIssue.' + ex.stav[i]);
          if (ex.stav_popis) {
            ret += ' ' + ex.stav_popis;
          }
        }
      }

      return ret;
    } else {
      return 'nekontrolováno ';
    }
  }

  toggleCollapsed(vl) {
    vl.collapsed = !vl.collapsed;
  }

  showSvazekOverview(carKod: string, idTitul: string) {
    this.dialog.open(SvazekOverviewComponent, {
      width: '650px',
      data: {
        carKod,
        idTitul
      }
    });
  }

  pageChanged(e: PageEvent) {
    // this.state.rows = e.pageSize;
    // this.state.gotoPage(e.pageIndex);
  }



}
