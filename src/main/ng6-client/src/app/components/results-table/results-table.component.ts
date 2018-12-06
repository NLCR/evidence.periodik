import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {Input} from '@angular/core';
import {Issue} from '../../models/issue';
import {AppState} from '../../app.state';
import {AddExemplarDialogComponent} from '../add-exemplar-dialog/add-exemplar-dialog.component';
import {MzModalService, MzToastService} from 'ngx-materialize';
import {AppService} from '../../app.service';
import {Titul} from '../../models/titul';
import {Router} from '@angular/router';
import {Exemplar} from '../../models/exemplar';
import {TranslateService} from '@ngx-translate/core';
import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-results-table',
  templateUrl: './results-table.component.html',
  styleUrls: ['./results-table.component.scss']
})
export class ResultsTableComponent implements OnInit {

  data: Issue[] = [];
  vlastnici: string[] = [];
  exs: any = {};
  displayedColumns = ['meta_nazev', 'mutace', 'datum_vydani', 'vydani'];
  header: string = '';
  dataSource: MatTableDataSource<Issue>;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private router: Router,
    public state: AppState,
    public service: AppService,
    private translate: TranslateService,
    private modalService: MzModalService,
    private toastService: MzToastService) {


    // Assign the data to the data source for the table to render
  }

  ngOnInit() {
    if (this.data) {
      this.setData();
    }
    this.state.searchChanged.subscribe(res => {
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
    //Extract exemplare per vlastnik
    this.vlastnici = [];
    this.exs = {};
    this.displayedColumns = [];
    this.header = '';
    
    this.data = this.state.searchResults['response']['docs'];
    if (this.data.length === 0) {
      return;
    }

    this.addColumn('meta_nazev');
    this.addColumn('mutace');
    this.displayedColumns.push('datum_vydani');
    this.addColumn('vydani');


    this.displayedColumns.push('cislo', 'pocet_stran', 'add');
    this.data.forEach((issue: Issue) => {
      if(!issue.znak_oznaceni_vydani){
        issue.znak_oznaceni_vydani = "*";
      }
      if (issue.exemplare) {
        issue.exemplare = issue.exemplare.sort((ex1, ex2) => { return ex1.carovy_kod.localeCompare(ex2.carovy_kod) > 0 ? 1 : -1; });
        let exs = issue.exemplare;
        for (let i = 0; i < exs.length; i++) {
          //let ck = exs[i].vlastnik + ' - ' + exs[i].signatura;
          let vlastnik = exs[i].vlastnik;
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
  }

  cellColor(row: Issue, vlastnik: string): string {
    if (row.hasOwnProperty('exemplare')) {
      for (let i = 0; i < row.exemplare.length; i++) {
        if (row.exemplare[i]['vlastnik'] === vlastnik) {
          return this.colorByVlastnik(vlastnik);
        }
      }
    }
    return '';
  }
  
  iconByStav(ex: Exemplar): string{
    if(ex.stav){
    if (ex.stav.length === 0){
      return 'crop-square';
    } else if (ex.stav.indexOf('OK') > -1){
      return 'check-circle';
    } else if (ex.stav.indexOf('ChS') > -1){
      return 'format-page-break';
    } else {
      return 'alert-outline';
    }
    }else{
      return 'crop-square';
    }
    
  }
  
  colorByStav(ex: Exemplar): string{
    if(ex.stav){
    if (ex.stav.length === 0){
      return 'black';
    } else if (ex.stav.indexOf('OK') > -1){
      if(ex.stav.length > 1){
        return 'rosybrown';
      } else {
        return 'green';
      }
    } else {
      return 'red';
    }
    }else{
      return 'black';
    }
    
  }

  colorByVlastnik(vlastnik: string): string {

    switch (vlastnik) {
      case 'MZK': {
        return 'rgb(235, 228, 245)';
      }
      case 'NKP': {
        return 'rgb(245, 228, 235)';
      }
      case 'UKF': {
        return 'rgb(245, 228, 235)';
      }
      case 'VKOL': {
        return 'rgb(247, 238, 175)';
      }
      default: {
        return 'yellow';
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
    this.modalService.open(AddExemplarDialogComponent,
      {"issue": issue, "state": this.state, "service": this.service, exemplar: new Exemplar(), editType: 'new'}
    );

  }

  viewClick(issue: Issue, ex: Exemplar) {
    this.modalService.open(AddExemplarDialogComponent,
      {"issue": issue, "state": this.state, "service": this.service, "exemplar": ex, editType: 'edit'}
    );
  }

  deleteEx(issue: Issue, ex: Exemplar, idxex: number) {


    let a = this.modalService.open(ConfirmDialogComponent,
      {
        caption: 'modal.delete_exemplar.caption',
        text: "modal.delete_exemplar.text",
        param: {
          value: ex.carovy_kod
        }
      });
    a.onDestroy(() => {
      let mm = <ConfirmDialogComponent> a.instance;
      if (mm.confirmed) {
        //console.log(issue.exemplare[idxex]);
        issue.exemplare.splice(idxex, 1);
        //console.log(issue.exemplare);
        this.service.saveIssue(issue).subscribe(res => {
          this.toastService.show('Deleted success!', 2000, 'green');
        })
      }
    });


  }

  duplicate(issue: Issue, ex: Exemplar) {
    let a = this.modalService.open(AddExemplarDialogComponent,
      {
        "issue": issue,
        "state": this.state,
        "service": this.service,
        "exemplar": ex,
        editType: 'duplicate'
      }
    );

    a.onDestroy(() => {
      let mm = <AddExemplarDialogComponent> a.instance;
      if (mm.saved) {
        this.service.search().subscribe(res => {
          this.state.setSearchResults(res);
          //this.docs = this.state.
        });
      }
    });
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

  formatStav(ex: Exemplar): string {
    if(ex.stav){
    let ret = '';
      for (let i = 0; i < ex['stav'].length; i++) {
        ret += this.translate.instant('record.StavIssue.' + ex['stav'][i]) + '\n';
      };
      if (ex['stav_popis']) {
        ret += ' ' + ex['stav_popis'];
      }
    return ret;
    } else {
      return 'nekonrolováno '
    }
  }
}
