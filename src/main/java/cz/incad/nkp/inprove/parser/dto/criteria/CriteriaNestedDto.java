package cz.incad.nkp.inprove.parser.dto.criteria;

import cz.incad.nkp.inprove.parser.dto.criteria.base.CriteriaBaseDto;
import cz.incad.nkp.inprove.parser.dto.criteria.base.CriteriaVisitor;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.solr.core.query.Criteria;
import org.springframework.data.solr.core.query.Crotch;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CriteriaNestedDto extends CriteriaBaseDto {

    private NestedOperation operation;

    private List<CriteriaBaseDto> children;

    @Override
    public Criteria visit(Criteria criteria) {
        Criteria nestedCriteria = new Criteria();
        nestedCriteria = nestedCriteria.connect();
        nestedCriteria.setPartIsOr(operation == NestedOperation.OR);
        if (!nestedCriteria.isOr()) {
            nestedCriteria.expression("*:*");
        }

        for (CriteriaVisitor visitor : children) {
            nestedCriteria = visitor.visit(nestedCriteria);
        }

        Crotch crotch = criteria.isOr() ? criteria.or(nestedCriteria) : criteria.and(nestedCriteria);
        crotch.setPartIsOr(criteria.isOr());

        return criteria;
    }

    public enum NestedOperation {
        AND,
        OR
    }
}
