
export class Exemplar {
  stav: string[] = []; //stav	kód	kódovaný údaj, významy: ok, poškozeno - čitelné, poškozeno - ztráta informace, chybí celé stránky, není vůbec (zničeno/ztráta)
  stav_popis: string = ""; //stav - popis	text	podrobný popis poškození
  vlastnik: string = ""; //vlastnictví	text	sigla nebo název instituce (která nemá siglu)
  carovy_kod: string = ""; //čárový kód	text	čárák svazku, ve kterém je číslo
  signatura: string = ""; //signatura	text	signatura svazku ve kterém je číslo
  pages: string[] = []; //seznam problematickych stranek 
  
  pagesRange: {label:string, sel:boolean}[] = []; //cely rozsah. Neindexovat
  oznaceni: string; //github #46 k exempláři přidat pole "označení regionálního vydání" - vkládání symbolů - př hvězdička, puntík - zobrazení v přehledové tabulce 
  popis_oznaceni_vydani: string //github #46
}