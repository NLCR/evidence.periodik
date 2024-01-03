package cz.incad.nkp.inprove.base;

import com.fasterxml.jackson.databind.ObjectMapper;
import cz.incad.nkp.inprove.Initializer;
import cz.incad.nkp.inprove.entities.exemplar.Exemplar;
import cz.incad.nkp.inprove.entities.exemplar.ExemplarRepo;
import cz.incad.nkp.inprove.entities.user.User;
import cz.incad.nkp.inprove.entities.user.old.UserService;
import cz.incad.nkp.inprove.entities.user.UserRepo;
import cz.incad.nkp.inprove.entities.user.search.UserSearchService;
import cz.incad.nkp.inprove.parser.QueryParser;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.solr.core.SolrTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.Date;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = Initializer.class)
@ActiveProfiles("test")
public abstract class TestBase {

    @Autowired
    protected UserService newUserService;

    @Autowired
    protected UserSearchService userSearchService;

    @Autowired
    protected UserRepo userRepo;

    @Autowired
    protected QueryParser criteriaDtoParser;

    @Autowired
    protected ExemplarRepo exemplarRepo;

    @Autowired
    protected ObjectMapper objectMapper;

    @Autowired
    protected SolrTemplate solrTemplate;

    protected User getSamplePerson() {
        User user = User.builder()
                .id("testuser")
                .email("test@mail.com")
                .username("testuser")
                .nazev("Testing User")
                .heslo("password")
                .role("ADMIN")
                .poznamka("Some note about user")
                .owner("NKP")
                .indextime(new Date())
                .active(true)
                .build();

        return userRepo.save(user);
    }

    protected Exemplar getSampleExemplar() {
        Exemplar exemplar = Exemplar.builder()
                .id("testexemplar")
                .nazev("testexemplar")
                .poznamka("Some note about exemplar")
                .pocet_stran(5)
                .id_issue("id_issue")
                .id_titul("id_titul")
                .build();

        return exemplarRepo.save(exemplar);
    }
}
