import { Component, OnInit, ViewChild } from '@angular/core';

import { AppState } from '../../app.state';
import { AppService } from '../../app.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { AppConfiguration } from 'src/app/app-configuration';
import { AuthenticationService } from 'src/app/shared/authentication.service';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  currLang: string;
  @ViewChild('sidenav', { static: true }) sidenav: MatSidenav;

  reason = '';

  close(reason: string) {
    this.reason = reason;
    this.sidenav.close();
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authservice: AuthenticationService,
    public state: AppState,
    private service: AppService,
    public config: AppConfiguration) {
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
    this.service.logout().subscribe();
    this.service.logoutShibboleth().subscribe();
    if (this.router.url === '/home') {
      location.reload();
    } else{
      this.state.loginChanged = true;
      return this.router.navigate(['home']);
    }
  }

  gologin() {
    this.state.redirectUrl = this.router.url;

    return this.router.navigate(['login']);
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
    /* if (this.state.activePage.indexOf('/home') > -1) {
      return 'home';
    } */
    if (this.state.activePage.indexOf('/admin/users') > -1) {
      return 'admin.users';
    }
    if (this.state.activePage.indexOf('/admin/owners') > -1) {
      return 'admin.owners';
    }
    if (this.state.activePage.indexOf('/admin') > -1) {
      return 'admin';
    }
    if (this.state.activePage.indexOf('/profile') > -1) {
      return 'profile';
    }
    return 'home';
  }

}
