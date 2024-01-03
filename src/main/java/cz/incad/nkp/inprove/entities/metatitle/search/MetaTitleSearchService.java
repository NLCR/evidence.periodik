package cz.incad.nkp.inprove.entities.metatitle.search;

import cz.incad.nkp.inprove.base.service.BaseSearchService;
import cz.incad.nkp.inprove.base.service.BasicSearchService;
import cz.incad.nkp.inprove.entities.metatitle.MetaTitle;
import cz.incad.nkp.inprove.entities.metatitle.MetaTitleRepo;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.solr.core.SolrTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
@Getter
public class MetaTitleSearchService extends BaseSearchService<MetaTitle> {

    private final MetaTitleRepo repo;

    private final String solrCollection = MetaTitle.COLLECTION;

    private final Class<MetaTitle> clazz = MetaTitle.class;
}
