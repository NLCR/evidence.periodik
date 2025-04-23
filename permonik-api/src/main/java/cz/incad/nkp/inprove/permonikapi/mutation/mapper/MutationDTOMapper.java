package cz.incad.nkp.inprove.permonikapi.mutation.mapper;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import cz.incad.nkp.inprove.permonikapi.mutation.Mutation;
import cz.incad.nkp.inprove.permonikapi.mutation.dto.MutationDTO;
import cz.incad.nkp.inprove.permonikapi.mutation.dto.MutationNameDTO;
import org.springframework.stereotype.Service;

import java.util.function.Function;

@Service
public class MutationDTOMapper implements Function<Mutation, MutationDTO> {

    private MutationNameDTO getNames(String names) throws JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();

        return objectMapper.readValue(names, MutationNameDTO.class);

    }


    @Override
    public MutationDTO apply(Mutation mutation) {
        try {
            return new MutationDTO(
                    mutation.getId(),
                    getNames(mutation.getName())
            );
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
}
