package cz.incad.nkp.inprove.permonikapi.volume;

import cz.incad.nkp.inprove.permonikapi.volume.dto.EditableVolumeWithSpecimensDTO;
import cz.incad.nkp.inprove.permonikapi.volume.dto.VolumeDetailDTO;
import cz.incad.nkp.inprove.permonikapi.volume.dto.VolumeOverviewStatsDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.apache.solr.client.solrj.SolrServerException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@Tag(name = "Volume API", description = "API for managing volumes")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/volume")
public class VolumeController {

    private final VolumeService volumeService;


    @Operation(summary = "Creates new volume with specimens")
    @PostMapping()
    public String createVolumeWithSpecimens(@RequestBody EditableVolumeWithSpecimensDTO editableVolumeWithSpecimensDTO) throws SolrServerException, IOException {
        return volumeService.createVolumeWithSpecimens(editableVolumeWithSpecimensDTO);
    }

    @Operation(summary = "Updates existing volume with specimens")
    @PutMapping("/{id}")
    public void updateVolumeWithSpecimens(@PathVariable String id, @RequestBody EditableVolumeWithSpecimensDTO editableVolumeWithSpecimensDTO) throws SolrServerException, IOException {
        volumeService.updateVolumeWithSpecimens(id, editableVolumeWithSpecimensDTO);
    }

    @Operation(summary = "Updates existing volume with overgenerated specimens")
    @PutMapping("/{id}/overgenerated")
    public void updateOvergeneratedVolumeWithSpecimens(@PathVariable String id, @RequestBody EditableVolumeWithSpecimensDTO editableVolumeWithSpecimensDTO) throws SolrServerException, IOException {
        volumeService.updateOvergeneratedVolumeWithSpecimens(id, editableVolumeWithSpecimensDTO);
    }

    @Operation(summary = "Deletes existing volume with specimens")
    @DeleteMapping("/{id}")
    public void deleteVolumeWithSpecimens(@PathVariable String id) throws SolrServerException, IOException {
        volumeService.deleteVolumeWithSpecimens(id);
    }


    @Operation(summary = "Gets volume detail with specimens by given id. Returns all specimens for authenticated users, only public specimens for anonymous users.")
    @GetMapping("/{id}/detail")
    public VolumeDetailDTO getVolumeDetailById(@PathVariable String id, Authentication authentication) throws SolrServerException, IOException {
        boolean onlyPublic =
            authentication == null
                || authentication instanceof AnonymousAuthenticationToken
                || !authentication.isAuthenticated();
        return volumeService.getVolumeDetailById(id, onlyPublic);
    }

    @Operation(summary = "Gets volume stats by given id")
    @GetMapping("/{id}/stats")
    public VolumeOverviewStatsDTO getVolumeOverviewStats(@PathVariable String id) throws SolrServerException, IOException {
        return volumeService.getVolumeOverviewStats(id);
    }
}
