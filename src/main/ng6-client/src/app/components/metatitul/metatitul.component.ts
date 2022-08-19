import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppState } from 'src/app/app.state';
import { AppService } from 'src/app/app.service';
import { Titul } from 'src/app/models/titul';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppConfiguration } from 'src/app/app-configuration';
import { PromptDialogComponent } from 'src/app/components/prompt-dialog/prompt-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-metatitul',
  templateUrl: './metatitul.component.html',
  styleUrls: ['./metatitul.component.scss']
})
export class MetatitulComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];

  titul: Titul = null;
  loading: boolean;
  routerLink: string;

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
      let idx = 0;
      if (id) {
        idx = this.state.tituly.findIndex(t => t.id === id);
      }
      if (idx > -1) {
        this.loadTitul(this.state.tituly[idx]);
      }

    });
  }

  selectTitul(id: string) {
    this.titul = Object.assign({}, this.state.tituly.find(t => t.id === id));
  }

  loadTitul(t: Titul) {
    this.titul = Object.assign({}, t);
    this.routerLink = `/result/${this.titul.id}`;
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

  remove() {

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '650px',
      data: {
        caption: 'modal.delete_title.caption',
        text: 'modal.delete_title.text',
        param: {
          value: this.titul.meta_nazev
        }
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      // console.log(result);
      if (result) {
        this.loading = true;
        this.service.deleteTitul(this.titul.id).subscribe(res => {
          this.loading = false;
          if (res.error) {
            this.service.showSnackBar('snackbar.title_error_deleting', res.error, true);
          } else {
            this.service.showSnackBar('snackbar.title_deleted');
            this.load(res.resp.id);
          }
        });
      }
    });
  }

  allowNotLoggedUsers(value) {
    this.titul.show_to_not_logged_users = value;
  }


}
