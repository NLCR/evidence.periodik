
export class Utils {
  static dateFromDay(str) {
    if (!/^(\d){8}$/.test(str)) {
      return null;
    }
    const y = str.substr(0, 4),
      m = str.substr(4, 2),
      d = str.substr(6, 2);
    return new Date(y + '-' + m  + '-' + d);
  }

}
