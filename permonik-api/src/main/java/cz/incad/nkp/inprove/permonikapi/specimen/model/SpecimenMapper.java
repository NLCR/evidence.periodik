package cz.incad.nkp.inprove.permonikapi.specimen.model;

import cz.incad.nkp.inprove.permonikapi.specimen.dto.SpecimenOverviewDTO;
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

    @Mapping(target = "mutationMark.mark", source = "mutationMark")
    @Mapping(target = "mutationMark.type", source = "mutationMarkType")
    @Mapping(target = "mutationMark.description", source = "mutationMarkDescription")
    SpecimenOverviewDTO toSpecimenOverviewDTO(Specimen specimen);

    @InheritInverseConfiguration
    @Mapping(target = "metaTitleId", ignore = true)
    @Mapping(target = "metaTitleName", ignore = true)
    @Mapping(target = "barCode", ignore = true)
    @Mapping(target = "ownerId", ignore = true)
    @Mapping(target = "ownerName", ignore = true)
    @Mapping(target = "ownerShorthand", ignore = true)
    @Mapping(target = "ownerSigla", ignore = true)
    @Mapping(target = "editionCsName", ignore = true)
    @Mapping(target = "editionSkName", ignore = true)
    @Mapping(target = "editionEnName", ignore = true)
    @Mapping(target = "mutationCsName", ignore = true)
    @Mapping(target = "mutationSkName", ignore = true)
    @Mapping(target = "mutationEnName", ignore = true)
    Specimen toModel(SpecimenDTO specimenDTO);

}
