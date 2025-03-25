package cz.incad.nkp.inprove.permonikapi.metaTitle.mapper;


import cz.incad.nkp.inprove.permonikapi.metaTitle.MetaTitle;
import cz.incad.nkp.inprove.permonikapi.metaTitle.dto.CreatableMetaTitleDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.UUID;

@Mapper(componentModel = "spring")
public interface CreatableMetaTitleMapper {

    default String generateUUID() {
        return UUID.randomUUID().toString();
    }

    @Mapping(target = "id", expression = "java(generateUUID())")
    void createMetaTitle(CreatableMetaTitleDTO creatableMetaTitleDTO, @MappingTarget MetaTitle target);
}
