package cz.incad.nkp.inprove.base.service;


import cz.incad.nkp.inprove.base.BaseEntity;
import cz.incad.nkp.inprove.parsing.QueryDto;
import cz.incad.nkp.inprove.parsing.QueryParser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.solr.core.SolrTemplate;
import org.springframework.data.solr.core.query.Criteria;
import org.springframework.data.solr.core.query.SimpleQuery;
import org.springframework.data.solr.core.query.SimpleStringCriteria;

import java.util.Arrays;
import java.util.List;


public interface QuerySearchService<T extends BaseEntity> extends BasicSearchService<T> {

    SolrTemplate getSolrTemplate();

    QueryParser getCriteriaDtoParser();

    String getSolrCollection();

    Class<T> getClazz();

    default List<T> findAllByStringQuery(String queryString) {
        return findAllByStringQuery(queryString, null).getContent();
    }

    default Page<T> findAllByStringQuery(String queryString, Pageable pageable) {
        SimpleQuery simpleQuery = new SimpleQuery(new SimpleStringCriteria(queryString), pageable);
        return getSolrTemplate().query(getSolrCollection(), simpleQuery, getClazz());
    }

    default List<T> findAllByCriteriaQuery(Criteria criteria) {
        return findAllByCriteriaQuery(criteria, null).getContent();
    }

    default Page<T> findAllByCriteriaQuery(Criteria criteria, Pageable pageable) {
        SimpleQuery simpleQuery = new SimpleQuery(criteria, pageable);
        return getSolrTemplate().query(getSolrCollection(), simpleQuery, getClazz());
    }

    default List<T> findAllByCriteriaDtoQuery(QueryDto queryDto) {
        return findAllByCriteriaDtoQuery(queryDto, null).getContent();
    }

    default Page<T> findAllByCriteriaDtoQuery(QueryDto queryDto, Pageable pageable) {
        Criteria criteria = getCriteriaDtoParser().parse(queryDto);
        SimpleQuery simpleQuery = new SimpleQuery(criteria, pageable);
//        new PageRequest(5, 2).getSortRequests().get(0).getDirection();
        return getSolrTemplate().query(getSolrCollection(), simpleQuery, getClazz());
    }
}
