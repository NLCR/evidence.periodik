//package cz.incad.nkp.inprove;
//
//import com.fasterxml.jackson.core.JsonProcessingException;
//import cz.incad.nkp.inprove.entities.user.User;
//import cz.incad.nkp.inprove.utils.MD5;
//import org.json.JSONObject;
//import org.junit.Test;
//import org.mockito.Mock;
//
//import javax.servlet.http.HttpServletRequest;
//import javax.servlet.http.HttpSession;
//
//import java.util.Map;
//
//import static org.assertj.core.api.Assertions.assertThat;
//import static org.mockito.Mockito.mock;
//import static org.mockito.Mockito.when;
//
//public class UserServiceTest extends TestBase {
//
//    @Mock
//    private HttpServletRequest httpServletRequest;
//
//    @Test
//    public void login() {
//        User newUser = new User();
//        newUser.setId("id");
//        newUser.setUsername("lodyha");
//        newUser.setEmail("lodyha@lodyha.cz");
//        userRepository.save(newUser);
////
////        JSONObject exists = UsersService.login(newUser.getUsername());
////
////        Map<String, Object> existsNew = newUserService.login(newUser.getUsername());
//    }
//
//    @Test
//    public void logout() {
//        when(httpServletRequest.getSession()).thenReturn(mock(HttpSession.class));
//        newUserService.logout(httpServletRequest);
//        assertThat(5).isEqualTo(5);
//    }
//
//    @Test
//    public void resetPwd() {
//        User newUser = new User();
//        newUser.setId("id");
//        newUser.setUsername("lodyha");
//        newUser.setEmail("lodyha@lodyha.cz");
//        userRepository.save(newUser);
//
//
//
//
//    }
//
//    @Test
//    public void save() {
//        JSONObject newUser1 = new JSONObject();
//        newUser1.put("nazev", "lodyha");
//        newUser1.put("heslo", "heslo");
//        newUser1.put("email", "lodyha@lodyha.cz");
//
//        UsersService.add(newUser1);
//        JSONObject one = UsersService.getOne(MD5.generate(
//                new String[]{newUser1.getString("nazev"), newUser1.getString("email")}), true);
//
//        one.put("email", "novalodyha@lodyha.cz");
//
//        UsersService.save(one);
//        one = UsersService.getOne(MD5.generate(
//                new String[]{newUser1.getString("nazev"), newUser1.getString("email")}), true);
//
//        User newUser2 = new User();
//        newUser2.setNazev("lodyha");
//        newUser2.setHeslo("heslo");
//        newUser2.setEmail("lodyha@lodyha.cz");
//
//        User two = newUserService.save(newUser2);
//
//        newUser2.setEmail("novalodyha@lodyha.cz");
//
//        two = newUserService.save(newUser2);
//
//        assertThat(one.get("id")).isNotNull();
//        assertThat(two.getId()).isNotNull();
//        assertThat(one.get("email")).isEqualTo("novalodyha@lodyha.cz");
//        assertThat(two.getEmail()).isEqualTo("novalodyha@lodyha.cz");
//    }
//
//    @Test
//    public void getOne() throws JsonProcessingException {
//        User newUser = new User();
//        newUser.setId("id");
//        newUser.setUsername("lodyha");
//        newUser.setEmail("lodyha@lodyha.cz");
//        userRepository.save(newUser);
//
//        JSONObject one = UsersService.getOne(newUser.getId(), false);
//        User oneNew = newUserService.getOne(newUser.getId());
//
//        assertThat(objectMapper.writeValueAsString(one.toString())).isEqualTo(
//                objectMapper.writeValueAsString(oneNew));
//    }
//
//    @Test
//    public void getAll() throws JsonProcessingException {
//        JSONObject all = UsersService.getAll();
//        Map<String, Object> newAll = newUserService.getAll();
//
//        assertThat(objectMapper.writeValueAsString(all.toString())).isEqualTo(
//                objectMapper.writeValueAsString(newAll));
//    }
//
//    @Test
//    public void exists() {
//        User newUser = new User();
//        newUser.setId("id");
//        newUser.setUsername("lodyha");
//        userRepository.save(newUser);
//
//        JSONObject exists = UsersService.exists(newUser.getUsername());
//        assertThat(exists.get("exists")).isEqualTo(true);
//        exists = UsersService.exists("neexistuje");
//        assertThat(exists.get("exists")).isEqualTo(false);
//
//        Map<String, Object> existsNew = newUserService.exists(newUser.getUsername());
//        assertThat(existsNew).containsEntry("exists", true);
//        existsNew = newUserService.exists("neexistuje");
//        assertThat(existsNew).containsEntry("exists", false);
//    }
//}