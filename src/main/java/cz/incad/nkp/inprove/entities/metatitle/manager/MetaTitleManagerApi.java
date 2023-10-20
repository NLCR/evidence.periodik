package cz.incad.nkp.inprove.entities.metatitle.manager;

import cz.incad.nkp.inprove.base.api.ApiResource;
import cz.incad.nkp.inprove.base.api.ManagerApi;
import cz.incad.nkp.inprove.entities.metatitle.MetaTitle;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static cz.incad.nkp.inprove.security.permission.ResourcesConstants.META_TITLE;

@ApiResource(META_TITLE)
@RestController
@RequestMapping("/api/meta-title")
@Tag(name = "Meta Title Manager API", description = "API for managing meta titles")
@RequiredArgsConstructor
public class MetaTitleManagerApi implements ManagerApi<MetaTitle> {

    @Getter
    private final MetaTitleManagerService service;

}
