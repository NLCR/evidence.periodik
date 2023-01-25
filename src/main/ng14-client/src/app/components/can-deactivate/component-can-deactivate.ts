import {Component, HostListener} from "@angular/core";

@Component({
  template: ''
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export abstract class ComponentCanDeactivate {

  abstract  canDeactivate(): boolean;



  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (!this.canDeactivate()) {
      $event.preventDefault()
    }
  }
}
