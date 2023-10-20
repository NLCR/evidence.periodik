package cz.incad.nkp.inprove.entities.volume.search;

import cz.incad.nkp.inprove.base.service.BaseSearchService;
import cz.incad.nkp.inprove.base.service.BasicSearchService;
import cz.incad.nkp.inprove.entities.volume.Volume;
import cz.incad.nkp.inprove.entities.volume.VolumeRepo;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.solr.core.SolrTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
@Getter
public class VolumeSearchService extends BaseSearchService<Volume> {

    private final VolumeRepo repo;

    private final String solrCollection = Volume.COLLECTION;

    private final Class<Volume> clazz = Volume.class;
}
