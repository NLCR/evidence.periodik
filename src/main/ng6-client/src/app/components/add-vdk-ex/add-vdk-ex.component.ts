import {Component, OnInit} from '@angular/core';
import {MzBaseModal} from 'ngx-materialize';
import {MatSort, MatTableDataSource} from '@angular/material';
import {NgProgress, NgProgressComponent} from '@ngx-progressbar/core';

import {AppState} from '../../app.state';
import {AppService} from '../../app.service';
import {Issue} from '../../models/issue';
import {ViewChild} from '@angular/core';

@Component({
  selector: 'app-add-vdk-ex',
  templateUrl: './add-vdk-ex.component.html',
  styleUrls: ['./add-vdk-ex.component.scss']
})
export class AddVdkExComponent extends MzBaseModal {

  @ViewChild(NgProgressComponent) progressBar: NgProgressComponent;
  
  state: AppState;
  service: AppService;

  public issue: Issue;

  public url: string = 'https://aleph.vkol.cz/OAI?verb=GetRecord&identifier=oai:aleph.vkol.cz:SVK01_VKOLOAI-000315244&metadataPrefix=marc21';
  public format: string = 'MESIC_SLOVA';
  public vlastnik: string = 'VKOL';
  
//  public url: string = 'http://vdk.nkp.cz/vdk/original?id=oai:aleph.mzk.cz:MZK01-000244261&wt=xml';
//  public format: string = 'CISLO';
//  public vlastnik: string = 'MZK';
  
  public barcode: string;
  public onspecial: boolean = false;

  public prepared: boolean = false;
  public exs: any[] = [];
  public exsFiltered: any[] = [];
  
  public year_filter: string = '';
  public selection: boolean = false;
  
  displayedColumns = ['id', 'year', 'volume', 'start', 'od', 'do', 'add'];
  dataSource: MatTableDataSource<Issue> = new MatTableDataSource(this.exsFiltered);
  
  

  prepare() {
    if (this.progressBar) {
      this.progressBar.start();
    }
    let ops = {
      format: this.format,
      vlastnik: this.vlastnik,
      periodicity: this.state.currentIssue.periodicita,
      barcode: this.barcode,
      onspecial: this.onspecial
    };
    this.service.prepareVdkEx(this.state.currentIssue, this.url, ops).subscribe(res => {
      //console.log(res);
      this.exs = res['exs'];
      this.exs.sort((ex1, ex2) => {
        return parseInt(ex1['add']['year']) - parseInt(ex2['add']['year']);
      });
      this.filter();
      this.prepared = true;
      if (this.progressBar) {
        this.progressBar.complete();
      }
    });

  }
  
  toggleSelection(){
//    this.selection = !this.selection;
    this.exsFiltered.forEach(ex => {ex['selected'] = this.selection;});
  }
  
  checkSelection(){
    let all = this.exsFiltered.filter(ex => {
      return ex['selected'];
    }).length === this.exsFiltered.length;
    
      let none = this.exsFiltered.filter(ex => {
      return ex['selected'];
    }).length === 0;
    
    if(all){
      this.selection = true;
    } else if(none){
      this.selection = false;
    } else {
      this.selection = null;
    }
  }

  filter() {
    if (this.year_filter === '') {
      this.exsFiltered = this.exs;
    } else {
      this.exsFiltered = this.exs.filter(ex => {
        return ex['add']['year'] === this.year_filter;
      });
    }
    
    this.dataSource = new MatTableDataSource(this.exsFiltered);
  }

  ok() {
    let ops = {
      format: this.format,
      vlastnik: this.vlastnik,
      periodicity: this.state.currentIssue.periodicita,
      barcode: this.barcode,
      onspecial: this.onspecial
    };

    this.exsFiltered.filter(ex => {
      return ex['selected'];
    }).forEach(ex => {
      this.service.duplicateExemplar(this.state.currentIssue, this.vlastnik,
        ex['add']['start_cislo'],
        this.onspecial,
        ex['permonik'],
        ex['add']['start_date'],
        ex['add']['end_date']).subscribe(res => {
          console.log(res);
        });
    });

    //    this.service.addVdkEx(this.state.currentIssue, this.url, ops).subscribe(res => {
    //      console.log(res);
    //      this.service.search().subscribe(res => {
    //        this.state.setSearchResults(res);
    //      });
    //      //this.modalComponent.closeModal();
    //    });
  }

  stringify(ex: any): string {
    return JSON.stringify(ex);
  }
  
  hasError(ex: any): boolean{
    return ex['add']['start_cislo'] === '-1' ||
           !ex['add'].hasOwnProperty('start_date') ||
           !ex['add'].hasOwnProperty('end_date') ;
  }
}
