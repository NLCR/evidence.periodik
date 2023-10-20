
package cz.incad.nkp.inprove.entities.metatitle;


import cz.incad.nkp.inprove.base.BaseEntity;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.solr.core.mapping.Indexed;
import org.springframework.data.solr.core.mapping.SolrDocument;

import static cz.incad.nkp.inprove.entities.metatitle.MetaTitle.COLLECTION;

@Getter
@Setter
@SolrDocument(collection = COLLECTION)
public class MetaTitle extends BaseEntity {

    public static final String COLLECTION = "titul";

    @Indexed(name = "meta_nazev", type = "text_general")
    private String meta_nazev;

    @Indexed(name = "meta_nazev_sort", type = "icu_sort_cs")
    private String meta_nazev_sort;

    @Indexed(name = "meta_nazev_str", type = "string")
    private String meta_nazev_str;

    @Indexed(name = "periodicita", type = "text_general")
    private String periodicita;

    @Indexed(name = "poznamka", type = "string")
    private String poznamka;

    @Indexed(name = "show_to_not_logged_users", type = "boolean")
    private Boolean show_to_not_logged_users;

    @Indexed(name = "uuid", type = "string")
    private String uuid;

    @Indexed(name = "pocet_stran", type = "plong")
    private Long pocet_stran;
}
