package cz.incad.nkp.inprove.parsing.criteriadto.nullness;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.data.solr.core.query.Criteria;

import java.util.function.Function;

@Getter
@AllArgsConstructor
public enum CriteriaNullnessOperation {
    IS_NULL(Criteria::isNull),
    IS_NOT_NULL(Criteria::isNotNull);

    private final Function<Criteria, Criteria> parseFunc;
}
