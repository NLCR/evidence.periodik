import { Component, OnInit } from '@angular/core';
import { MzBaseModal, MzModalComponent } from 'ng2-materialize';
import {CloneParams} from '../../models/clone-params';
import {AppState} from '../../app.state';
import {AppService} from '../../app.service';

@Component({
  selector: 'app-clone-dialog',
  templateUrl: './clone-dialog.component.html',
  styleUrls: ['./clone-dialog.component.scss']
})
export class CloneDialogComponent extends MzBaseModal {

    public options: Pickadate.DateOptions = {
        format: 'dd/mm/yyyy',
        formatSubmit: 'yyyy-mm-dd',
    };
//Input properties
    periods: string[] = [];
    state: AppState;
    service: AppService;
    
    //Clone parameters
    params: CloneParams = new CloneParams();
//    cloneOd: string;
//    cloneDo: string;
//    clonePeriodicity: string;
    
    
//    ngOnInit(){
//        this.periods = Object.keys(this.state.cfg.periodicity)
//    }
    ok(){
      this.service.clone(this.params).subscribe(res => {
        console.log(res);
        this.modalComponent.close();
      });
    }
    
    cancel(){
      console.log('cancel');
    }
}
