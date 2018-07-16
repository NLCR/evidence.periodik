import { Component, OnInit } from '@angular/core';
import {ViewChild} from '@angular/core';
import {AppState} from '../../app.state';
import {AppService} from '../../app.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  
  @ViewChild('loginuser') loginuser: any;
  loginError: boolean = false;

  constructor(
    public state: AppState,
    public service: AppService) { }

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
}
