import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationService } from './authentication.service';
import { AppConfiguration } from '../app-configuration';


@Injectable()
export class BasicAuthInterceptor implements HttpInterceptor {
    constructor(
        private authenticationService: AuthenticationService,
        private config: AppConfiguration) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // add authorization header with basic auth credentials if available
        const currentUser = this.authenticationService.currentUserValue;
        if (currentUser && currentUser.authdata) {
            request = request.clone({
                setHeaders: { 
                    Authorization: `Basic ${currentUser.authdata}`
                }
            });
        }

        if (request.url.startsWith('/api')) {
            request = request.clone({ url: `${this.config.context}${request.url}` });
        }
        return next.handle(request);
    }
}
