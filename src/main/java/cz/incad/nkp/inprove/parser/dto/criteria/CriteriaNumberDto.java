package cz.incad.nkp.inprove.parser.dto.criteria;

import cz.incad.nkp.inprove.parser.dto.criteria.base.CriteriaBaseDto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.solr.core.query.Criteria;

import java.util.function.BiFunction;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CriteriaNumberDto extends CriteriaBaseDto {

    private String field;

    private NumberOperation operation;

    private Object value;

    @Override
    public Criteria visit(Criteria criteria) {
        return operation.getParseFunc().apply(join(criteria, field), this);
    }

    @Getter
    @AllArgsConstructor
    public enum NumberOperation {
        LT((criteria, dto) -> criteria.lessThan(dto.getValue())),
        LTE((criteria, dto) -> criteria.lessThanEqual(dto.getValue())),
        GT((criteria, dto) -> criteria.greaterThan(dto.getValue())),
        GTE((criteria, dto) -> criteria.greaterThanEqual(dto.getValue()));

        private final BiFunction<Criteria, CriteriaNumberDto, Criteria> parseFunc;
    }
}