
package cz.incad.nkp.inprove.old;

import com.alibaba.fastjson.JSON;
import java.util.List;
import java.util.logging.Logger;

import cz.incad.nkp.inprove.old.solr.Indexer;
import org.apache.solr.client.solrj.beans.Field;
import org.json.JSONObject;

/**
 *
 * @author alberto
 */
public class Exemplar {

    final static Logger LOGGER = Logger.getLogger(Exemplar.class.getName());
    @Field
    public String id;
    @Field
    public String id_issue;
    @Field
    public String carovy_kod;
    @Field
    public boolean numExists;
    @Field
    public String carovy_kod_vlastnik;
    @Field
    public String signatura;
    @Field
    public String vlastnik;
    @Field
    public List<String> stav;
    @Field
    public String stav_popis;
    @Field
    public String pages;
    //  @Field
//  public List<String> pagesRange;
    @Field
    public String oznaceni;
    @Field
    public String popis_oznaceni_vydani; // github #46
    @Field
    public String poznamka;

    // Issue fields
    @Field
    public String nazev;
    @Field
    public String podnazev;
    @Field
    public String vydani;
    @Field
    public String mutace;
    @Field
    public String znak_oznaceni_vydani;
    @Field
    public String datum_vydani;
    @Field
    public int datum_vydani_den;

    @Field
    public String id_titul;
    @Field
    public String periodicita;
    @Field
    public String cislo;
    @Field
    public String rocnik;
    @Field
    public int cas_vydani;
    @Field
    public String cas_vydani_str;
    @Field
    public String state;

    @Field
    public String meta_nazev;

    @Field
    public int pocet_stran;
    @Field
    public boolean isPriloha;
    @Field
    public String nazev_prilohy;


    // pages: { missing: string[], damaged: string[] } = { missing: [], damaged: [] }; // seznam chybejcich a poskozenych stranek

    // github #46 k exempláři přidat pole "označení regionálního vydání" -
    // vkládání symbolů - př hvězdička, puntík - zobrazení v přehledové tabulce



    public static Exemplar fromJSON(JSONObject json) {
        Exemplar obj = JSON.parseObject(json.toString(), Exemplar.class);
        if (obj.id_issue == null || obj.id_issue.trim().isEmpty()) {
            obj.id_issue = Indexer.generateId(json, Options.getInstance().getStrings("idfields"));
        }

        if (obj.id == null || obj.id.trim().isEmpty()) {
            obj.id = obj.id_issue + "_" + obj.carovy_kod + "_" + obj.vlastnik;
        }
        return obj;
    }

}
