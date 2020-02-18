
export class Configuration {
  context: string;
  defaultLang: string;
  searchParams: {
    rows: number
  };
  vdkFormats: string[];
  periodicity: string[];
  owners: {name: string, url: string}[];
  stavy: string[];
  states: string[];
  vydani: string[];
  mutations: string[];
  znak_oznaceni_vydani: string[];
  test: boolean;
  icons: {[key: string]:string};
}
