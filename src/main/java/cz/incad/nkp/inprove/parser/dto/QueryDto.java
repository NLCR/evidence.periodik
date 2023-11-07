package cz.incad.nkp.inprove.parser.dto;

import cz.incad.nkp.inprove.parser.dto.criteria.base.CriteriaBaseDto;
import cz.incad.nkp.inprove.parser.dto.criteria.CriteriaNestedDto;
import cz.incad.nkp.inprove.parser.dto.facet.FacetOptionsDto;
import lombok.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class QueryDto {

    private List<CriteriaBaseDto> criteriaDtos = new ArrayList<>();

    private CriteriaNestedDto.NestedOperation defaultRootOperation = CriteriaNestedDto.NestedOperation.AND;

    private FacetOptionsDto facetOptionsDto;

    public QueryDto(List<CriteriaBaseDto> criteriaDtos, CriteriaNestedDto.NestedOperation defaultNestedOperation) {
        this.criteriaDtos = criteriaDtos;
        this.defaultRootOperation = defaultNestedOperation;
    }

    public QueryDto(List<CriteriaBaseDto> criteriaDtos) {
        this.criteriaDtos = criteriaDtos;
    }

    public QueryDto(CriteriaBaseDto criteriaBaseDto) {
        this.criteriaDtos = Collections.singletonList(criteriaBaseDto);
    }
}
