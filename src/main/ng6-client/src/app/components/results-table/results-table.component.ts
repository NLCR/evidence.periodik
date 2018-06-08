import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatSort, MatTableDataSource, MatDialog} from '@angular/material';
import {Input} from '@angular/core';
import {Issue} from '../../models/issue';
import {AppState} from '../../app.state';
import {AddExemplarDialogComponent} from '../add-exemplar-dialog/add-exemplar-dialog.component';

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

  constructor(
    public dialog: MatDialog,
    public state: AppState) {
    

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
    this.displayedColumns = ['nazev', 'mutace', 'vydani', 'datum_vydani', 'add'];
    this.data.forEach((issue: Issue) => {
      if(issue.exemplare){
        let exs = issue.exemplare;
        for (let i = 0; i < exs.length; i++){
          let ck = exs[i].vlastnik + ' - ' + exs[i].carovy_kod;
          if (this.cks.indexOf(ck) < 0){
            this.cks.push(ck);
            this.displayedColumns.push(ck);
          }
          issue[ck] = exs[i].vlastnik;
        }
      }
    });
    
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
  
  cellColor(row, ck: string): string{
    if(!row[ck]) return "";
    
      if(row[ck]==='MZK'){
        return 'green';
      } 
      if(row[ck]==='NKP'){
        return 'darkgreen';
      } 
      if(row[ck]==='VKOL'){
        return 'darkred';
      } 
      return 'yellow';
    
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  
  addClick(row){
    let dialogRef = this.dialog.open(AddExemplarDialogComponent, {
      width: '250px',
      data: { row: row }
    });
    
  }
}
