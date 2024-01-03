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
public class CriteriaStringDto extends CriteriaBaseDto {

    private String field;

    private StringOperation operation;

    private String value;

    @Override
    public Criteria visit(Criteria criteria) {
        return operation.getParseFunc().apply(join(criteria, field), this);
    }

    @Getter
    @AllArgsConstructor
    public enum StringOperation {
        CONTAINS((criteria, dto) -> criteria.contains(dto.getValue())),
        STARTS_WITH((criteria, dto) -> criteria.startsWith(dto.getValue())),
        ENDS_WITH((criteria, dto) -> criteria.endsWith(dto.getValue()));

        private final BiFunction<Criteria, CriteriaStringDto, Criteria> parseFunc;
    }
}