package cz.incad.nkp.inprove.permonikapi.edition;

import cz.incad.nkp.inprove.permonikapi.edition.dto.CreatableEditionDTO;
import cz.incad.nkp.inprove.permonikapi.edition.dto.EditionDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.apache.solr.client.solrj.SolrServerException;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@Tag(name = "Edition API", description = "API for managing editions")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/edition")
public class EditionController {

    private final EditionService editionService;


    @Operation(summary = "Lists all editions")
    @GetMapping("/list/all")
    public List<EditionDTO> getEditions() throws SolrServerException, IOException {
        return editionService.getEditions();
    }

    @Operation(summary = "Updates existing edition")
    @PutMapping("/{id}")
    public void updateEdition(@PathVariable String id, @RequestBody Edition edition) throws SolrServerException, IOException {
        editionService.updateEdition(id, edition);
    }


    @Operation(summary = "Creates new edition")
    @PostMapping()
    public void createEdition(@RequestBody CreatableEditionDTO edition) throws SolrServerException, IOException {
        editionService.createEdition(edition);
    }

}
