import {Component, Inject} from '@angular/core';

import {AppState} from '../../app.state';
import {AppService} from '../../app.service';
import {Issue} from '../../models/issue';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AddTitulDialogComponent } from '../add-titul-dialog/add-titul-dialog.component';

@Component({
  selector: 'app-add-vydani-dialog',
  templateUrl: './add-vydani-dialog.component.html',
  styleUrls: ['./add-vydani-dialog.component.scss']
})
export class AddVydaniDialogComponent {

  vydani: string;
  issue: Issue;

  constructor(public dialogRef: MatDialogRef<AddTitulDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: {issue: Issue},
              public state: AppState,
              private service: AppService) {
      this.issue = data.issue;
  }

  cancel() {
    this.dialogRef.close();
  }

  ok() {
    this.service.addVydani(this.issue, this.vydani).subscribe(res => {
      if (res.error) {
        this.service.showSnackBar('error_adding_vydani', res.error, true);
      } else {
        this.service.showSnackBar('vydani_added');
        this.dialogRef.close();
      }
    });

  }
}
