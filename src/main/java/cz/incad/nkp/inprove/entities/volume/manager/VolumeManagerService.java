package cz.incad.nkp.inprove.entities.volume.manager;

import cz.incad.nkp.inprove.base.service.ManagerService;
import cz.incad.nkp.inprove.entities.exemplar.Exemplar;
import cz.incad.nkp.inprove.entities.exemplar.ExemplarRepo;
import cz.incad.nkp.inprove.entities.volume.Volume;
import cz.incad.nkp.inprove.entities.volume.VolumeRepo;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class VolumeManagerService implements ManagerService<Volume> {

    @Getter
    private final VolumeRepo repo;
}
