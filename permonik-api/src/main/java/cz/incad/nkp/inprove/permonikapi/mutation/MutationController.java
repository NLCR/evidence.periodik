package cz.incad.nkp.inprove.permonikapi.mutation;

import cz.incad.nkp.inprove.permonikapi.mutation.model.MutationDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.apache.solr.client.solrj.SolrServerException;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@Tag(name = "Mutation API", description = "API for managing mutations")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/mutation")
public class MutationController {

    private final MutationService mutationService;


    @Operation(summary = "Lists all mutations")
    @GetMapping("/list/all")
    public List<MutationDTO> getMutations() throws SolrServerException, IOException {
        return mutationService.getMutations();
    }

    @Operation(summary = "Updates existing mutation")
    @PutMapping("/{id}")
    public void updateMutation(@PathVariable String id, @RequestBody MutationDTO mutation) throws SolrServerException, IOException {
        mutationService.updateMutation(id, mutation);
    }


    @Operation(summary = "Creates new mutation")
    @PostMapping()
    public void createMutation(@RequestBody MutationDTO mutation) throws SolrServerException, IOException {
        mutationService.createMutation(mutation);
    }

}
