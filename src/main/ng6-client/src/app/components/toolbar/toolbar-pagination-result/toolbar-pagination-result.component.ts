import { Component, OnInit, OnDestroy } from '@angular/core';
import {AppState} from '../../../app.state';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toolbar-pagination-result',
  templateUrl: './toolbar-pagination-result.component.html',
  styleUrls: ['./toolbar-pagination-result.component.scss']
})
export class ToolbarPaginationResultComponent implements OnInit, OnDestroy {

  subscriptions: Subscription[] = [];

  numPages: number = 5;
  totalPages: number;

  pages: number[] = [];

  constructor(
    public state: AppState
  ) { }

  ngOnInit() {
    this.subscriptions.push(this.state.searchChanged.subscribe(cfg => {
        this.setPages();
      }));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => {
      s.unsubscribe();
    });
    this.subscriptions = [];
  }

  setPages(){
    this.pages = [];
    this.totalPages = this.state.numFound / this.state.rows;
    let pagesToShow = Math.min(this.numPages, this.totalPages);
    let min: number = Math.min(Math.max(0, this.state.currentPage - Math.floor(pagesToShow / 2)), this.totalPages - pagesToShow);
    let max: number = min + pagesToShow;
    for(let i = min; i< max; i++){
      this.pages.push(i);
    }
  }

  prev(){
    let current = Math.max(0, this.state.currentPage - 1);
    this.setPages();
    this.state.gotoPage(current);
  }
  next(){
    let currentPage = Math.min(this.state.currentPage + 1, this.totalPages);
    this.setPages();
    this.state.gotoPage(currentPage);
  }
  gotoPage(p: number){
    this.state.gotoPage(p);
  }

}
