package cz.incad.nkp.inprove.entities.volume;

import org.springframework.data.solr.repository.SolrCrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VolumeRepo extends SolrCrudRepository<Volume, String> {

}
