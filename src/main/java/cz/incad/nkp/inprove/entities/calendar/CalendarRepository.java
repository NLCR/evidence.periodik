package cz.incad.nkp.inprove.entities.calendar;

import org.springframework.data.solr.repository.SolrCrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CalendarRepository extends SolrCrudRepository<Calendar, String> {

}
