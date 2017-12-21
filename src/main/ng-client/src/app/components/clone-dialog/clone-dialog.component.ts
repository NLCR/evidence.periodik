import { Component, OnInit } from '@angular/core';
import { MzBaseModal, MzModalComponent } from 'ng2-materialize';

@Component({
  selector: 'app-clone-dialog',
  templateUrl: './clone-dialog.component.html',
  styleUrls: ['./clone-dialog.component.scss']
})
export class CloneDialogComponent extends MzBaseModal {

    periods: string[] = [];
    state: any;
    
    
//    ngOnInit(){
//        this.periods = Object.keys(this.state.cfg.periodicity)
//    }
}
