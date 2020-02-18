import {Component} from '@angular/core';

import {AppState} from '../../app.state';
import {AppService} from '../../app.service';
import {Issue} from '../../models/issue';

@Component({
  selector: 'app-add-vydani-dialog',
  templateUrl: './add-vydani-dialog.component.html',
  styleUrls: ['./add-vydani-dialog.component.scss']
})
export class AddVydaniDialogComponent {

  state: AppState;
  service: AppService;

  vydani: string;

  public issue: Issue;

  constructor() {
  }

  ok() {
    this.service.addVydani(this.issue, this.vydani).subscribe(res => {

      if (res['error']) {
        //this.toastService.show(res['error'], 4000, 'red');
      } else {
        //this.modalComponent.closeModal();
      }
    });

  }
}
