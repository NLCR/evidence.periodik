import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {Input} from '@angular/core';
import {Issue} from '../../models/issue';
import {AppState} from '../../app.state';
import {AddExemplarDialogComponent} from '../add-exemplar-dialog/add-exemplar-dialog.component';
import {MzModalService} from 'ngx-materialize';
import {AppService} from '../../app.service';
import {Titul} from '../../models/titul';
import {Router} from '@angular/router';
import {Exemplar} from '../../models/exemplar';

@Component({
  selector: 'app-results-table',
  templateUrl: './results-table.component.html',
  styleUrls: ['./results-table.component.scss']
})
export class ResultsTableComponent implements OnInit {

  data: Issue[] = [];
  cks: string[] = [];
  exs: any = {};
  displayedColumns = ['meta_nazev', 'mutace', 'vydani', 'datum_vydani'];
  header: string = '';
  dataSource: MatTableDataSource<Issue>;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private router: Router,
    public state: AppState,
    public service: AppService,
    private modalService: MzModalService) {


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
    //Extract exemplare
    this.cks = [];
    this.exs = {};
    this.displayedColumns = [];
    this.header = '';
    this.data = this.state.searchResults['response']['docs'];
    if (this.data.length === 0) {
      return;
    }

    this.addColumn('meta_nazev');
    this.addColumn('mutace');
    this.addColumn('vydani');


    this.displayedColumns.push('datum_vydani', 'cislo', 'pocet_stran', 'add');
    this.data.forEach((issue: Issue) => {
      if (issue.exemplare) {
        let exs = issue.exemplare;
        for (let i = 0; i < exs.length; i++) {
          //let ck = exs[i].vlastnik + ' - ' + exs[i].signatura;
          let vlastnik = exs[i].vlastnik;
          if (!this.exs.hasOwnProperty(vlastnik)) {
            this.cks.push(vlastnik);
            this.exs[vlastnik] = exs[i];
            this.displayedColumns.push(vlastnik);
          } else {

          }
          //issue[ck] = i;
        }
      }
    });

//    this.data.forEach((issue: Issue) => {
//      for (let i = 0; i < this.cks.length; i++) {
//        if (!issue.hasOwnProperty(this.cks[i])) {
//          issue[this.cks[i]] = -1;
//        }
//      }
//    });
    
    this.dataSource = new MatTableDataSource(this.data);
    this.dataSource.paginator = this.paginator;
  }

  cellColor(row: Issue, vlastnik: string): string {
    if(row.hasOwnProperty('exemplare')){
      for(let i = 0; i<row.exemplare.length; i++){
        if(row.exemplare[i]['vlastnik'] === vlastnik){
          return this.colorByVlastnik(vlastnik);
        }
      }
    }
    return '';
  }

  colorByVlastnik(vlastnik: string): string {

    switch (vlastnik) {
      case 'MZK': {
        return '#d1eff1';
      }
      case 'NKP': {
        return 'rgb(197, 98, 98)';
      }
      case 'UKF': {
        return 'rgb(197, 98, 98)';
      }
      case 'VKOL': {
        return '#3586c4';
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
      {"issue": issue, "state": this.state, "service": this.service, editType: 'new'}
    );

  }

  viewClick(issue: Issue, ex: Exemplar) {
    this.modalService.open(AddExemplarDialogComponent,
      {"issue": issue, "state": this.state, "service": this.service, "exemplar": ex, editType: 'edit'}
    );
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
}
