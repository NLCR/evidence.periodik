package cz.incad.nkp.inprove;

import com.fasterxml.jackson.databind.ObjectMapper;
import cz.incad.nkp.inprove.entities.user.old.UserService;
import cz.incad.nkp.inprove.entities.user.UserRepo;
import cz.incad.nkp.inprove.entities.user.search.UserSearchService;
import cz.incad.nkp.inprove.parsing.QueryParser;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.solr.core.SolrTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = Initializer.class)
@ActiveProfiles("test")
public abstract class TestBase {

    @Autowired
    protected UserService newUserService;

    @Autowired
    protected UserRepo userRepository;

    @Autowired
    protected QueryParser criteriaDtoParser;

    @Autowired
    protected UserSearchService userSearchService;

    @Autowired
    protected ObjectMapper objectMapper;

    @Autowired
    protected SolrTemplate solrTemplate;
}
