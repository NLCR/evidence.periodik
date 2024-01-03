package cz.incad.nkp.inprove.parser.dto.criteria.base;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import cz.incad.nkp.inprove.parser.dto.criteria.*;
import org.springframework.data.solr.core.query.Criteria;
import org.springframework.data.solr.core.query.Crotch;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.EXTERNAL_PROPERTY, property = "operation")
@JsonSubTypes({
        @JsonSubTypes.Type(value = CriteriaBetweenDto.class, name = "BETWEEN"),
        @JsonSubTypes.Type(value = CriteriaEqualsDto.class, name = "EQ"),
        @JsonSubTypes.Type(value = CriteriaExpressionDto.class, name = "EXPRESSION"),
        @JsonSubTypes.Type(value = CriteriaInDto.class, name = "IN"),
        @JsonSubTypes.Type(value = CriteriaNestedDto.class, name = "OR"),
        @JsonSubTypes.Type(value = CriteriaNestedDto.class, name = "AND"),
        @JsonSubTypes.Type(value = CriteriaNotDto.class, name = "NOT"),
        @JsonSubTypes.Type(value = CriteriaNullnessDto.class, name = "IS_NULL"),
        @JsonSubTypes.Type(value = CriteriaNullnessDto.class, name = "IS_NOT_NULL"),
        @JsonSubTypes.Type(value = CriteriaNumberDto.class, name = "GT"),
        @JsonSubTypes.Type(value = CriteriaNumberDto.class, name = "GTE"),
        @JsonSubTypes.Type(value = CriteriaNumberDto.class, name = "LT"),
        @JsonSubTypes.Type(value = CriteriaNumberDto.class, name = "LTE"),
        @JsonSubTypes.Type(value = CriteriaStringDto.class, name = "CONTAINS"),
        @JsonSubTypes.Type(value = CriteriaStringDto.class, name = "STARTS_WITH"),
        @JsonSubTypes.Type(value = CriteriaStringDto.class, name = "ENDS_WITH"),
})
public abstract class CriteriaBaseDto implements CriteriaVisitor {

    protected abstract Enum<?> getOperation();

    protected Criteria join(Criteria criteria, String field) {
        Criteria newCriteria = new Criteria(field);
        Crotch crotch = criteria.isOr() ? criteria.or(newCriteria) : criteria.and(newCriteria);
        crotch.setPartIsOr(criteria.isOr());
        return crotch;
    }
}

