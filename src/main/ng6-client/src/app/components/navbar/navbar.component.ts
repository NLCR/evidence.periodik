import { Component, OnInit } from '@angular/core';

import { AppState } from '../../app.state';
import { AppService } from '../../app.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  currLang: string;
  
  constructor(
    private route: ActivatedRoute,
    public state: AppState,
    private service: AppService) { 
  }

  ngOnInit() {
    
    this.service.langSubject.subscribe((lang) => {
      this.currLang = lang;
    });
  }

  changeLang(lang: string){
    this.service.changeLang(lang);
  }
  
}
