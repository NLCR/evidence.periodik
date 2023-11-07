package cz.incad.nkp.inprove.base.service;


import cz.incad.nkp.inprove.base.BaseEntity;
import cz.incad.nkp.inprove.parser.dto.QueryDto;
import cz.incad.nkp.inprove.parser.QueryParser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.solr.core.SolrTemplate;
import org.springframework.data.solr.core.query.Criteria;
import org.springframework.data.solr.core.query.SimpleFacetQuery;
import org.springframework.data.solr.core.query.SimpleQuery;
import org.springframework.data.solr.core.query.SimpleStringCriteria;

import java.util.List;


public interface QuerySearchService<T extends BaseEntity> extends BasicSearchService<T> {

    SolrTemplate getSolrTemplate();

    QueryParser getCriteriaDtoParser();

    String getSolrCollection();

    Class<T> getClazz();

    default List<T> findAllByStringQuery(String queryString) {
        return findAllByStringQuery(queryString, Pageable.ofSize(Integer.MAX_VALUE)).getContent();
    }

    default Page<T> findAllByStringQuery(String queryString, Pageable pageable) {
        SimpleQuery simpleQuery = new SimpleQuery(new SimpleStringCriteria(queryString), pageable);
        return getSolrTemplate().query(getSolrCollection(), simpleQuery, getClazz());
    }

    default List<T> findAllByCriteriaQuery(Criteria criteria) {
        return findAllByCriteriaQuery(criteria, Pageable.ofSize(Integer.MAX_VALUE)).getContent();
    }

    default Page<T> findAllByCriteriaQuery(Criteria criteria, Pageable pageable) {
        SimpleQuery simpleQuery = new SimpleQuery(criteria, pageable);
        return getSolrTemplate().query(getSolrCollection(), simpleQuery, getClazz());
    }

    default List<T> findAllByCriteriaDtoQuery(QueryDto queryDto) {
        return findAllByCriteriaDtoQuery(queryDto, Pageable.ofSize(Integer.MAX_VALUE)).getContent();
    }

    default Page<T> findAllByCriteriaDtoQuery(QueryDto queryDto, Pageable pageable) {
        Criteria criteria = getCriteriaDtoParser().parseCriteria(queryDto);

        if (queryDto.getFacetOptionsDto() != null && queryDto.getFacetOptionsDto().getFields() != null) {
            SimpleFacetQuery simpleFacetQuery = new SimpleFacetQuery(criteria, pageable);
            simpleFacetQuery.setFacetOptions(getCriteriaDtoParser().parseFacetOptions(queryDto));
            return getSolrTemplate().queryForFacetPage(getSolrCollection(), simpleFacetQuery, getClazz());
        } else {
            SimpleQuery simpleQuery = new SimpleQuery(criteria, pageable);
            return getSolrTemplate().query(getSolrCollection(), simpleQuery, getClazz());
        }
    }
}
