import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {Input} from '@angular/core';
import {Issue} from '../../models/issue';
import {AppState} from '../../app.state';

@Component({
  selector: 'app-results-table',
  templateUrl: './results-table.component.html',
  styleUrls: ['./results-table.component.scss']
})
export class ResultsTableComponent implements OnInit {
  
  data: Issue[] = [];
  cks: string[];
  
  displayedColumns = ['nazev', 'mutace', 'vydani', 'datum_vydani'];
  dataSource: MatTableDataSource<Issue>;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(public state: AppState) {
    

    // Assign the data to the data source for the table to render
  }

  ngOnInit() {
    if(this.data){
      this.setData();
    }
    this.state.searchChanged.subscribe(res => {
      this.setData();
    });
  }
  
  setData(){
    //Extract exemplare
    this.cks = [];
    this.data = this.state.searchResults['response']['docs'];
    this.displayedColumns = ['nazev', 'mutace', 'vydani', 'datum_vydani'];
    this.data.forEach((issue: Issue) => {
      if(issue.exemplare){
        let exs = issue.exemplare;
        for (let i = 0; i < exs.length; i++){
          if (this.cks.indexOf(exs[i].carovy_kod) < 0){
            this.cks.push(exs[i].carovy_kod);
            this.displayedColumns.push(exs[i].carovy_kod);
          }
          issue[exs[i].carovy_kod] = true;
        }
      }
    });
    console.log(this.cks);
    this.data.forEach((issue: Issue) => {
      for (let i = 0; i < this.cks.length; i++){
        if(!issue.hasOwnProperty(this.cks[i])){
          issue[this.cks[i]] = false;
        }
      }
    });
    //this.displayedColumns.push(cks);
    this.dataSource = new MatTableDataSource(this.state.searchResults['response']['docs']);
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
