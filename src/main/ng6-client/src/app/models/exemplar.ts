import { StavIssue } from './stav-issue.enum';

export class Exemplar {
  stav: StavIssue = StavIssue.OK; //stav	kód	kódovaný údaj, významy: ok, poškozeno - čitelné, poškozeno - ztráta informace, chybí celé stránky, není vůbec (zničeno/ztráta)
  stav_popis: string = ""; //stav - popis	text	podrobný popis poškození
  vlastnik: string = ""; //vlastnictví	text	sigla nebo název instituce (která nemá siglu)
  carovy_kod: string = ""; //čárový kód	text	čárák svazku, ve kterém je číslo
  signatura: string = ""; //signatura	text	signatura svazku ve kterém je číslo
}