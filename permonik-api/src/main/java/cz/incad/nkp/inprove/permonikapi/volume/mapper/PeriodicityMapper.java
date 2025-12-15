package cz.incad.nkp.inprove.permonikapi.volume.mapper;

import com.fasterxml.jackson.databind.ObjectMapper;
import cz.incad.nkp.inprove.permonikapi.volume.dto.VolumePeriodicityDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class PeriodicityMapper {

    private final ObjectMapper objectMapper;


    @PeriodicityToList
    public List<VolumePeriodicityDTO> toList(String json) {
        try {
            return Arrays.asList(objectMapper.readValue(json, VolumePeriodicityDTO[].class));
        } catch (Exception e) {
            throw new RuntimeException("Cannot parse periodicity JSON", e);
        }
    }

    @PeriodicityToString
    public String toString(List<VolumePeriodicityDTO> list) {
        try {
            return objectMapper.writeValueAsString(list);
        } catch (Exception e) {
            throw new RuntimeException("Cannot serialize periodicity JSON", e);
        }
    }
}

