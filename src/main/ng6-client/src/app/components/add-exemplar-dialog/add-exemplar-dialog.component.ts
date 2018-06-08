import { Component, OnInit, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-add-exemplar-dialog',
  templateUrl: './add-exemplar-dialog.component.html',
  styleUrls: ['./add-exemplar-dialog.component.scss']
})
export class AddExemplarDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<AddExemplarDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
    ) { }

  ngOnInit() {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
