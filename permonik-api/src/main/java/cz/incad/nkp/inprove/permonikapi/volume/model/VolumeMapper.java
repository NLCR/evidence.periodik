package cz.incad.nkp.inprove.permonikapi.volume.model;

import cz.incad.nkp.inprove.permonikapi.volume.mapper.PeriodicityMapper;
import cz.incad.nkp.inprove.permonikapi.volume.mapper.PeriodicityToList;
import cz.incad.nkp.inprove.permonikapi.volume.mapper.PeriodicityToString;
import org.mapstruct.InheritInverseConfiguration;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import static org.mapstruct.MappingConstants.ComponentModel.SPRING;

@Mapper(componentModel = SPRING, uses = {PeriodicityMapper.class})
public interface VolumeMapper {

    @Mapping(target = "mutationMark.mark", source = "mutationMark")
    @Mapping(target = "mutationMark.type", source = "mutationMarkType")
    @Mapping(target = "mutationMark.description", source = "mutationMarkDescription")
    @Mapping(
        target = "periodicity",
        source = "periodicity",
        qualifiedBy = PeriodicityToList.class
    )
    VolumeDTO toDTO(Volume volume);

    @InheritInverseConfiguration
    @Mapping(target = "periodicity", source = "periodicity", qualifiedBy = PeriodicityToString.class)
    Volume toModel(VolumeDTO dto);

}
