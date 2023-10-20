package cz.incad.nkp.inprove.parsing;

import cz.incad.nkp.inprove.parsing.criteriadto.CriteriaVisitor;
import cz.incad.nkp.inprove.parsing.criteriadto.nested.CriteriaNestedOperation;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class QueryDto {

    private List<CriteriaVisitor> criteriaDtos;

    private CriteriaNestedOperation rootNestedOperation = CriteriaNestedOperation.AND;

    public QueryDto(List<CriteriaVisitor> criteriaDtos) {
        this.criteriaDtos = criteriaDtos;
    }
}
