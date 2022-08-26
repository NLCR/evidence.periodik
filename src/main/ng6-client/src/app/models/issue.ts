import { Titul } from './titul';
import {Exemplar} from './exemplar';


export class Issue {
  id: string = "";
  id_titul: string = "";
  meta_nazev: string = ""; //název na titulu
  titul: Titul = new Titul();
  nazev: string = ""; //název na titulní straně	text	Název tak jak je na konkrétním čísle novin
  podnazev: string = ""; //podnázev na titulní straně	text	Podnázev tak jak je na konkrétním čísle novin.
  vydani: string = ""; //vydání	text	název vydání tak jak je uveden na titulní straně
  mutace: string = ""; //mutace	text	název mutace
  datum_vydani: Date; //datum vydání	datum
  datum_vydani_den: string = ""; //datum vydání ve formatu yyyyMMdd
  periodicita: string = "";
  cas_vydani: number = 0; //čas vydání	čas	generuje se (hlavně důležité v případě více vydání téže mutace v jednom dni) na základě názvu vydání. Bude existovat tabulka, která každému názvu vydání přiřadí čas kvůli řazení
  pocet_stran: number = 0; //počet stran	celé číslo	předpokládám, že vždy sudé. 0 může znamenat že nevyšlo, -1 že není znám počet stran
  pages: {index: number, label: string}[] = []; //detailne popsane stranky
  rocnik: string = ""; //ročník	text	jak je uveden na exempláři
  rocnik_number: number;
  cislo: number = 0; //číslo	číslo	pořadové číslo uvedené na čísle
  druhe_cislo: number = 0; //druhé číslo	číslo	další paralelní číslování, kdyby bylo třeba
  id_bib_zaznamu: string = ""; //id bib záznamu	id
  url_bib_zaznamu: string = ""; //url bib záznamu	prolink na bib. záznam (id, URL)
  uuid_cisla: string = ""; //uuid čísla	text	pokud je to z Krameria
  uuid_titulu: string = ""; //uuid titulu	text	pokud je to z Krameria
  url_krameria: string = ""; //URL krameria	text	pokud je to z Krameria
  typ: string = ""; //typ	kód	tištěné/fotokopie/mikrofilm/digitální

  exemplare: Exemplar[] = [];
  /* toto vsechno bude pod exemplar
  stav: StavIssue = StavIssue.OK;
  //stav	kód	kódovaný údaj, významy: ok, poškozeno - čitelné, poškozeno - ztráta informace, chybí celé stránky, není vůbec (zničeno/ztráta)
  stav_popis: string = ""; //stav - popis	text	podrobný popis poškození
  vlastnictvi: string = ""; //vlastnictví	text	sigla nebo název instituce (která nemá siglu)
  carovy_kod: string = ""; //čárový kód	text	čárák svazku, ve kterém je číslo
  signatura: string = ""; //signatura	text	signatura svazku ve kterém je číslo
  */

  znak_oznaceni_vydani: string = ""; //github #47 "Způsob označení mutace": znaky  * nebo • nebo +/.

  state: string = "auto"; // Slouzi pro oznaceni aktualinho stavu v ramci aplikace. Tj, automaticke generovane, podtverzeno

  fromJSON(json: any){
    let array = Object.getOwnPropertyNames(this);
    array.forEach(i => {
      if(json.hasOwnProperty(i)){
        this[i] = json[i];
      }
    });
    if (json.datum_vydani) {
      this.datum_vydani = new Date(json.datum_vydani);
    }
    return this;
  }
}
