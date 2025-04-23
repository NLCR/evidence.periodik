package cz.incad.nkp.inprove.permonikapi.edition.mapper;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import cz.incad.nkp.inprove.permonikapi.edition.Edition;
import cz.incad.nkp.inprove.permonikapi.edition.dto.EditionDTO;
import cz.incad.nkp.inprove.permonikapi.edition.dto.EditionNameDTO;
import org.springframework.stereotype.Service;

import java.util.function.Function;

@Service
public class EditionDTOMapper implements Function<Edition, EditionDTO> {

    private EditionNameDTO getNames(String names) throws JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();

        return objectMapper.readValue(names, EditionNameDTO.class);

    }


    @Override
    public EditionDTO apply(Edition edition) {
        try {
            return new EditionDTO(
                    edition.getId(),
                    getNames(edition.getName()),
                    edition.getIsDefault(),
                    edition.getIsAttachment(),
                    edition.getIsPeriodicAttachment()
            );
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
}
