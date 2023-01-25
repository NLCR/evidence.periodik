import {Injectable} from "@angular/core";
import {CanDeactivate} from "@angular/router";
import {ComponentCanDeactivate} from "./component-can-deactivate";
// import {TranslateService} from "@ngx-translate/core";

@Injectable()
export class CanDeactivateGuard implements CanDeactivate<ComponentCanDeactivate> {

  constructor(
    // private translate: TranslateService
  ) {}


  canDeactivate(component: ComponentCanDeactivate): boolean {

    if(!component.canDeactivate()){
      if (confirm("Máte neuložené změny! Pokud stránku opustíte, vaše změny budou ztraceny.")) {
        return true
      } else {
        return false
      }
      // this.translate.get('note.save_data_before_leaving').subscribe((note: string) => {
      //   if (confirm()) {
      //     console.log("true")
      //     return true
      //   } else {
      //     console.log("false")
      //     return false
      //   }
      // })
    }
    return true
  }
}
