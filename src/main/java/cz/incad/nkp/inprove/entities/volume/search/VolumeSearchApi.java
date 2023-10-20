package cz.incad.nkp.inprove.entities.volume.search;

import cz.incad.nkp.inprove.base.api.ApiResource;
import cz.incad.nkp.inprove.base.api.SearchApi;
import cz.incad.nkp.inprove.entities.exemplar.Exemplar;
import cz.incad.nkp.inprove.entities.volume.Volume;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static cz.incad.nkp.inprove.security.permission.ResourcesConstants.EXEMPLAR;
import static cz.incad.nkp.inprove.security.permission.ResourcesConstants.VOLUME;

@ApiResource(VOLUME)
@RestController
@RequestMapping("/api/volume")
@Tag(name = "Volume Search API", description = "API for retrieving volumes")
@RequiredArgsConstructor
public class VolumeSearchApi implements SearchApi<Volume> {

    @Getter
    private final VolumeSearchService service;
}
