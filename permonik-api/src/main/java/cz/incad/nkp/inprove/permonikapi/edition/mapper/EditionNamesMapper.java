package cz.incad.nkp.inprove.permonikapi.edition.mapper;

import com.fasterxml.jackson.databind.ObjectMapper;
import cz.incad.nkp.inprove.permonikapi.edition.dto.EditionNameDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class EditionNamesMapper {

    private final ObjectMapper objectMapper;

    @EditionNamesToObject
    public EditionNameDTO toObject(String json) {
        try {
            return objectMapper.readValue(json, EditionNameDTO.class);
        } catch (Exception e) {
            throw new RuntimeException("Cannot parse names JSON", e);
        }
    }

    @EditionNamesToString
    public String toString(EditionNameDTO namesDTO) {
        try {
            return objectMapper.writeValueAsString(namesDTO);
        } catch (Exception e) {
            throw new RuntimeException("Cannot serialize names JSON", e);
        }
    }
}

