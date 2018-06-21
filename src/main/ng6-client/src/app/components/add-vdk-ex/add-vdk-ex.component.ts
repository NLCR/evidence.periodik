import {Component, OnInit} from '@angular/core';
import {MzBaseModal} from 'ngx-materialize';

import {AppState} from '../../app.state';
import {AppService} from '../../app.service';
import {Issue} from '../../models/issue';

@Component({
  selector: 'app-add-vdk-ex',
  templateUrl: './add-vdk-ex.component.html',
  styleUrls: ['./add-vdk-ex.component.scss']
})
export class AddVdkExComponent extends MzBaseModal {

  state: AppState;
  service: AppService;

  public issue: Issue;
  
  public url: string;
  public format: string;
  public vlastnik: string;
  
  ok(){
    this.service.addVdkEx(this.state.currentIssue, this.url, {format: this.format, vlastnik: this.vlastnik}).subscribe(res => {
          //console.log(res);
          this.service.search().subscribe(res => {
            this.state.setSearchResults(res);
          });
          //this.modalComponent.closeModal();
        });
  }

}
