package cz.incad.nkp.inprove.parser;

import cz.incad.nkp.inprove.parser.dto.criteria.CriteriaNestedDto;
import cz.incad.nkp.inprove.parser.dto.QueryDto;
import cz.incad.nkp.inprove.parser.dto.facet.FacetOptionsDto;
import org.springframework.data.solr.core.query.*;
import org.springframework.stereotype.Component;

@Component
public class QueryParser {

    public Criteria parseCriteria(QueryDto queryDto) {
        Criteria root = new Criteria();
        root = root.connect();
        root.setPartIsOr(true);

        CriteriaNestedDto nested = new CriteriaNestedDto(queryDto.getDefaultRootOperation(), queryDto.getCriteriaDtos());
        return nested.visit(root);
    }

    public FacetOptions parseFacetOptions(QueryDto queryDto) {
        FacetOptionsDto facetOptionsDto = queryDto.getFacetOptionsDto();

        FacetOptions facetOptions = new FacetOptions(facetOptionsDto.getFields());
        facetOptions.setFacetLimit(facetOptionsDto.getFacetLimit());
        facetOptions.setFacetSort(facetOptionsDto.getFacetSort());
        facetOptions.setFacetMinCount(facetOptionsDto.getFacetMinCount());

        if (facetOptionsDto.getFacetPrefix() != null) {
            facetOptions.setFacetPrefix(facetOptionsDto.getFacetPrefix());
        }

        if (facetOptionsDto.getPageable() != null) {
            facetOptions.setPageable(facetOptionsDto.getPageable());
        }

        return facetOptions;
    }

}
