package cz.incad.nkp.inprove;

import cz.incad.nkp.inprove.entities.user.User;
import cz.incad.nkp.inprove.parsing.QueryDto;
import cz.incad.nkp.inprove.parsing.criteriadto.string.CriteriaStringDto;
import cz.incad.nkp.inprove.parsing.criteriadto.string.CriteriaStringOperation;
import org.junit.Test;
import org.mockito.Mock;
import org.springframework.data.domain.Page;
import org.springframework.data.solr.core.query.Criteria;
import org.springframework.data.solr.core.query.SimpleQuery;

import javax.servlet.http.HttpServletRequest;
import java.util.Arrays;
import java.util.Date;

public class CriteriaDtoParserTest extends TestBase {

    @Mock
    private HttpServletRequest httpServletRequest;

    @Test
    public void parse() {
        User user = User.builder()
                .email("mail@mail.cz")
                .username("stastny")
                .nazev("Petr Štastný")
                .heslo("heslo")
                .role("ADMIN")
                .poznamka("poznamka o uzivateli")
                .owner("NKP")
                .indextime(new Date())
                .active(true)
                .build();



        CriteriaStringDto criteriaStringDto = new CriteriaStringDto("email", CriteriaStringOperation.CONTAINS,
                Arrays.asList("h"));
        QueryDto queryDto = new QueryDto(Arrays.asList(criteriaStringDto));

        Criteria criteria = criteriaDtoParser.parse(queryDto);

        Page<User> result = solrTemplate.query(User.COLLECTION, new SimpleQuery(criteria), User.class);


        System.out.println(result.getTotalElements());
    }

}