
package cz.incad.nkp.inprove.entities.volume;

import cz.incad.nkp.inprove.entities.DomainObject;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.solr.core.mapping.Indexed;
import org.springframework.data.solr.core.mapping.SolrDocument;

import java.util.Date;
import java.util.List;

import static cz.incad.nkp.inprove.entities.volume.Volume.CORE_NAME;

@Getter
@Setter
@SolrDocument(collection = CORE_NAME)
public class Volume extends DomainObject {

    public static final String CORE_NAME = "svazek";

    @Indexed(name = "id_titul", type = "string")
    private String id_titul;

    @Indexed(name = "signatura", type = "string")
    private String signatura;

    @Indexed(name = "mutace", type = "string")
    private String mutace;

    @Indexed(name = "periodicita", type = "string")
    private List<String> periodicita;

    @Indexed(name = "poznamka", type = "string")
    private String poznamka;

    @Indexed(name = "vlastnik", type = "string")
    private String vlastnik;

    @Indexed(name = "datum_od", type = "rdate")
    private Date datum_od;

    @Indexed(name = "datum_do", type = "rdate")
    private Date datum_do;

    @Indexed(name = "prvni_cislo", type = "string")
    private String prvni_cislo;

    @Indexed(name = "posledni_cislo", type = "string")
    private String posledni_cislo;

    @Indexed(name = "znak_oznaceni_vydani", type = "string")
    private String znak_oznaceni_vydani;

    @Indexed(name = "carovy_kod", type = "string")
    private String carovy_kod;

    @Indexed(name = "pocet_stran", type = "plong")
    private Long pocet_stran;

    @Indexed(name = "show_attachments_at_the_end", type = "boolean")
    private Boolean show_attachments_at_the_end;
}
