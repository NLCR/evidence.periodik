package cz.incad.nkp.inprove.permonikapi.mutation.mapper;

import com.fasterxml.jackson.databind.ObjectMapper;
import cz.incad.nkp.inprove.permonikapi.mutation.dto.MutationNameDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MutationNamesMapper {

    private final ObjectMapper objectMapper;

    @MutationNamesToObject
    public MutationNameDTO toObject(String json) {
        try {
            return objectMapper.readValue(json, MutationNameDTO.class);
        } catch (Exception e) {
            throw new RuntimeException("Cannot parse names JSON", e);
        }
    }

    @MutationNamesToString
    public String toString(MutationNameDTO namesDTO) {
        try {
            return objectMapper.writeValueAsString(namesDTO);
        } catch (Exception e) {
            throw new RuntimeException("Cannot serialize names JSON", e);
        }
    }
}

