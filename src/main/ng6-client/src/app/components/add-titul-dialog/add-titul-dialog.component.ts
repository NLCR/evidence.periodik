import {Component, OnInit, Inject} from '@angular/core';
import {AppState} from '../../app.state';
import {AppService} from '../../app.service';
import {Titul} from '../../models/titul';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-add-titul-dialog',
  templateUrl: './add-titul-dialog.component.html',
  styleUrls: ['./add-titul-dialog.component.scss']
})
export class AddTitulDialogComponent {

  titul: Titul = new Titul();

  constructor(public dialogRef: MatDialogRef<AddTitulDialogComponent>,
              public state: AppState,
              private service: AppService) {
  }

  ok() {
    this.service.saveTitul(this.titul).subscribe(res => {

      if (res.error) {
        this.service.showSnackBar('snackbar.title_error_saving', res.error, true);
        // this.toastService.show(res['error'], 4000, 'red');
      } else {
        this.service.getTituly().subscribe();
        this.dialogRef.close();
      }
    });
  }

  cancel() {
    this.dialogRef.close();
  }

}
