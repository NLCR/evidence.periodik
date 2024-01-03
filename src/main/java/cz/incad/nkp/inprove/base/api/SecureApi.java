package cz.incad.nkp.inprove.base.api;

import javax.ws.rs.ForbiddenException;

public interface SecureApi {

    default String makeAuthority(String action) {
        ApiResource resource = this.getClass().getAnnotation(ApiResource.class);
        if (resource == null) {
            throw new ForbiddenException("Missing @ApiResource");
        }
        return resource.value() + "_" + action;
    }
}
