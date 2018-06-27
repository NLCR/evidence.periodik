import {Component, OnInit} from '@angular/core';
import {MzBaseModal, } from 'ngx-materialize';
import {AppState} from '../../app.state';
import {AppService} from '../../app.service';
import {Titul} from '../../models/titul';

@Component({
  selector: 'app-add-titul-dialog',
  templateUrl: './add-titul-dialog.component.html',
  styleUrls: ['./add-titul-dialog.component.scss']
})
export class AddTitulDialogComponent extends MzBaseModal {

  state: AppState;
  service: AppService;
  titul: Titul = new Titul();
  ngOnInit() {
  }

  ok() {
    this.service.saveTitul(this.titul).subscribe(res => {
      console.log(res);
      this.service.getTituly().subscribe();
      this.modalComponent.closeModal();
    });
  }

  cancel() {

  }

}
