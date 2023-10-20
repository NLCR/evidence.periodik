package cz.incad.nkp.inprove.parsing.criteriadto.string;

import cz.incad.nkp.inprove.parsing.criteriadto.CriteriaVisitor;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.solr.core.query.Criteria;
import org.springframework.data.solr.core.query.Crotch;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class CriteriaStringDto implements CriteriaVisitor {

    private String field;

    private CriteriaStringOperation operation;

    private List<String> values;

    @Override
    public Criteria visit(Criteria criteria) {
        Crotch crotch = criteria.isOr() ? criteria.or(this.getField()) : criteria.and(this.getField());
        return operation.getParseFunc().apply(crotch, this);
    }
}