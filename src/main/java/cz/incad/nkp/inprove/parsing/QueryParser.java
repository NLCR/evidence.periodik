package cz.incad.nkp.inprove.parsing;

import cz.incad.nkp.inprove.parsing.criteriadto.CriteriaVisitor;
import cz.incad.nkp.inprove.parsing.criteriadto.nested.CriteriaNestedOperation;
import org.springframework.data.solr.core.query.Criteria;
import org.springframework.stereotype.Component;

@Component
public class QueryParser {

    public Criteria parse(QueryDto queryDto) {
        Criteria root = new Criteria();
        root.setPartIsOr(queryDto.getRootNestedOperation() == CriteriaNestedOperation.OR);

        for (CriteriaVisitor visitor : queryDto.getCriteriaDtos()) {
            visitor.visit(root);
        }

        return root;
    }
}
