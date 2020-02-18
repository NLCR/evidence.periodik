import { Component } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {

  caption: string;
  text: string;
  param: string;
  
  public confirmed:boolean;

  ngOnInit() {
  }
  
  ok(){
    this.confirmed = true;
    //this.modalComponent.closeModal();
  }
  
  cancel(){
    this.confirmed = false;
    //this.modalComponent.closeModal();
  }

}
