package cz.incad.nkp.inprove.entities.metatitle.manager;

import cz.incad.nkp.inprove.base.service.ManagerService;
import cz.incad.nkp.inprove.entities.exemplar.Exemplar;
import cz.incad.nkp.inprove.entities.exemplar.ExemplarRepo;
import cz.incad.nkp.inprove.entities.exemplar.search.ExemplarSearchService;
import cz.incad.nkp.inprove.entities.metatitle.MetaTitle;
import cz.incad.nkp.inprove.entities.metatitle.MetaTitleRepo;
import cz.incad.nkp.inprove.entities.volume.Volume;
import cz.incad.nkp.inprove.entities.volume.VolumeRepo;
import cz.incad.nkp.inprove.entities.volume.search.VolumeSearchService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.solr.core.query.Criteria;
import org.springframework.data.solr.core.query.Field;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class MetaTitleManagerService implements ManagerService<MetaTitle> {

    @Getter
    private final MetaTitleRepo repo;

    private final ExemplarSearchService exemplarSearchService;

    private final ExemplarRepo exemplarRepo;

    private final VolumeSearchService volumeSearchService;

    private final VolumeRepo volumeRepo;

    @Override
    public void deleteById(String id) {
        List<Exemplar> exemplars = exemplarSearchService.findAllByCriteriaQuery(Criteria.where("id_titul").is(id));
        exemplarRepo.deleteAll(exemplars);

        List<Volume> volumes = volumeSearchService.findAllByCriteriaQuery(Criteria.where("id_titul").is(id));
        volumeRepo.deleteAll(volumes);

        ManagerService.super.deleteById(id);
    }

    @Override
    public void deleteAllById(List<String> entities) {
        ManagerService.super.deleteAllById(entities);
    }
}
