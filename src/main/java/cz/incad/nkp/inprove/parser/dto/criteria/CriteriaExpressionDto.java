package cz.incad.nkp.inprove.parser.dto.criteria;

import cz.incad.nkp.inprove.parser.dto.criteria.base.CriteriaBaseDto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.solr.core.query.Criteria;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CriteriaExpressionDto extends CriteriaBaseDto {

    private String field;

    private ExpressionOperation operation;

    private String expression;

    @Override
    public Criteria visit(Criteria criteria) {
        return join(criteria, field).expression(expression);
    }

    public enum ExpressionOperation {
        EXPRESSION
    }
}
