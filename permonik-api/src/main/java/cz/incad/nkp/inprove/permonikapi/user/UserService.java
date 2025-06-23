package cz.incad.nkp.inprove.permonikapi.user;

import lombok.RequiredArgsConstructor;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.SolrServerException;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService implements UserDefinition {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private final SolrClient solrClient;


    public List<User> getUsers() throws SolrServerException, IOException {
        SolrQuery solrQuery = new SolrQuery("*:*");
        solrQuery.setRows(100000);
        solrQuery.setSort(USERNAME_FIELD, SolrQuery.ORDER.asc);

        QueryResponse response = solrClient.query(USER_CORE_NAME, solrQuery);

        return response.getBeans(User.class);

    }

    public void updateUser(String userId, User user) throws SolrServerException, IOException {
        SolrQuery solrQuery = new SolrQuery("*:*");
        solrQuery.addFilterQuery(ID_FIELD + ":\"" + userId + "\"");
        solrQuery.setRows(1);

        QueryResponse response = solrClient.query(USER_CORE_NAME, solrQuery);

        List<User> userList = response.getBeans(User.class);

        if (userList.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        try {
            solrClient.addBean(USER_CORE_NAME, user);
            solrClient.commit(USER_CORE_NAME);
            logger.info("User {} successfully updated", user.getEmail());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }


    }

    public User findUserByUserName(String userName) throws SolrServerException, IOException {
        SolrQuery solrQuery = new SolrQuery("*:*");
        // TODO: check if user is active
        solrQuery.addFilterQuery(USERNAME_FIELD + ":\"" + userName + "\"");
        solrQuery.setRows(1);

        QueryResponse response = solrClient.query(USER_CORE_NAME, solrQuery);

        List<User> userList = response.getBeans(User.class);

        if (userList.isEmpty()) {
            return null;
        }

        return userList.getFirst();
    }

    public User createUser(User user) throws SolrServerException, IOException {
        SolrQuery solrQuery = new SolrQuery("*:*");
        solrQuery.addFilterQuery(USERNAME_FIELD + ":\"" + user.getUserName() + "\"");
        solrQuery.setRows(1);

        QueryResponse response = solrClient.query(USER_CORE_NAME, solrQuery);

        List<User> userList = response.getBeans(User.class);

        if (!userList.isEmpty()) {
            throw new RuntimeException("User already exists");
        }

        try {
            solrClient.addBean(USER_CORE_NAME, user);
            solrClient.commit(USER_CORE_NAME);
            logger.info("User {} successfully created", user.getEmail());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        return user;
    }
}
