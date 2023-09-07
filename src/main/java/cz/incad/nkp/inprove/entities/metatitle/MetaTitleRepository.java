package cz.incad.nkp.inprove.entities.metatitle;

import org.springframework.data.solr.repository.SolrCrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MetaTitleRepository extends SolrCrudRepository<MetaTitle, String> {

}
