package cz.incad.nkp.inprove.base.service;


import cz.incad.nkp.inprove.base.BaseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.solr.repository.SolrCrudRepository;

import java.util.List;


public interface BasicSearchService<T extends BaseEntity> {

    SolrCrudRepository<T, String> getRepo();

    default boolean existsById(String id) {
        return getRepo().existsById(id);
    }

    default T findById(String id) {
        return getRepo().findById(id).orElse(null);
    }

    default long count() {
        return getRepo().count();
    }

    default List<T> findAll() {
        return ((Page<T>) getRepo().findAll()).getContent();
    }

    default Page<T> findAll(Pageable pageable) {
        return getRepo().findAll(pageable);
    }

    default List<T> findAllById(List<String> ids) {
        return ((Page<T>) getRepo().findAllById(ids)).getContent();
    }
}
