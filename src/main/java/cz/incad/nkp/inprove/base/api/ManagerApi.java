package cz.incad.nkp.inprove.base.api;


import cz.incad.nkp.inprove.base.BaseEntity;
import cz.incad.nkp.inprove.base.service.ManagerService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;


public interface ManagerApi<T extends BaseEntity> extends SecureApi {

    ManagerService<T> getService();

    @Operation(summary = "Creates or updates existing entity")
    @PreAuthorize("hasAuthority(this.makeAuthority('WRITE'))")
    @PutMapping("/{id}")
    default void save(@PathVariable String id, @RequestBody T entity) {
        getService().save(id, entity);
    }

    @Operation(summary = "Creates or updates existing entities")
    @PreAuthorize("hasAuthority(this.makeAuthority('WRITE'))")
    @PutMapping
    default void saveAll(@RequestBody List<T> entities) {
        getService().saveAll(entities);
    }

    @Operation(summary = "Deletes entity by id")
    @PreAuthorize("hasAuthority(this.makeAuthority('DELETE'))")
    @DeleteMapping("/{id}")
    default void deleteById(@PathVariable String id) {
        getService().deleteById(id);
    }

    @Operation(summary = "Deletes all entities by ids")
    @PreAuthorize("hasAuthority(this.makeAuthority('DELETE'))")
    @DeleteMapping
    default void deleteAllById(@RequestBody List<String> ids) {
        getService().deleteAllById(ids);
    }
}
