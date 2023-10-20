package cz.incad.nkp.inprove.parsing.criteriadto;

import org.springframework.data.solr.core.query.Criteria;

public interface CriteriaVisitor {

    Criteria visit(Criteria criteria);
}
