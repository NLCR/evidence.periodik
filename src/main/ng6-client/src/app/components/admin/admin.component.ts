import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { AppState } from 'src/app/app.state';
import { User } from 'src/app/models/user';
import { Md5 } from 'ts-md5';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  loading = false;
  users: User[] = [];
  user: User = new User();

  constructor(
    private service: AppService,
    public state: AppState) {
  }

  ngOnInit() {
      this.load();
  }

  load() {
    this.service.getUsers().subscribe(resp => {
      this.users = resp;
      this.loadUser(this.users[0]);      
    });
  }

  loadUser(u: User) {
    this.user = u;
  }

  save() {
    this.loading = true;
    this.service.saveUser(this.user).subscribe(res => {
      console.log(res);
      this.loading = false;
      if (res['error']) {
        //this.toastService.show(res['error'], 4000, 'red');
      } else {
        //this.toastService.show('Uživatel správně uložen', 4000, 'green');
        this.load();
      }
    });
  }

  newUser() {
    const user = new User();
    user.nazev = 'new user';
    user.heslo = '' + Md5.hashStr('test');
    this.users.push(user);
    this.loadUser(user);
  }

  cancel() {

  }

}
