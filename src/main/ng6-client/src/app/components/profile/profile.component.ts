import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { AppState } from 'src/app/app.state';
import { AppService } from 'src/app/app.service';
import { MatDialog } from '@angular/material/dialog';
import { PasswordDialogComponent } from 'src/app/components/password-dialog/password-dialog.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  user: User;
  loading: boolean;
  roles = [
    { id: 'user', name: 'user_role' },
    { id: 'admin', name: 'admin_role' }
  ];

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
        this.service.showSnackBar('snackbar.user_error_saving', resp.error, true);
      } else {
        this.service.showSnackBar('snackbar.user_correctly_saved');
      }
    });

  }

  resetHeslo() {
    const dialogRef = this.dialog.open(PasswordDialogComponent, {
      width: '350px'
    });
  }

}
