import { Component, OnInit } from '@angular/core';
import { MzToastService } from 'ngx-materialize';
import { AppService } from 'src/app/app.service';
import { AppState } from 'src/app/app.state';
import { User } from 'src/app/models/user';

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
    private toastService: MzToastService,
    private service: AppService,
    public state: AppState) {
  }

  ngOnInit() {
      this.load();
  }

  load() {
    this.service.getUsers().subscribe(resp => {
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
        this.toastService.show(res['error'], 4000, 'red');
      } else {
        this.toastService.show('Uživatel správně uložen', 4000, 'green');
        this.service.getTituly().subscribe();
      }
    });
  }

  newuser() {
    this.user = new User();
  }

  cancel() {

  }

}
