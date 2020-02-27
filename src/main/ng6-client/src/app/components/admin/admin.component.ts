import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { AppState } from 'src/app/app.state';
import { User } from 'src/app/models/user';
import { Md5 } from 'ts-md5';
import { AppConfiguration } from 'src/app/app-configuration';
import { PromptDialogComponent } from '../prompt-dialog/prompt-dialog.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  loading = false;
  users: User[] = [];
  user: User;
  roles = [
    { id: 'user', name: 'user_role' },
    { id: 'admin', name: 'admin_role' }
  ];

  constructor(
    public dialog: MatDialog,
    private service: AppService,
    public state: AppState,
    public config: AppConfiguration) {
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.service.getUsers().subscribe(resp => {
      this.users = resp;
      if (!this.user) {
        this.loadUser(this.users[0]);
      }
    });
  }

  loadUser(u: User) {
    this.user = u;
  }

  save() {
    this.loading = true;
    this.service.saveUser(this.user).subscribe(res => {
      this.loading = false;
      if (res.error) {
        this.service.showSnackBar('snackbar.user_error_saving', res.error, true);
      } else {
        this.service.showSnackBar('snackbar.user_correctly_saved');
        this.load();
      }
    });
  }

  newUser() {

    const dialogRef = this.dialog.open(PromptDialogComponent, {
      width: '350px',
      data: { title: 'desc.username' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const user = new User();
        user.username = result;
        user.nazev = result;
        user.heslo = '' + Md5.hashStr('test');
        user.role = 'user';
        this.users.push(user);
        this.loadUser(user);
      }
    });


  }

  cancel() {

  }

}
