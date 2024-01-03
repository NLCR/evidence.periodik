package cz.incad.nkp.inprove.entities.exemplar;

import org.springframework.data.solr.repository.SolrCrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExemplarRepo extends SolrCrudRepository<Exemplar, String> {

}
