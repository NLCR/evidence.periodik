import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { AppState } from 'src/app/app.state';
import { Md5 } from 'ts-md5';
import { AppService } from 'src/app/app.service';
import { MatDialog } from '@angular/material';
import { PasswordDialogComponent } from 'src/app/components/password-dialog/password-dialog.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  user: User;

  constructor(
    public dialog: MatDialog,
    public state: AppState,
    private service: AppService
  ) { }

  ngOnInit() {
    this.user = this.state.user;
  }

  save() {

    this.service.saveUser(this.user).subscribe(resp => {
      if (resp.error) {
        //this.toastService.show(resp['error'], 4000, 'red');
      } else {
        //this.toastService.show('Uživatel správně uložen', 4000, 'green');
      }
    });

  }

  

  resetHeslo() {
    const dialogRef = this.dialog.open(PasswordDialogComponent, {
      width: '350px'
    });
  }

}
