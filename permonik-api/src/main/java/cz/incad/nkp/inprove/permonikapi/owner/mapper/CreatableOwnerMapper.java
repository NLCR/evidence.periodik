package cz.incad.nkp.inprove.permonikapi.owner.mapper;

import cz.incad.nkp.inprove.permonikapi.owner.Owner;
import cz.incad.nkp.inprove.permonikapi.owner.dto.CreatableOwnerDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.UUID;

@Mapper(componentModel = "spring")
public interface CreatableOwnerMapper {

    default String generateUUID() {
        return UUID.randomUUID().toString();
    }

    @Mapping(target = "created", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updated", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "deletedBy", ignore = true)
    @Mapping(target = "id", expression = "java(generateUUID())")
    void createOwner(CreatableOwnerDTO creatableOwnerDTO, @MappingTarget Owner target);
}
