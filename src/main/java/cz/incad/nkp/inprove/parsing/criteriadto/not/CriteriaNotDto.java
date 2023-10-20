package cz.incad.nkp.inprove.parsing.criteriadto.not;

import cz.incad.nkp.inprove.parsing.criteriadto.CriteriaVisitor;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.solr.core.query.Criteria;

@Getter
@Setter
@AllArgsConstructor
public class CriteriaNotDto implements CriteriaVisitor {

    private CriteriaVisitor negatedChild;

    @Override
    public Criteria visit(Criteria criteria) {
        return negatedChild.visit(criteria).not();
    }
}