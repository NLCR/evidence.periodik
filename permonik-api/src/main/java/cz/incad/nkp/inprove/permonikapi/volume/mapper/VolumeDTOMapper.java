package cz.incad.nkp.inprove.permonikapi.volume.mapper;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import cz.incad.nkp.inprove.permonikapi.volume.Volume;
import cz.incad.nkp.inprove.permonikapi.volume.dto.VolumeDTO;
import cz.incad.nkp.inprove.permonikapi.volume.dto.VolumePeriodicityDTO;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.function.Function;

@Service
public class VolumeDTOMapper implements Function<Volume, VolumeDTO> {

    private List<VolumePeriodicityDTO> getPeriodicity(String periodicity) throws JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();


        return Arrays.asList(objectMapper.readValue(periodicity, VolumePeriodicityDTO[].class));

    }

    @Override
    public VolumeDTO apply(Volume volume) {
        try {
            return new VolumeDTO(
                    volume.getId(),
                    volume.getBarCode(),
                    volume.getDateFrom(),
                    volume.getDateTo(),
                    volume.getMetaTitleId(),
                    volume.getSubName(),
                    volume.getMutationId(),
                    getPeriodicity(volume.getPeriodicity()),
                    volume.getFirstNumber(),
                    volume.getLastNumber(),
                    volume.getNote(),
                    volume.getShowAttachmentsAtTheEnd(),
                    volume.getSignature(),
                    volume.getOwnerId(),
                    volume.getYear(),
                    volume.getMutationMark(),
                    volume.getCreated(),
                    volume.getCreatedBy(),
                    volume.getUpdated(),
                    volume.getUpdatedBy(),
                    volume.getDeleted(),
                    volume.getDeletedBy()
            );
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
}
