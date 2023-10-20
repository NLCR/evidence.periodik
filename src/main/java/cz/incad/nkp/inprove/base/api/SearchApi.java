package cz.incad.nkp.inprove.base.api;


import cz.incad.nkp.inprove.base.BaseEntity;
import cz.incad.nkp.inprove.base.service.QuerySearchService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.solr.core.query.SolrPageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;


public interface SearchApi<T extends BaseEntity> extends SecureApi  {

    QuerySearchService<T> getService();

    @Operation(summary = "Checks if entity exists")
    @PreAuthorize("hasAuthority(this.makeAuthority('READ'))")
    @GetMapping("/{id}/exists")
    default boolean exists(@PathVariable String id) {
        return getService().existsById(id);
    }

    @Operation(summary = "Finds entity")
    @PreAuthorize("hasAuthority(this.makeAuthority('READ'))")
    @GetMapping("/{id}")
    default T findById(@PathVariable String id) {
        return getService().findById(id);
    }

    @Operation(summary = "Counts all entities")
    @PreAuthorize("hasAuthority(this.makeAuthority('READ'))")
    @GetMapping("/count")
    default long count() {
        return getService().count();
    }

    @Operation(summary = "Finds all entities")
    @PreAuthorize("hasAuthority(this.makeAuthority('READ'))")
    @GetMapping
    default List<T> findAll() {
        return getService().findAll();
    }

    @Operation(summary = "Finds all entities by Pageable",
            description = "example of pageable query parameters: ?page=0&size=5&sort=email,desc&sort=owner,asc")
    @PreAuthorize("hasAuthority(this.makeAuthority('READ'))")
    @PutMapping("/pageable")
    default Page<T> findAllByPageable(@RequestBody Pageable pageable) {
        return getService().findAll(pageable);
    }

    @Operation(summary = "Finds all entities by ids")
    @PreAuthorize("hasAuthority(this.makeAuthority('READ'))")
    @PutMapping("/ids")
    default List<T> findAllById(@RequestBody List<String> ids) {
        return getService().findAllById(ids);
    }

    @Operation(summary = "Finds all entities by query")
    @PreAuthorize("hasAuthority(this.makeAuthority('READ'))")
    @PutMapping("/query")
    default Page<T> findAllByQuery(@RequestBody String queryString, Pageable pageable) {
        return getService().findAllByStringQuery(queryString, pageable);
    }
}
