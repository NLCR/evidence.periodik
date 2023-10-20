package cz.incad.nkp.inprove.entities.user.search;

import cz.incad.nkp.inprove.base.service.BaseSearchService;
import cz.incad.nkp.inprove.base.service.BasicSearchService;
import cz.incad.nkp.inprove.entities.user.User;
import cz.incad.nkp.inprove.entities.user.UserRepo;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.solr.core.SolrTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
@Getter
public class UserSearchService extends BaseSearchService<User> {

    private final UserRepo repo;

    private final String solrCollection = User.COLLECTION;

    private final Class<User> clazz = User.class;
}
