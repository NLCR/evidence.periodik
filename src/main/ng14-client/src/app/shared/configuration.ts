
export class Configuration {
  context: string;
  defaultLang: string;
  searchParams: {
    rows: number
  };
  vdkFormats: string[];
  periodicity: string[];
  owners: {id: number, name: string, sigla: string}[];
  stavy: string[];
  states: string[];
  vydani: {id: number, name: string}[];
  mutations: {id: number, name: string}[];
  znak_oznaceni_vydani: string[];
  test: boolean;
  icons: {[key: string]:string};
  expiredTime: number;
}
