package cz.incad.nkp.inprove.parsing.criteriadto.between;

import cz.incad.nkp.inprove.parsing.criteriadto.CriteriaVisitor;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.solr.core.query.Criteria;
import org.springframework.data.solr.core.query.Crotch;

@Getter
@Setter
@AllArgsConstructor
public class CriteriaBetweenDto implements CriteriaVisitor {

    private String field;

    private Integer lower;

    private Integer upper;

    @Override
    public Criteria visit(Criteria criteria) {
        Crotch crotch = criteria.isOr() ? criteria.or(this.getField()) : criteria.and(this.getField());
        return crotch.between(this.getLower(), this.getUpper());
    }
}
