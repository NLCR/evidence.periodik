package cz.incad.nkp.inprove.entities.volume.manager;

import cz.incad.nkp.inprove.base.api.ApiResource;
import cz.incad.nkp.inprove.base.api.ManagerApi;
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
@RequestMapping("/api/v2/volume")
@Tag(name = "Volume Manager API", description = "API for managing volumes")
@RequiredArgsConstructor
public class VolumeManagerApi implements ManagerApi<Volume> {

    @Getter
    private final VolumeManagerService service;

}
