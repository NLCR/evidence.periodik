package cz.incad.nkp.inprove.permonikapi.owner;

import cz.incad.nkp.inprove.permonikapi.owner.dto.CreatableOwnerDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.apache.solr.client.solrj.SolrServerException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@Tag(name = "Owner API", description = "API for managing owners")
@RestController
@RequestMapping("/api/owner")
public class OwnerController {

    private final OwnerService ownerService;

    @Autowired
    public OwnerController(OwnerService ownerService) {
        this.ownerService = ownerService;
    }

    @Operation(summary = "Lists all owners")
    @GetMapping("/list/all")
    public List<Owner> getOwners() throws SolrServerException, IOException {
        return ownerService.getOwners();
    }

    @Operation(summary = "Updates existing owner")
    @PutMapping("/{id}")
    public void updateOwner(@PathVariable String id, @RequestBody Owner owner) throws SolrServerException, IOException {
        ownerService.updateOwner(id, owner);
    }


    @Operation(summary = "Creates new owner")
    @PostMapping()
    public void createOwner(@RequestBody CreatableOwnerDTO owner) throws SolrServerException, IOException {
        ownerService.createOwner(owner);
    }

}
