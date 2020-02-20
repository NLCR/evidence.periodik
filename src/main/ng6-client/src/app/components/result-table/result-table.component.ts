import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {Input} from '@angular/core';
import {Issue} from '../../models/issue';
import {AppState} from '../../app.state';
import {AddExemplarDialogComponent} from '../add-exemplar-dialog/add-exemplar-dialog.component';
import {AppService} from '../../app.service';
import {Titul} from '../../models/titul';
import {Router} from '@angular/router';
import {Exemplar} from '../../models/exemplar';
import {TranslateService} from '@ngx-translate/core';
import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component';
import { AppConfiguration } from 'src/app/app-configuration';

@Component({
  selector: 'app-result-table',
  templateUrl: './result-table.component.html',
  styleUrls: ['./result-table.component.scss']
})
export class ResultTableComponent implements OnInit {

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  data: Issue[] = [];
  vlastnici: string[] = [];
  exs: any = {};
  displayedColumns = ['meta_nazev', 'mutace', 'datum_vydani', 'vydani'];
  header = '';
  dataSource: MatTableDataSource<Issue>;
  loading: boolean;


  constructor(
    private router: Router,
    public state: AppState,
    public service: AppService,
    private translate: TranslateService,
    public config: AppConfiguration) {


    // Assign the data to the data source for the table to render
  }

  ngOnInit() {
    if (this.data) {
      this.dataSource = new MatTableDataSource([]);
      this.setData();
    }
    this.state.searchChanged.subscribe(res => {
      this.dataSource = new MatTableDataSource([]);
      this.setData();
    });
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
    this.loading = true;
    // Extract exemplare per vlastnik
    this.vlastnici = [];
    this.exs = {};
    this.displayedColumns = [];
    this.header = '';
    this.data = this.state.searchResults['response']['docs'];
    if (this.data.length === 0) {
      this.loading = false;
      return;
    }

    this.addColumn('meta_nazev');
    this.addColumn('mutace');
    this.displayedColumns.push('datum_vydani');
    this.addColumn('vydani');


    this.displayedColumns.push('cislo', 'pocet_stran', 'add');
    this.data.forEach((issue: Issue) => {
      if (!issue.znak_oznaceni_vydani) {
        issue.znak_oznaceni_vydani = '*';
      }
      if (issue.exemplare) {
        issue.exemplare = issue.exemplare.sort((ex1, ex2) => ex1.carovy_kod.localeCompare(ex2.carovy_kod) > 0 ? 1 : -1);
        const exs = issue.exemplare;
        for (let i = 0; i < exs.length; i++) {
          // let ck = exs[i].vlastnik + ' - ' + exs[i].signatura;
          const vlastnik = exs[i].vlastnik;
          if (!this.exs.hasOwnProperty(vlastnik) && vlastnik !== '') {
            this.vlastnici.push(vlastnik);
            this.exs[vlastnik] = exs[i];
            this.displayedColumns.push(vlastnik);
          } else {

          }
          //issue[ck] = i;
        }
      }
    }    );

//    this.data.forEach((issue: Issue) =    > {
//      for (let i = 0; i < this.cks.length; i++    ) {
//        if (!issue.hasOwnProperty(this.cks[i])    ) {
//          issue[this.cks[i]] =     -1;
//            }
//          }
//    });

    this.dataSource = new MatTableDataSource(this.data);
    this.dataSource.paginator = this.paginator;
    this.loading = false;
  }

  cellColor(row: Issue, vlastnik: string): string {
    if (row.hasOwnProperty('exemplare')) {
      for (let i = 0; i < row.exemplare.length; i++) {
        if (row.exemplare[i]['vlastnik'] === vlastnik) {
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
      if (ex.stav.length === 0) {
        return "app-icon-uncontrolled";
      } else if (ex.stav.indexOf('OK') > -1) {
        if (ex.stav.length > 1) {
          return "app-icon-complete-degradation";
        } else {
          return "app-icon-complete";
        }
      } else {
        return "app-icon-damaged-document";
      }
    } else {
      return "app-icon-uncontrolled";
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
    /* this.modalService.open(AddExemplarDialogComponent,
      {'issue': issue, 'state': this.state, 'service': this.service, exemplar: new Exemplar(), editType: 'new'}
    ); */

  }

  viewClick(issue: Issue, ex: Exemplar) {
   /*  this.modalService.open(AddExemplarDialogComponent,
      {'issue': issue, 'state': this.state, 'service': this.service, 'exemplar': ex, editType: 'edit'}
    ); */
  }

  deleteEx(issue: Issue, ex: Exemplar, idxex: number) {


    /* const a = this.modalService.open(ConfirmDialogComponent,
      {
        caption: 'modal.delete_exemplar.caption',
        text: 'modal.delete_exemplar.text',
        param: {
          value: ex.carovy_kod
        }
      });
    a.onDestroy(() => {
      const mm = <ConfirmDialogComponent> a.instance;
      if (mm.confirmed) {
        //console.log(issue.exemplare[idxex]);
        issue.exemplare.splice(idxex, 1);
        //console.log(issue.exemplare);
        this.service.saveIssue(issue).subscribe(res => {
          this.toastService.show('Deleted success!', 2000, 'green');
        });
      }
    }); */


  }

  duplicate(issue: Issue, ex: Exemplar) {
    /* const a = this.modalService.open(AddExemplarDialogComponent,
      {
        'issue': issue,
        'state': this.state,
        'service': this.service,
        'exemplar': ex,
        editType: 'duplicate'
      }
    );

    a.onDestroy(() => {
      const mm = <AddExemplarDialogComponent> a.instance;
      if (mm.saved) {
        this.service.search().subscribe(res => {
          this.state.setSearchResults(res);
          //this.docs = this.state.
        });
      }
    }); */
  }


  onCalendarClick(issue: Issue) {
    this.state.currentTitul = new Titul();
    this.state.currentTitul.id = issue.id_titul;
    this.state.currentTitul.meta_nazev = issue.nazev;
    this.router.navigate(['/calendar', issue.id_titul, this.state.calendarView, issue['datum_vydani_den']]);

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
      for (let i = 0; i < ex['stav'].length; i++) {
        ret += this.translate.instant('record.StavIssue.' + ex['stav'][i]) + '\n';
      }
      if (ex['stav_popis']) {
        ret += ' ' + ex['stav_popis'];
      }
    return ret;
    } else {
      return 'nekonrolováno ';
    }
  }
}
