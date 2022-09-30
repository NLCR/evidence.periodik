import { Component, OnInit } from '@angular/core';
import { ViewChild } from '@angular/core';
import { AppState } from '../../app.state';
import { first } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/shared/authentication.service';
import { Router } from '@angular/router';
import { Md5 } from 'ts-md5';
import { AppConfiguration } from 'src/app/app-configuration';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  @ViewChild('loginuser', { static: true }) loginuser: any;
  error = false;
  loginHttpError = false;
  loading = false;

  username: string = '';
  pwd: string = '';

  constructor(
    public state: AppState,
    private router: Router,
    private auth: AuthenticationService,
    public config: AppConfiguration) { }

  ngOnInit() {
    setTimeout(() => {
      this.loginuser.nativeElement.focus();
    }, 100);
  }

  focusu() {
    setTimeout(() => {
      this.loginuser.nativeElement.focus();
    }, 100);
  }

  focusp(e, el) {
    el.focus();
  }

  login() {
    // this.service.login();
    this.loading = true;
    const pwd = '' + Md5.hashStr(this.pwd);
    this.auth.login(this.username, pwd)
      .pipe(first())
      .subscribe(
        data => {
          if (data.error) {
            this.error = data.error;
          } else {
            if (this.state.redirectUrl) {

              this.state.logginChanged = true;
              this.router.navigate([this.state.redirectUrl]);
            }
          }
          this.loading = false;
        },
        error => {
          console.log(error);
          this.error = error;
          this.loading = false;
        });
  }
}
