package cz.incad.nkp.inprove.parser.dto.criteria;

import cz.incad.nkp.inprove.parser.dto.criteria.base.CriteriaBaseDto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.solr.core.query.Criteria;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CriteriaBetweenDto extends CriteriaBaseDto {

    private String field;

    private BetweenOperation operation;

    private Object lower;

    private Object upper;

    @Override
    public Criteria visit(Criteria criteria) {
        return join(criteria, field).between(this.getLower(), this.getUpper());
    }

    public enum BetweenOperation {
        BETWEEN
    }
}
