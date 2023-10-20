package cz.incad.nkp.inprove.parsing.criteriadto.number;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.data.solr.core.query.Criteria;

import java.util.function.BiFunction;

@Getter
@AllArgsConstructor
public enum CriteriaNumberOperation {
    LT((criteria, dto) -> criteria.lessThan(dto.getValue())),
    LTE((criteria, dto) -> criteria.lessThanEqual(dto.getValue())),
    GT((criteria, dto) -> criteria.greaterThan(dto.getValue())),
    GTE((criteria, dto) -> criteria.greaterThanEqual(dto.getValue()));

    private final BiFunction<Criteria, CriteriaNumberDto, Criteria> parseFunc;
}
