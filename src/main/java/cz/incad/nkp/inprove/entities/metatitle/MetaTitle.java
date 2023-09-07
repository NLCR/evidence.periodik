
package cz.incad.nkp.inprove.entities.metatitle;

import com.alibaba.fastjson.JSON;

import com.fasterxml.jackson.annotation.JsonProperty;
import cz.incad.nkp.inprove.entities.DomainObject;
import cz.incad.nkp.inprove.utils.MD5;
import lombok.Getter;
import lombok.Setter;
import org.json.JSONObject;
import org.springframework.data.annotation.Id;
import org.springframework.data.solr.core.mapping.Indexed;
import org.springframework.data.solr.core.mapping.SolrDocument;

import static cz.incad.nkp.inprove.entities.metatitle.MetaTitle.CORE_NAME;

@Getter
@Setter
@SolrDocument(collection = CORE_NAME)
public class MetaTitle extends DomainObject {

    public static final String CORE_NAME = "titul";

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

    public static MetaTitle fromJSON(JSONObject json) {
        MetaTitle obj = JSON.parseObject(json.toString(), MetaTitle.class);
        if (obj.id == null || obj.id.trim().isEmpty()) {
            obj.id = MD5.generate(new String[]{obj.meta_nazev});
        }
        return obj;
    }

}
