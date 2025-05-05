package cz.incad.nkp.inprove.permonikapi.volume;

import cz.incad.nkp.inprove.permonikapi.volume.dto.EditableVolumeWithSpecimensDTO;
import cz.incad.nkp.inprove.permonikapi.volume.dto.VolumeDetailDTO;
import cz.incad.nkp.inprove.permonikapi.volume.dto.VolumeOverviewStatsDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.apache.solr.client.solrj.SolrServerException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@Tag(name = "Volume API", description = "API for managing volumes")
@RestController
@RequestMapping("/api/volume")
public class VolumeController {

    private final VolumeService volumeService;

    @Autowired
    public VolumeController(VolumeService volumeService) {
        this.volumeService = volumeService;
    }

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


    @Operation(summary = "Gets managed volume detail with specimens by given id")
    @GetMapping("/{id}/detail")
    public VolumeDetailDTO getMangedVolumeDetailById(@PathVariable String id) throws SolrServerException, IOException {
        return volumeService.getVolumeDetailById(id, false);
    }

    @Operation(summary = "Gets public volume detail with specimens by given id")
    @GetMapping("/{id}/detail/public")
    public VolumeDetailDTO getPublicVolumeDetailById(@PathVariable String id) throws SolrServerException, IOException {
        return volumeService.getVolumeDetailById(id, true);
    }

    @Operation(summary = "Gets volume stats by given id")
    @GetMapping("/{id}/stats")
    public VolumeOverviewStatsDTO getVolumeOverviewStats(@PathVariable String id) throws SolrServerException, IOException {
        return volumeService.getVolumeOverviewStats(id);
    }
}
