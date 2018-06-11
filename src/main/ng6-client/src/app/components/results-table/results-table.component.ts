import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {Input} from '@angular/core';
import {Issue} from '../../models/issue';
import {AppState} from '../../app.state';
import {AddExemplarDialogComponent} from '../add-exemplar-dialog/add-exemplar-dialog.component';
import {MzModalService} from 'ngx-materialize';
import {AppService} from '../../app.service';

@Component({
  selector: 'app-results-table',
  templateUrl: './results-table.component.html',
  styleUrls: ['./results-table.component.scss']
})
export class ResultsTableComponent implements OnInit {

  data: Issue[] = [];
  cks: string[] = [];
  exs: any = {};
  displayedColumns = ['nazev', 'mutace', 'vydani', 'datum_vydani'];
  dataSource: MatTableDataSource<Issue>;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
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

  setData() {
    //Extract exemplare
    this.cks = [];
    this.exs = {};
    this.data = this.state.searchResults['response']['docs'];
    this.displayedColumns = ['nazev', 'mutace', 'vydani', 'datum_vydani', 'add'];
    this.data.forEach((issue: Issue) => {
      if (issue.exemplare) {
        let exs = issue.exemplare;
        for (let i = 0; i < exs.length; i++) {
          let ck = exs[i].vlastnik + ' - ' + exs[i].carovy_kod;
          if (!this.exs.hasOwnProperty(ck)) {
            this.cks.push(ck);
            this.exs[ck] = exs[i];
            this.displayedColumns.push(ck);
          }
          issue[ck] = i;
        }
      }
    });

    this.data.forEach((issue: Issue) => {
      for (let i = 0; i < this.cks.length; i++) {
        if (!issue.hasOwnProperty(this.cks[i])) {
          issue[this.cks[i]] = -1;
        }
      }
    });
    //this.displayedColumns.push(cks);
    this.dataSource = new MatTableDataSource(this.state.searchResults['response']['docs']);
    this.dataSource.paginator = this.paginator;
  }

  cellColor(row: Issue, ck: string): string {
    if (row[ck] === -1) return "";
    let vlastnik = row.exemplare[row[ck]]['vlastnik'];
    switch (vlastnik) {
      case 'MZK': {
        return '#d1eff1';
      }
      case 'NKP': {
        return 'darkred';
      }
      case 'UKF': {
        return 'darkred';
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
      {"issue": issue, "state": this.state, "service": this.service, "ex": -1}
    );

  }

  viewClick(issue: Issue, ck) {
    //console.log(this.exs[ck]);
    if (issue[ck] === -1) {
      issue.exemplare.push(this.exs[ck]);
      issue[ck] = issue.exemplare.length - 1;
    } else {
      this.modalService.open(AddExemplarDialogComponent,
        {"issue": issue, "state": this.state, "service": this.service, "ex": issue[ck]}
      );
    }

  }
}
