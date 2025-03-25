package cz.incad.nkp.inprove.permonikapi.mutation.mapper;


import cz.incad.nkp.inprove.permonikapi.mutation.Mutation;
import cz.incad.nkp.inprove.permonikapi.mutation.dto.CreatableMutationDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.UUID;

@Mapper(componentModel = "spring")
public interface CreatableMutationMapper {

    default String generateUUID() {
        return UUID.randomUUID().toString();
    }

    @Mapping(target = "id", expression = "java(generateUUID())")
    void createMutation(CreatableMutationDTO creatableMutationDTO, @MappingTarget Mutation target);
}
