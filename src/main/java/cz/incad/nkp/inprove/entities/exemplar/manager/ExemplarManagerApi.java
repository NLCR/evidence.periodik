package cz.incad.nkp.inprove.entities.exemplar.manager;

import cz.incad.nkp.inprove.base.api.ApiResource;
import cz.incad.nkp.inprove.base.api.ManagerApi;
import cz.incad.nkp.inprove.entities.exemplar.Exemplar;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static cz.incad.nkp.inprove.security.permission.ResourcesConstants.EXEMPLAR;

@ApiResource(EXEMPLAR)
@RestController
@RequestMapping("/api/v2/exemplar")
@Tag(name = "Exemplar Manager API", description = "API for managing exemplars")
@RequiredArgsConstructor
public class ExemplarManagerApi implements ManagerApi<Exemplar> {

    @Getter
    private final ExemplarManagerService service;

}
