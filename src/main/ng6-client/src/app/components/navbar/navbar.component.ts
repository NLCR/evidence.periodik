import { Component, OnInit } from '@angular/core';

import { AppState } from '../../app.state';
import { AppService } from '../../app.service';
import { ActivatedRoute, RouterStateSnapshot } from '@angular/router';
import { Router } from "@angular/router";
import { AppConfiguration } from 'src/app/app-configuration';
import { AuthenticationService } from 'src/app/shared/authentication.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  currLang: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authservice: AuthenticationService,
    public state: AppState,
    private service: AppService,
    private config: AppConfiguration) {
  }

  ngOnInit() {
    this.service.langSubject.subscribe((lang) => {
      this.currLang = lang;
    });

    let userLang = navigator.language.split('-')[0]; // use navigator lang if available
    userLang = /(cs|en)/gi.test(userLang) ? userLang : 'cs';
    if (this.config.defaultLang) {
      userLang = this.config.defaultLang;
    }
    this.service.changeLang(userLang);
    
  }

  showSearchBar() {
    return this.activeRoute() !== 'home';
  }

  changeLang(lang: string) {
    this.service.changeLang(lang);
  }

  logout() {
    this.authservice.logout();
  }

  gologin() {
    this.state.redirectUrl = this.router.url;

    this.router.navigate(['login']);
  }

  activeRoute() {
    
    if (this.state.activePage.indexOf('/issue') > -1) {
      return 'issue';
    }
    if (this.state.activePage.indexOf('/result') > -1) {
      return 'results';
    }
    if (this.state.activePage.indexOf('/svazek') > -1) {
      return 'svazek';
    }
    if (this.state.activePage.indexOf('/titul') > -1) {
      return 'titul';
    }
    if (this.state.activePage.indexOf('/home') > -1) {
      return 'home';
    }
    if (this.state.activePage.indexOf('/admin') > -1) {
      return 'admin';
    }
    if (this.state.activePage.indexOf('/profile') > -1) {
      return 'profile';
    }
    return '';
  }

}
