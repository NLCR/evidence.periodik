import { Component, OnInit } from '@angular/core';

import { AppState } from '../../app.state';
import { AppService } from '../../app.service';
import { ActivatedRoute, RouterStateSnapshot } from '@angular/router';
import { Router } from "@angular/router";

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
    public state: AppState,
    private service: AppService) {
  }

  ngOnInit() {

    this.service.langSubject.subscribe((lang) => {
      this.currLang = lang;
    });
  }

  changeLang(lang: string) {
    this.service.changeLang(lang);
  }

  logout() {
    this.service.logout();
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
    return '';
  }

}
