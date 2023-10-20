package cz.incad.nkp.inprove.parsing.criteriadto.in;

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
public class CriteriaInDto implements CriteriaVisitor {

    private String field;

    private List<Object> values;

    @Override
    public Criteria visit(Criteria criteria) {
        Crotch crotch = criteria.isOr() ? criteria.or(this.getField()) : criteria.and(this.getField());
        return crotch.in(values);
    }
}