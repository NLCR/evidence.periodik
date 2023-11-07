package cz.incad.nkp.inprove.parser.dto.criteria;

import cz.incad.nkp.inprove.parser.dto.criteria.base.CriteriaBaseDto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.solr.core.query.Criteria;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CriteriaNotDto extends CriteriaBaseDto {

    private CriteriaBaseDto negatedChild;

    private NotOperation operation;

    @Override
    public Criteria visit(Criteria criteria) {
        return negatedChild.visit(criteria).not();
    }

    public enum NotOperation {
        NOT
    }
}