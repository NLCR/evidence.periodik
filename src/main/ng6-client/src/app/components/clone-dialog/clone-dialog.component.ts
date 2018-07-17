import {Component, OnInit} from '@angular/core';
import {MzBaseModal, MzToastService} from 'ngx-materialize';
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
  state: AppState;
  service: AppService;

  //Clone parameters
  params: CloneParams = new CloneParams();

  constructor(
    private toastService: MzToastService) {
    super();
  }

  ok() {
    this.service.clone(this.params).subscribe(res => {
      console.log(res);

      if (res['error']) {
        this.toastService.show(res['error'], 4000, 'red');
      } else {
        this.modalComponent.closeModal();
      }
    });
  }

  cancel() {
    
  }
}
