package cz.incad.nkp.inprove.base.service;

import cz.incad.nkp.inprove.base.BaseEntity;
import cz.incad.nkp.inprove.parsing.QueryParser;
import lombok.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.solr.core.SolrTemplate;

@Getter
@Setter
public abstract class BaseSearchService<T extends BaseEntity> implements QuerySearchService<T> {

    protected SolrTemplate solrTemplate;

    protected QueryParser criteriaDtoParser;

    @Autowired
    public void setSolrTemplate(SolrTemplate solrTemplate) {
        this.solrTemplate = solrTemplate;
    }

    @Autowired
    public void setCriteriaDtoParser(QueryParser criteriaDtoParser) {
        this.criteriaDtoParser = criteriaDtoParser;
    }
}
