import { Component } from '@angular/core';
import {MzBaseModal} from 'ngx-materialize';

import {AppState} from '../../app.state';
import {AppService} from '../../app.service';
import {Issue} from '../../models/issue';

@Component({
  selector: 'app-add-vydani-dialog',
  templateUrl: './add-vydani-dialog.component.html',
  styleUrls: ['./add-vydani-dialog.component.scss']
})
export class AddVydaniDialogComponent  extends MzBaseModal {

  state: AppState;
  service: AppService;

  vydani: string;
  
  
  public issue: Issue;
  
  ok(){
    this.service.addVydani(this.issue, this.vydani).subscribe(res => {
      this.modalComponent.closeModal();
    });
    
  }
}
