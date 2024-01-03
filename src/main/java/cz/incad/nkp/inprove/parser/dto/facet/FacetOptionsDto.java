package cz.incad.nkp.inprove.parser.dto.facet;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.domain.Pageable;
import org.springframework.data.solr.core.query.FacetOptions;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class FacetOptionsDto {

    private String[] fields;

    private Integer facetLimit = 10;

    private Integer facetMinCount = 1;

    private FacetOptions.FacetSort facetSort = FacetOptions.FacetSort.COUNT;

    private String facetPrefix;

    private Pageable pageable;
}
