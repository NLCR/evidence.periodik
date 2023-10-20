package cz.incad.nkp.inprove.parsing.criteriadto.equals;

import cz.incad.nkp.inprove.parsing.criteriadto.CriteriaVisitor;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.solr.core.query.Criteria;
import org.springframework.data.solr.core.query.Crotch;

@Getter
@Setter
@AllArgsConstructor
public class CriteriaEqualsDto implements CriteriaVisitor {

    private String field;

    private Object value;

    @Override
    public Criteria visit(Criteria criteria) {
        Crotch crotch = criteria.isOr() ? criteria.or(this.getField()) : criteria.and(this.getField());
        return crotch.is(value);
    }
}