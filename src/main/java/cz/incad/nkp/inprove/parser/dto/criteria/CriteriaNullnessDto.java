package cz.incad.nkp.inprove.parser.dto.criteria;

import cz.incad.nkp.inprove.parser.dto.criteria.base.CriteriaBaseDto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.solr.core.query.Criteria;

import java.util.function.Function;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CriteriaNullnessDto extends CriteriaBaseDto {

    private String field;

    private NullnessOperation operation;

    @Override
    public Criteria visit(Criteria criteria) {
        return operation.getParseFunc().apply(join(criteria, field));
    }

    @Getter
    @AllArgsConstructor
    public enum NullnessOperation {
        IS_NULL(Criteria::isNull),
        IS_NOT_NULL(Criteria::isNotNull);

        private final Function<Criteria, Criteria> parseFunc;
    }
}