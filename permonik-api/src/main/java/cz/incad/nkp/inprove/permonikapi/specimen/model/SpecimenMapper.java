package cz.incad.nkp.inprove.permonikapi.specimen.model;

import org.mapstruct.InheritInverseConfiguration;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import static org.mapstruct.MappingConstants.ComponentModel.SPRING;

@Mapper(componentModel = SPRING)
public interface SpecimenMapper {

    @Mapping(target = "mutationMark.mark", source = "mutationMark")
    @Mapping(target = "mutationMark.type", source = "mutationMarkType")
    @Mapping(target = "mutationMark.description", source = "mutationMarkDescription")
    SpecimenDTO toDTO(Specimen specimen);

    @InheritInverseConfiguration
    Specimen toModel(SpecimenDTO specimenDTO);

}
