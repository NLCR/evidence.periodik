package cz.incad.nkp.inprove.permonikapi.mutation.model;

import cz.incad.nkp.inprove.permonikapi.mutation.mapper.MutationNamesMapper;
import cz.incad.nkp.inprove.permonikapi.mutation.mapper.MutationNamesToObject;
import cz.incad.nkp.inprove.permonikapi.mutation.mapper.MutationNamesToString;
import org.mapstruct.InheritInverseConfiguration;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.UUID;

import static org.mapstruct.MappingConstants.ComponentModel.SPRING;

@Mapper(componentModel = SPRING, uses = {MutationNamesMapper.class})
public interface MutationMapper {

    default String generateUUID() {
        return UUID.randomUUID().toString();
    }

    @Mapping(
        target = "name",
        source = "name",
        qualifiedBy = MutationNamesToObject.class
    )
    MutationDTO toDTO(Mutation mutation);

    @InheritInverseConfiguration
    @Mapping(target = "id", defaultExpression = "java(generateUUID())")
    @Mapping(target = "name", source = "name", qualifiedBy = MutationNamesToString.class)
    Mutation toModel(MutationDTO dto);

}
