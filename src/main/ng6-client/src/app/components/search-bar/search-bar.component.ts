import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AppState} from '../../app.state';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit {

  constructor(
    private router: Router,
    public state: AppState) {}

  ngOnInit() {
  }

  search() {
    if(this.router.routerState.snapshot.url.indexOf('/result') > -1){
      this.state.fireSearch();
    }else{
      this.router.navigate(['/result']);
    }
  }
}
