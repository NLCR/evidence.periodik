import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { User } from 'src/app/models/user';
import { AppState } from '../app.state';
import { Md5 } from 'ts-md5/dist/md5';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;

    constructor(
        private http: HttpClient,
        private state: AppState) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    login(username: string, password: string) {
        return this.http.post<any>(`/api/users/login`, { username, password })
            .pipe(map(resp => {
                // console.log(resp);
                if (resp.logged) {
                // store user details and basic auth credentials in local storage to keep user logged in between page refreshes
                // password hashed
                    const md5 = new Md5();
                    const user = resp.user;
                    user.authdata = window.btoa(username + ':' + password);
                    localStorage.setItem('currentUser', JSON.stringify(user));
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
        localStorage.removeItem('currentUser');
        this.state.user = null;
        this.currentUserSubject.next(null);
    }
}
