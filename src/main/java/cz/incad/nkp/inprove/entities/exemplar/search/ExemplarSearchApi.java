package cz.incad.nkp.inprove.entities.exemplar.search;

import cz.incad.nkp.inprove.base.api.ApiResource;
import cz.incad.nkp.inprove.base.api.SearchApi;
import cz.incad.nkp.inprove.entities.exemplar.Exemplar;
import cz.incad.nkp.inprove.entities.metatitle.MetaTitle;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static cz.incad.nkp.inprove.security.permission.ResourcesConstants.EXEMPLAR;
import static cz.incad.nkp.inprove.security.permission.ResourcesConstants.META_TITLE;

@ApiResource(EXEMPLAR)
@RestController
@RequestMapping("/api/v2/exemplar")
@Tag(name = "Exemplar Search API", description = "API for retrieving exemplars")
@RequiredArgsConstructor
public class ExemplarSearchApi implements SearchApi<Exemplar> {

    @Getter
    private final ExemplarSearchService service;
}
