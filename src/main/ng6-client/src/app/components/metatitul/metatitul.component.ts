import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppState } from 'src/app/app.state';
import { AppService } from 'src/app/app.service';
import { Titul } from 'src/app/models/titul';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppConfiguration } from 'src/app/app-configuration';
import { PromptDialogComponent } from '../prompt-dialog/prompt-dialog.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-metatitul',
  templateUrl: './metatitul.component.html',
  styleUrls: ['./metatitul.component.scss']
})
export class MetatitulComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];

  titul: Titul = null;
  loading: boolean;

  constructor(
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private service: AppService,
    public state: AppState,
    public config: AppConfiguration) {
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  ngOnInit() {
    this.load(this.route.snapshot.paramMap.get('id'));
  }

  load(id: string) {
    this.service.getTituly().subscribe(resp => {
      //if (!this.titul) {
        let idx = 0;
        if (id) {
          idx = this.state.tituly.findIndex(t => t.id === id);
        }
        if (idx > -1) {
          this.loadTitul(this.state.tituly[idx]);
        }
      //}

    });
  }

  selectTitul(id: string) {
    this.titul = this.state.tituly.find(t => t.id === id);
  }

  loadTitul(t: Titul) {
    this.titul = t;
  }

  save() {
    this.loading = true;
    this.service.saveTitul(this.titul).subscribe(res => {
      console.log(res);
      this.loading = false;
      if (res.error) {
        this.service.showSnackBar('snackbar.title_error_saving', res.error, true);
      } else {
        this.service.showSnackBar('snackbar.title_saved');
        this.load(res.resp.id);
      }
    });
  }

  titulExists(name: string): boolean {
    return this.state.tituly.find(t => t.meta_nazev === name) != null;
  }

  newTitul() {
    const dialogRef = this.dialog.open(PromptDialogComponent, {
      width: '350px',
      data: { title: 'record.meta_title' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (this.titulExists(result)) {
          this.service.showSnackBar('snackbar.title_error_adding', 'Název existuje', true);
        } else {
          this.titul = new Titul();
          this.titul.meta_nazev = result;
          this.state.tituly.push(this.titul);
        }
      }
    });
  }

  cancel() {

  }


}
