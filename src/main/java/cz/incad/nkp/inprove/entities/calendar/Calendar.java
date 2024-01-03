
package cz.incad.nkp.inprove.entities.calendar;

import cz.incad.nkp.inprove.base.BaseEntity;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.solr.core.mapping.Indexed;
import org.springframework.data.solr.core.mapping.SolrDocument;

import static cz.incad.nkp.inprove.entities.calendar.Calendar.COLLECTION;

@Getter
@Setter
@SolrDocument(collection = COLLECTION)
public class Calendar extends BaseEntity {

    public static final String COLLECTION = "calendar";

    @Indexed(name = "type", type = "string")
    private String type;

    @Indexed(name = "title", type = "string")
    private String title;

    @Indexed(name = "year", type = "pint")
    private Integer year;

    @Indexed(name = "month", type = "pint")
    private Integer month;

    @Indexed(name = "day", type = "pint")
    private Integer day;
}
