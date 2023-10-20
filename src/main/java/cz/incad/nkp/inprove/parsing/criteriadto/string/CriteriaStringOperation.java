package cz.incad.nkp.inprove.parsing.criteriadto.string;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.data.solr.core.query.Criteria;

import java.util.function.BiFunction;

@Getter
@AllArgsConstructor
public enum CriteriaStringOperation {
    STARTS_WITH((criteria, dto) -> criteria.startsWith(dto.getValues())),
    ENDS_WITH((criteria, dto) -> criteria.endsWith(dto.getValues())),
    CONTAINS((criteria, dto) -> criteria.contains(dto.getValues()));

    private final BiFunction<Criteria, CriteriaStringDto, Criteria> parseFunc;
}
