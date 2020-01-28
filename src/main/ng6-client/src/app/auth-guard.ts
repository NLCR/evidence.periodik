import { Injectable } from '@angular/core';
import {
  CanActivate, Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';

import { AppState } from './app.state';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private state: AppState, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let url: string = state.url;

    return this.checkLogin(url, route);
  }

  checkLogin(url: string, route: ActivatedRouteSnapshot): boolean {
      console.log(this.state.user, this.state.activePage, url);
    if (this.state.logged) {
      if (url.indexOf('/admin') > -1) {
        return this.state.user.role === 'admin';
      } else {
        return true;
      }

    }

    // Store the attempted URL for redirecting
    this.state.redirectUrl = url;

    // Navigate to the login page with extras
    this.router.navigate(['/login']);
    return false;
  }
}