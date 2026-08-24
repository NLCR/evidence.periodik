package cz.incad.nkp.inprove.permonikapi.mutation.model;

import org.mapstruct.InheritInverseConfiguration;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.UUID;

import static org.mapstruct.MappingConstants.ComponentModel.SPRING;

@Mapper(componentModel = SPRING)
public interface MutationMapper {

    default String generateUUID() {
        return UUID.randomUUID().toString();
    }

    @Mapping(target = "name.cs", source = "nameCs")
    @Mapping(target = "name.sk", source = "nameSk")
    @Mapping(target = "name.en", source = "nameEn")
    MutationDTO toDTO(Mutation mutation);

    @InheritInverseConfiguration
    @Mapping(target = "id", defaultExpression = "java(generateUUID())")
    Mutation toModel(MutationDTO dto);

}
