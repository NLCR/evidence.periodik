package cz.incad.nkp.inprove.base.service;


import cz.incad.nkp.inprove.base.BaseEntity;
import org.springframework.data.solr.repository.SolrCrudRepository;

import java.util.List;


public interface ManagerService<T extends BaseEntity> {

    SolrCrudRepository<T, String> getRepo();

    default void save(String id, T entity) {
        if (entity.getId() == null || !entity.getId().equals(id)) {
            entity.setId(id);
        }

        getRepo().save(entity);
    }

    default void saveAll(List<T> entities) {
        getRepo().saveAll(entities);
    }

    default void deleteById(String id) {
        getRepo().deleteById(id);
    }

    default void deleteAllById(List<String> entities) {
        getRepo().deleteAllById(entities);
    }
}
