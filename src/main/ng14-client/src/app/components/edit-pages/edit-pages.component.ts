import { Component, Inject, OnInit } from '@angular/core';

import { AppState } from '../../app.state';
import { AppService } from '../../app.service';
import { Issue } from '../../models/issue';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AddTitulDialogComponent } from '../add-titul-dialog/add-titul-dialog.component';

@Component({
  selector: 'app-edit-pages',
  templateUrl: './edit-pages.component.html',
  styleUrls: ['./edit-pages.component.scss']
})
export class EditPagesComponent implements OnInit {

  vydani: string;

  public pages: { index: number, label: string }[] = [];
  public issue: Issue;
  public saved = false;
  constructor(public dialogRef: MatDialogRef<AddTitulDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { issue: Issue },
    public state: AppState,
    private service: AppService) {
    this.issue = data.issue;
  }

  ngOnInit() {
    if (this.issue) {
      if (this.issue.pages.length === 0) {
        for (let i = 0; i < this.issue.pocet_stran; i++) {
          this.pages.push({ label: (i + 1) + '', index: i });
        }
      } else {
        this.pages = JSON.parse(JSON.stringify(this.issue.pages));
        if (this.issue.pages.length < this.issue.pocet_stran) {
          for (let i = this.issue.pages.length; i < this.issue.pocet_stran; i++) {
            this.pages.push({ label: (i + 1) + '', index: i });
          }

        }
      }
    }
  }

  ok() {
    this.issue.pages = [];
    this.pages.forEach(p => {
      this.issue.pages.push(p);
    });
    this.saved = true;
    this.dialogRef.close(true);
  }



  cancel() {
    this.dialogRef.close(true);
  }

}
