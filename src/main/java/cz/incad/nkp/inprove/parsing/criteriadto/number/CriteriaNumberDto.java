package cz.incad.nkp.inprove.parsing.criteriadto.number;

import cz.incad.nkp.inprove.parsing.criteriadto.CriteriaVisitor;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.solr.core.query.Criteria;
import org.springframework.data.solr.core.query.Crotch;

@Getter
@Setter
@AllArgsConstructor
public class CriteriaNumberDto implements CriteriaVisitor {

    private String field;

    private CriteriaNumberOperation operation;

    private Number value;

    @Override
    public Criteria visit(Criteria criteria) {
        Crotch crotch = criteria.isOr() ? criteria.or(this.getField()) : criteria.and(this.getField());
        return operation.getParseFunc().apply(crotch, this);
    }
}