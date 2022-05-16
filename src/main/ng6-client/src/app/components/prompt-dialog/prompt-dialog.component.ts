import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-prompt-dialog',
  templateUrl: './prompt-dialog.component.html',
  styleUrls: ['./prompt-dialog.component.scss']
})
export class PromptDialogComponent {

  result: string;
  constructor(
    public dialogRef: MatDialogRef<PromptDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ok() {
    this.dialogRef.close(this.result);
  }

}
