package cz.incad.nkp.inprove.parser.dto.criteria.base;

import org.springframework.data.solr.core.query.Criteria;

public interface CriteriaVisitor {

    Criteria visit(Criteria criteria);
}
