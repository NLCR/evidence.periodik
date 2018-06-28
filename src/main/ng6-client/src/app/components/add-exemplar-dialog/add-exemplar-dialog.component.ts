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

  
    public options: Pickadate.DateOptions = {
        format: 'dd/mm/yyyy',
        formatSubmit: 'yyyymmdd',
    };
    
    state: AppState;
    service: AppService;

  public issue: Issue;
  //public ex: number;
  public exemplar: Exemplar;
  
  editType: string = 'new';
  
  duplicate_start_date: string;
  duplicate_end_date: string;
  
  saved: boolean = false;
  
  
  ngOnInit() {
    if(this.issue){
      this.duplicate_start_date = this.issue['datum_vydani_den'];
      this.duplicate_end_date = this.issue['datum_vydani_den'];
    }
  }

  ok(): void {
    switch (this.editType){
      case 'new':
      break;
      case 'edit':
        this.service.saveIssue(this.issue).subscribe(res => {
          //console.log(res);
          this.modalComponent.closeModal();
        });
      break;
      case 'duplicate':
      console.log(this.issue, this.exemplar.vlastnik, this.exemplar, this.duplicate_start_date, this.duplicate_end_date);
      return;
        this.service.duplicateExemplar(this.issue, this.exemplar.vlastnik, this.exemplar, this.duplicate_start_date, this.duplicate_end_date).subscribe(res => {
          //console.log(res);
          this.saved = true;
          this.modalComponent.closeModal();
        });
      break;
    }
    
  }
  
  cancel(){
    
  }
}
