import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';

import {AppState} from '../../app.state';
import {AppService} from '../../app.service';

@Component({
    selector: 'app-calendar',
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {

    subscriptions: Subscription[] = [];

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        public state: AppState,
        private service: AppService
    ) {}


    ngOnDestroy() {
        this.subscriptions.forEach((s: Subscription) => {
            s.unsubscribe();
        });
        this.subscriptions = [];
    }
    
    ngOnInit() {

//        this.subscriptions.push(this.state.stateChanged.subscribe(st => {
//            this.analyze();
//        }));

        let id = this.route.snapshot.paramMap.get('id');
        if (id) {
            setTimeout(() => {
                this.service.getTitul(id).subscribe(res => {
                  this.state.setCurrentTitul(res)
                });
            }, 10);
        }
    }

    setTitul() {
        this.router.navigate(['/id', this.state.currentTitul]);
    }

}
