package cz.incad.nkp.inprove.permonikapi.metaTitle;


import cz.incad.nkp.inprove.permonikapi.metaTitle.dto.CreatableMetaTitleDTO;
import cz.incad.nkp.inprove.permonikapi.metaTitle.dto.MetaTitleOverviewDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.apache.solr.client.solrj.SolrServerException;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@Tag(name = "MetaTitle API", description = "API for managing metaTitles")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/metatitle")
public class MetaTitleController {

    private final MetaTitleService metaTitleService;


    @Operation(summary = "Gets metaTitle with given id")
    @GetMapping("/{id}")
    /* Endpoint used for specimen result table */
    public MetaTitle getMetaTitleById(@PathVariable String id) throws SolrServerException, IOException {
        return metaTitleService.getMetaTitleById(id);
    }


    @Operation(summary = "List metaTitles overview")
    @GetMapping("/list/overview")
    public List<MetaTitleOverviewDTO> getMetaTitleOverview() throws SolrServerException, IOException {
        return metaTitleService.getMetaTitleOverview();
    }


    @Operation(summary = "List all metaTitles")
    @GetMapping("/list/all")
    public List<MetaTitle> getMetaTitles() throws SolrServerException, IOException {
        return metaTitleService.getMetaTitles();
    }

    // NOTE: we can update metaTitle simply, because all cores are using only metaTitleId
    @Operation(summary = "Updates existing metaTitle")
    @PutMapping("/{id}")
    public void updateMetaTitle(@PathVariable String id, @RequestBody MetaTitle metaTitle) throws SolrServerException, IOException {
        metaTitleService.updateMetaTitle(id, metaTitle);
    }


    @Operation(summary = "Creates new metaTitle")
    @PostMapping()
    public void createMetaTitle(@RequestBody CreatableMetaTitleDTO metaTitle) throws SolrServerException, IOException {
        metaTitleService.createMetaTitle(metaTitle);
    }
}
