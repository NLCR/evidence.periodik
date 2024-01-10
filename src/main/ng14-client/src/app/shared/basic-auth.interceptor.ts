import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationService } from './authentication.service';
import { AppConfiguration } from '../app-configuration';
import { AppService } from '../app.service';


@Injectable()
export class BasicAuthInterceptor implements HttpInterceptor {
    constructor(
        private authenticationService: AuthenticationService,
        private service: AppService,
        private config: AppConfiguration) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // add authorization header with basic auth credentials if available
        const currentUser = this.authenticationService.currentUserValue;
        if (this.config.configured && currentUser && currentUser.authdata) {
            // Check expired. Configuration in minutes
            const expiredTime = this.config.expiredTime * 1000 * 60;

            if ((new Date().getTime() - currentUser.date.getTime()) > expiredTime) {
                this.service.showSnackBar('Session expired', '', true);
                this.authenticationService.logout();
            } else {
                // this.authenticationService.renewDate();
                // request = request.clone({
                //     setHeaders: {
                //         Authorization: `Basic ${currentUser.authdata}`
                //     }
                // });
            }
        }

        if (request.url.startsWith('/api')) {
            request = request.clone({ url: `${this.config.context}${request.url}` });
        }
        return next.handle(request);
    }
}
