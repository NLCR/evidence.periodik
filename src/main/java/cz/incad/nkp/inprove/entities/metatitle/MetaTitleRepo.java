package cz.incad.nkp.inprove.entities.metatitle;

import lombok.RequiredArgsConstructor;
import org.springframework.data.solr.repository.SolrCrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MetaTitleRepo extends SolrCrudRepository<MetaTitle, String> {

    Iterable<MetaTitle> findAllByPoznamka(String poznamka);
}
