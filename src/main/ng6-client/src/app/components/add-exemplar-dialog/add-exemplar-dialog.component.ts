import { Component, OnInit, Inject } from '@angular/core';
import { AppState } from '../../app.state';
import { AppService } from '../../app.service';
import { Issue } from '../../models/issue';
import { Exemplar } from '../../models/exemplar';
import { Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DatePipe } from '@angular/common';
import { Utils } from 'src/app/utils';
import { AppConfiguration } from 'src/app/app-configuration';

@Component({
  selector: 'app-add-exemplar-dialog',
  templateUrl: './add-exemplar-dialog.component.html',
  styleUrls: ['./add-exemplar-dialog.component.scss']
})
export class AddExemplarDialogComponent implements OnInit {


  public issue: Issue;
  // public ex: number;
  public exemplar: Exemplar;

  editType = 'new';

  duplicate_start_date: string;
  duplicate_end_date: string;
  duplicate_start_cislo: number;

  startDate: Date;
  endDate: Date;

  saved = false;
  onspecial = false;

  showPages: boolean;
  pagesRange: { label: string, sel: boolean }[] = [];


  constructor(
    public dialogRef: MatDialogRef<AddExemplarDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { issue: Issue, exemplar: Exemplar, editType: string },
    private datePipe: DatePipe,
    private router: Router,
    public state: AppState,
    private service: AppService,
    public config: AppConfiguration) {
  }

  ngOnInit() {
    this.issue = this.data.issue;
    this.exemplar = this.data.exemplar;
    this.editType = this.data.editType;
    if (this.issue) {

      this.startDate = Utils.dateFromDay(this.issue.datum_vydani_den);
      this.endDate = Utils.dateFromDay(this.issue.datum_vydani_den);

      if (!this.issue.pages || this.issue.pages.length === 0) {
        for (let i = 0; i < this.issue.pocet_stran; i++) {
          // this.pages.push({label:(i+1) + "", index: i});
          const sel = this.exemplar.pages && this.exemplar.pages.missing.includes((i + 1) + '');
          this.pagesRange.push({ label: (i + 1) + '', sel });
        }
      } else {
        for (let i = 0; i < this.issue.pages.length; i++) {
          const label = this.issue.pages[i].label;
          const sel = this.exemplar.pages && this.exemplar.pages.missing.includes((i + 1) + '');
          this.pagesRange.push({ label, sel });
        }
        for (let i = this.issue.pages.length; i < this.issue.pocet_stran; i++) {
          // let sel = this.exemplar.pages && this.exemplar.pages.missing.includes((i+1) + "");
          this.pagesRange.push({ label: (i + 1) + '', sel: true });
        }
      }

    }

    this.showPages = this.editType === 'new' || (this.exemplar.stav && !this.exemplar.stav.includes('OK'));

  }

  ok(): void {
    if (this.showPages) {
      this.exemplar.pages = { missing: [], damaged: [] };
      this.pagesRange.forEach(p => {
        if (p.sel) {
          this.exemplar.pages.missing.push(p.label);
        }
      });
    }


    if (this.exemplar.stav) {
      this.exemplar.stav = this.exemplar.stav.filter(st => st !== 'null');
    }


    switch (this.editType) {
      case 'new':
        break;
      case 'edit':

        // console.log(this.issue);
        this.service.saveIssue(this.issue).subscribe(res => {
          // console.log(res);
          if (res.error) {
            this.service.showSnackBar('error_saving_titul', res.error, true);
          } else {
            this.service.showSnackBar('tittu_saved');
            this.dialogRef.close();
          }
        });
        break;
      case 'duplicate':
        this.duplicate_start_date = this.datePipe.transform(new Date(this.startDate), 'yyyyMMdd');
        this.duplicate_end_date = this.datePipe.transform(new Date(this.endDate), 'yyyyMMdd');
        this.service.duplicateExemplar(this.issue, this.exemplar.vlastnik,
          this.issue.cislo,
          this.onspecial, this.exemplar, this.duplicate_start_date, this.duplicate_end_date).subscribe(res => {

            if (res.error) {
              this.service.showSnackBar('error_duplicating_exemplar', res.error, true);
            } else {
              this.saved = true;
              this.dialogRef.close(true);
            }
          });
        break;
    }

  }

  filterOznaceni(e: string) {
    this.exemplar.oznaceni = new Array(e.length + 1).join(this.issue.znak_oznaceni_vydani);
  }

  cancel() {
    this.dialogRef.close();
  }

  editSvazek(carovy_kod: string) {
    this.dialogRef.close();
    this.router.navigate(['/svazek', carovy_kod]);
  }
}
