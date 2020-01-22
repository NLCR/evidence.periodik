
export class Exemplar {
  // stav	kód	kódovaný údaj, významy: ok, poškozeno - čitelné, poškozeno - ztráta informace, chybí celé stránky, není vůbec (zničeno/ztráta)
  stav: string[] = [];
  stav_popis = ''; // stav - popis	text	podrobný popis poškození
  vlastnik = ''; // vlastnictví	text	sigla nebo název instituce (která nemá siglu)
  carovy_kod = ''; // čárový kód	text	čárák svazku, ve kterém je číslo
  signatura = ''; // signatura	text	signatura svazku ve kterém je číslo
  pages: { missing: string[], damaged: string[] } = { missing: [], damaged: [] }; // seznam chybejcich a poskozenych stranek

  // cely rozsah. Neindexovat
  pagesRange: { missing: { label: string, sel: boolean }[], damaged: { label: string, sel: boolean }[] } = { missing: [], damaged: [] };
  // github #46 k exempláři přidat pole "označení regionálního vydání" -
  // vkládání symbolů - př hvězdička, puntík - zobrazení v přehledové tabulce
  oznaceni: string;
  popis_oznaceni_vydani: string; // github #46
}
