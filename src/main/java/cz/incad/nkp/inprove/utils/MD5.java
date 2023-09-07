package cz.incad.nkp.inprove.utils;

import org.apache.commons.codec.digest.DigestUtils;


/**
 * 
 * @author alberto
 */
public class MD5 {

    public static String generate(String[] params) {
        StringBuilder stringBuilder = new StringBuilder();
        for (String s : params) {
            if (s != null) {
                stringBuilder.append(s.replace(" ", "").toLowerCase());
            }
        }
        return DigestUtils.md5Hex(normalize(stringBuilder.toString()));
    }

    public static String generate(String param) {
        return DigestUtils.md5Hex(param);
    }

    private static String normalize(String old) {
        String newStr = old;
        char[] o = {'á', 'à', 'č', 'ď', 'ě', 'é', 'í', 'ľ', 'ň', 'ó', 'ř', 'r', 'š', 'ť', 'ů', 'ú', 'u', 'u', 'ý', 'ž', 'Á', 'À', 'Č', 'Ď', 'É', 'Ě', 'Í', 'Ĺ', 'Ň', 'Ó', 'Ř', 'Š', 'Ť', 'Ú', 'Ů', 'Ý', 'Ž'};
        char[] n = {'a', 'a', 'c', 'd', 'e', 'e', 'i', 'l', 'n', 'o', 'r', 'r', 's', 't', 'u', 'u', 'u', 'u', 'y', 'z', 'A', 'A', 'C', 'D', 'E', 'E', 'I', 'L', 'N', 'O', 'R', 'S', 'T', 'U', 'U', 'Y', 'Z'};
        newStr = newStr.replaceAll(" ", "").toLowerCase();
        for (int i = 0; i < o.length; i++) {
            newStr = newStr.replace(o[i], n[i]);
        }
        newStr = newStr.replace(" ", "");
        return newStr;
    }
}


