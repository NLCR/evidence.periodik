import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { User } from 'src/app/models/user';
import { AppState } from '../app.state';
import { AppConfiguration } from '../app-configuration';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;

    constructor(
        private http: HttpClient,
        private state: AppState,
        private config: AppConfiguration) {
        const user: User = JSON.parse(sessionStorage.getItem('currentUser'));
        if (user) {
            if (!user.date) {
                user.date = new Date();
              sessionStorage.setItem('currentUser', JSON.stringify(user));
            } else {
                user.date = new Date(user.date);
            }
        }
        this.currentUserSubject = new BehaviorSubject<User>(user);
        this.currentUser = this.currentUserSubject.asObservable();
    }

    doInitialLogin(){
      return this.http.get<User>(`/api/v2/user/current`)
        .pipe(map(resp => {
          if (resp) {
            const user = resp;
            user.authdata = window.btoa(user.username);
            user.date = new Date();
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject = new BehaviorSubject<User>(user);
            this.currentUser = this.currentUserSubject.asObservable();
            this.currentUserSubject.next(user);
            this.state.logged = true;
            this.state.user = user;

            return user;
          } else {
            this.state.logged = false;
            return resp;
          }
        }));
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    renewDate() {
        const user: User = this.currentUserSubject.value;
        user.date = new Date();
      sessionStorage.setItem('currentUser', JSON.stringify(user));
    }

    login(username: string, password: string) {
        return this.http.post<any>(`/api/users/login`, { username, password })
            .pipe(map(resp => {
                // console.log(resp);
                if (resp.logged) {
                    // store user details and basic auth credentials in local storage to keep user logged in between page refreshes
                    // password hashed
                    const user = resp.user;
                    user.authdata = window.btoa(username + ':' + password);
                    user.date = new Date();
                  sessionStorage.setItem('currentUser', JSON.stringify(user));
                    this.currentUserSubject.next(user);
                    this.state.logged = true;
                    this.state.user = user;

                    return user;
                } else {
                    this.state.logged = false;
                    return resp;
                }
            }));
    }

    logout() {
        // remove user from local storage to log user out
      sessionStorage.removeItem('currentUser');
        this.state.user = null;
        this.state.logged = false;
        this.state.isAdmin = false;
        this.currentUserSubject.next(null);
    }
}
