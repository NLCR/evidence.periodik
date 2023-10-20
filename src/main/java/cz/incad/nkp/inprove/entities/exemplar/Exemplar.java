package cz.incad.nkp.inprove.entities.exemplar;

import cz.incad.nkp.inprove.base.BaseEntity;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.solr.core.mapping.Indexed;
import org.springframework.data.solr.core.mapping.SolrDocument;

import java.util.Date;
import java.util.List;

import static cz.incad.nkp.inprove.entities.exemplar.Exemplar.COLLECTION;

@Getter
@Setter
@SolrDocument(collection = COLLECTION)
public class Exemplar extends BaseEntity {

    public static final String COLLECTION = "exemplar";

    @Indexed(name = "id_issue", type = "string")
    private String id_issue;

    @Indexed(name = "carovy_kod", type = "string")
    private String carovy_kod;

    @Indexed(name = "numExists", type = "boolean")
    private Boolean numExists;

    @Indexed(name = "carovy_kod_vlastnik", type = "string")
    private String carovy_kod_vlastnik;

    @Indexed(name = "signatura", type = "string")
    private String signatura;

    @Indexed(name = "vlastnik", type = "string")
    private String vlastnik;

    @Indexed(name = "stav", type = "string")
    private List<String> stav;

    @Indexed(name = "typ", type = "string")
    private String typ;

    @Indexed(name = "stav_popis", type = "string")
    private String stav_popis;

    @Indexed(name = "pages", type = "string")
    private String pages;

    @Indexed(name = "oznaceni", type = "string")
    private String oznaceni;

    @Indexed(name = "poznamka", type = "string")
    private String poznamka;

    @Indexed(name = "nazev", type = "string")
    private String nazev;

    @Indexed(name = "podnazev", type = "string")
    private String podnazev;

    @Indexed(name = "vydani", type = "string")
    private String vydani;

    @Indexed(name = "mutace", type = "string")
    private String mutace;

    @Indexed(name = "znak_oznaceni_vydani", type = "string")
    private String znak_oznaceni_vydani;

    @Indexed(name = "datum_vydani", type = "rdate")
    private Date datum_vydani;

    @Indexed(name = "datum_vydani_str", type = "string")
    private String datum_vydani_str;

    @Indexed(name = "datum_vydani_den", type = "string")
    private String datum_vydani_den;

    @Indexed(name = "id_titul", type = "string")
    private String id_titul;

    @Indexed(name = "periodicita", type = "string")
    private String periodicita;

    @Indexed(name = "cislo", type = "string")
    private String cislo;

    @Indexed(name = "rocnik", type = "string")
    private String rocnik;

    @Indexed(name = "cas_vydani", type = "int")
    private Integer cas_vydani;

    @Indexed(name = "cas_vydani_str", type = "string")
    private String cas_vydani_str;

    @Indexed(name = "state", type = "string")
    private String state;

    @Indexed(name = "meta_nazev", type = "string")
    private String meta_nazev;

    @Indexed(name = "pocet_stran", type = "pint")
    private Integer pocet_stran;

    @Indexed(name = "druhe_cislo", type = "pint")
    private Integer druhe_cislo;

    @Indexed(name = "isPriloha", type = "boolean")
    private Boolean isPriloha;

    @Indexed(name = "digitalizovano", type = "booleans")
    private Boolean digitalizovano;

    @Indexed(name = "indextime", type = "pdate")
    private String indextime;

    @Indexed(name = "nazev_prilohy", type = "string")
    private String nazev_prilohy;

    @Indexed(name = "pagesRange", type = "string")
    private String pagesRange;

    @Indexed(name = "popis_oznaceni_vydani", type = "string")
    private String popis_oznaceni_vydani;

    @Indexed(name = "fyzicka_jednotka", type = "string")
    private String fyzicka_jednotka;
}
