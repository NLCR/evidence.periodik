package cz.incad.nkp.inprove.permonikapi.user;

import cz.incad.nkp.inprove.permonikapi.AbstractSolrIntegrationTest;
import cz.incad.nkp.inprove.permonikapi.support.SolrTestSupport;
import org.apache.solr.client.solrj.SolrClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class UserServiceTest extends AbstractSolrIntegrationTest {

    @Autowired
    UserService userService;

    @Autowired
    SolrClient solrClient;

    private static User user(String username, String email, String role) {
        return user(username, email, role, "First", "Last");
    }

    private static User user(String username, String email, String role, String firstName, String lastName) {
        return User.builder()
            .id(UUID.randomUUID().toString())
            .email(email)
            .userName(username)
            .firstName(firstName)
            .lastName(lastName)
            .role(role)
            .active(true)
            .owners(List.of())
            .password("secret")
            .build();
    }

    @BeforeEach
    void setUp() throws Exception {
        SolrTestSupport.clearCores(solrClient, UserDefinition.USER_CORE_NAME);
    }

    @Test
        // Verifies user listing uses deterministic firstName ordering.
    void getUsers_returnsAllSorted() throws Exception {
        userService.createUser(user("z-user", "z@example.com", "user", "Zed", "Last"));
        userService.createUser(user("a-user", "a@example.com", "user", "Adam", "Last"));

        List<User> users = userService.getUsers();

        assertThat(users).hasSize(2);
        assertThat(users).extracting(User::getFirstName).containsExactly("Adam", "Zed");
    }

    @Test
        // Verifies update operation persists changed user fields.
    void updateUser_updatesPersistedUser() throws Exception {
        User created = userService.createUser(user("john", "john@example.com", "user"));
        created.setFirstName("Updated");
        created.setLastName("Name");
        created.setRole("admin");

        userService.updateUser(created.getId(), created);

        User result = userService.findUserByUserName("john");
        assertThat(result).isNotNull();
        assertThat(result.getFirstName()).isEqualTo("Updated");
        assertThat(result.getRole()).isEqualTo("admin");
    }

    @Test
        // Verifies update fails with not-found for unknown user id.
    void updateUser_throwsWhenNotFound() {
        String id = UUID.randomUUID().toString();
        User user = user("ghost", "ghost@example.com", "user");
        user.setId(id);

        assertThatThrownBy(() -> userService.updateUser(id, user))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("not found");
    }
}
