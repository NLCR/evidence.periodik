import { Component, OnInit } from '@angular/core';
import {ViewChild} from '@angular/core';
import {AppState} from '../../app.state';
import {AppService} from '../../app.service';
import { AuthenticationService } from 'src/app/shared/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  
  @ViewChild('loginuser') loginuser: any;
  loginError: boolean = false;

  username: string;
  pwd: string;

  constructor(
    public state: AppState,
    public service: AppService,
    private auth: AuthenticationService) { }

  ngOnInit() {
  }

  focusu(){
    setTimeout(() => {
        this.loginuser.nativeElement.focus();
      }, 100);
  }

  focusp(e, el){
      el.focus();
  }

  login() {
    // this.service.login();
    this.auth.login(this.username, this.pwd).subscribe();
  }
}
