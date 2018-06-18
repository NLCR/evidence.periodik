import { Component, OnInit, Inject} from '@angular/core';
import { MzBaseModal,  } from 'ngx-materialize';
import {AppState} from '../../app.state';
import {AppService} from '../../app.service';
import {Issue} from '../../models/issue';
import {Exemplar} from '../../models/exemplar';

@Component({
  selector: 'app-add-exemplar-dialog',
  templateUrl: './add-exemplar-dialog.component.html',
  styleUrls: ['./add-exemplar-dialog.component.scss']
})
export class AddExemplarDialogComponent extends MzBaseModal {

    state: AppState;
    service: AppService;

  public issue: Issue;
  //public ex: number;
  public exemplar: Exemplar;
  
  isNew: boolean;
  
  
  ngOnInit() {
//    console.log(this.ex);
//    if(this.ex === -1){
//      this.exemplar = new Exemplar();
//    } else {
//      this.exemplar = this.issue.exemplare[this.ex];
//    }
    
  }

  ok(): void {

      this.service.saveIssue(this.issue).subscribe(res => {
        console.log(res);
        this.modalComponent.closeModal();
      });
  }
  
  cancel(){
    
  }
}
