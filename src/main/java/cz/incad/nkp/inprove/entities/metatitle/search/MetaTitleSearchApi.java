package cz.incad.nkp.inprove.entities.metatitle.search;

import cz.incad.nkp.inprove.base.api.ApiResource;
import cz.incad.nkp.inprove.base.api.SearchApi;
import cz.incad.nkp.inprove.entities.metatitle.MetaTitle;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import static cz.incad.nkp.inprove.security.permission.ResourcesConstants.META_TITLE;

@ApiResource(META_TITLE)
@RestController
@RequestMapping("/api/v2/meta-title")
@Tag(name = "Meta Title Search API", description = "API for retrieving meta titles")
@RequiredArgsConstructor
public class MetaTitleSearchApi implements SearchApi<MetaTitle> {

    @Getter
    private final MetaTitleSearchService service;
}
