import { Component } from '@angular/core';
import {MzBaseModal} from 'ngx-materialize';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent  extends MzBaseModal {

  caption: string;
  text: string;
  param: string;
  
  public confirmed:boolean;

  ngOnInit() {
  }
  
  ok(){
    this.confirmed = true;
    this.modalComponent.closeModal();
  }
  
  cancel(){
    this.confirmed = false;
    this.modalComponent.closeModal();
    
  }

}
