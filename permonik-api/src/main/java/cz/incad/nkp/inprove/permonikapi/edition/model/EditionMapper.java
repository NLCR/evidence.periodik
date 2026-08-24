package cz.incad.nkp.inprove.permonikapi.edition.model;

import org.mapstruct.InheritInverseConfiguration;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.UUID;

import static org.mapstruct.MappingConstants.ComponentModel.SPRING;

@Mapper(componentModel = SPRING)
public interface EditionMapper {

    default String generateUUID() {
        return UUID.randomUUID().toString();
    }

    @Mapping(target = "name.cs", source = "nameCs")
    @Mapping(target = "name.sk", source = "nameSk")
    @Mapping(target = "name.en", source = "nameEn")
    EditionDTO toDTO(Edition edition);

    @InheritInverseConfiguration
    @Mapping(target = "id", defaultExpression = "java(generateUUID())")
    Edition toModel(EditionDTO dto);

}
