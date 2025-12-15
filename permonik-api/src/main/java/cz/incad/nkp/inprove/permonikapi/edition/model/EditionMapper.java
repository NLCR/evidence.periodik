package cz.incad.nkp.inprove.permonikapi.edition.model;

import cz.incad.nkp.inprove.permonikapi.edition.mapper.EditionNamesMapper;
import cz.incad.nkp.inprove.permonikapi.edition.mapper.EditionNamesToObject;
import cz.incad.nkp.inprove.permonikapi.edition.mapper.EditionNamesToString;
import org.mapstruct.InheritInverseConfiguration;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.UUID;

import static org.mapstruct.MappingConstants.ComponentModel.SPRING;

@Mapper(componentModel = SPRING, uses = {EditionNamesMapper.class})
public interface EditionMapper {

    default String generateUUID() {
        return UUID.randomUUID().toString();
    }

    @Mapping(
        target = "name",
        source = "name",
        qualifiedBy = EditionNamesToObject.class
    )
    EditionDTO toDTO(Edition edition);

    @InheritInverseConfiguration
    @Mapping(target = "id", defaultExpression = "java(generateUUID())")
    @Mapping(target = "name", source = "name", qualifiedBy = EditionNamesToString.class)
    Edition toModel(EditionDTO dto);

}
