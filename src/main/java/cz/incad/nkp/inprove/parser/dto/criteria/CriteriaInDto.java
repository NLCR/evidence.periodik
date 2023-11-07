package cz.incad.nkp.inprove.parser.dto.criteria;

import cz.incad.nkp.inprove.parser.dto.criteria.base.CriteriaBaseDto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.solr.core.query.Criteria;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CriteriaInDto extends CriteriaBaseDto {

    private String field;

    private InOperation operation;

    private List<Object> values;

    @Override
    public Criteria visit(Criteria criteria) {
        return join(criteria, field).in(values);
    }


    public enum InOperation {
        IN
    }
}
