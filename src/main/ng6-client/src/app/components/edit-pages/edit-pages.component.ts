import { Component, OnInit } from '@angular/core';
import {MzBaseModal, MzToastService} from 'ngx-materialize';

import {AppState} from '../../app.state';
import {AppService} from '../../app.service';
import {Issue} from '../../models/issue';

@Component({
  selector: 'app-edit-pages',
  templateUrl: './edit-pages.component.html',
  styleUrls: ['./edit-pages.component.scss']
})
export class EditPagesComponent extends MzBaseModal {
  state: AppState;
  service: AppService;

  vydani: string;

  public pages: {index: number, label: string}[] = [];
  public issue: Issue;
  public saved: boolean = false;

  constructor() {
    super();
  }

  ngOnInit() {
    if (this.issue) {
      if (this.issue.pages.length === 0){
        for(let i=0; i<this.issue.pocet_stran; i++){
          this.pages.push({label:(i+1) + "", index: i});
        }
      } else {
        this.pages = JSON.parse(JSON.stringify(this.issue.pages));
        if(this.issue.pages.length < this.issue.pocet_stran){
          for(let i=this.issue.pages.length; i<this.issue.pocet_stran; i++){
            this.pages.push({label:(i+1) + "", index: i});
          }
          
        }
      } 
    }
  }
  
  ok() {
    this.issue.pages = [];
    this.pages.forEach(p => {
      this.issue.pages.push(p);
    });
    this.saved = true;
    this.modalComponent.closeModal();
  }

}
