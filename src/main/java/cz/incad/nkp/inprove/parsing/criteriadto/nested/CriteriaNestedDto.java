package cz.incad.nkp.inprove.parsing.criteriadto.nested;

import cz.incad.nkp.inprove.parsing.criteriadto.CriteriaVisitor;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.solr.core.query.Criteria;
import org.springframework.data.solr.core.query.Crotch;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class CriteriaNestedDto implements CriteriaVisitor {

    private CriteriaNestedOperation operation;

    private List<CriteriaVisitor> criteriaVisitors;

    @Override
    public Criteria visit(Criteria criteria) {
        Criteria nestedCriteria = new Criteria();
        nestedCriteria.setPartIsOr(operation == CriteriaNestedOperation.OR);

        Crotch crotch = criteria.isOr() ? criteria.or(nestedCriteria) : criteria.and(nestedCriteria);
        for (CriteriaVisitor visitor : this.criteriaVisitors) {
            visitor.visit(nestedCriteria);
        }

        return crotch;
    }
}
