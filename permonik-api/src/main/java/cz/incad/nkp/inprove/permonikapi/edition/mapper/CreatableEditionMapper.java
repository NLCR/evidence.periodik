package cz.incad.nkp.inprove.permonikapi.edition.mapper;


import cz.incad.nkp.inprove.permonikapi.edition.Edition;
import cz.incad.nkp.inprove.permonikapi.edition.dto.CreatableEditionDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.UUID;

@Mapper(componentModel = "spring")
public interface CreatableEditionMapper {

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
    @Mapping(target = "isDefault", defaultValue = "false")
    @Mapping(target = "isAttachment", defaultValue = "false")
    @Mapping(target = "isPeriodicAttachment", defaultValue = "false")
    void createEdition(CreatableEditionDTO creatableEditionDTO, @MappingTarget Edition target);
}
