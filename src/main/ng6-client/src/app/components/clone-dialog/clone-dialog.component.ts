import { Component, OnInit, Inject } from '@angular/core';
import { CloneParams } from '../../models/clone-params';
import { AppState } from '../../app.state';
import { AppService } from '../../app.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDatepickerInputEvent } from '@angular/material';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-clone-dialog',
  templateUrl: './clone-dialog.component.html',
  styleUrls: ['./clone-dialog.component.scss']
})
export class CloneDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { params: CloneParams },
    private datePipe: DatePipe,
    public state: AppState,
    private service: AppService) {
  }

  ok() {
    this.service.clone(this.data.params).subscribe(res => {
      console.log(res);

      if (res.error) {
        this.service.showSnackBar('snackbar.error_cloning', res.error, true);
      } else {
        this.dialogRef.close();
      }
    });
  }

  cancel() {
    this.dialogRef.close();
  }

  setDate(element: string, event: MatDatepickerInputEvent<Date>) {
    this.data.params[element] = this.datePipe.transform(event.value, 'yyyy-MM-dd');
  }
}
