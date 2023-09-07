package cz.incad.nkp.inprove;

import com.fasterxml.jackson.databind.ObjectMapper;
import cz.incad.nkp.inprove.entities.user.UserService;
import cz.incad.nkp.inprove.entities.user.UserRepository;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = Application.class)
@ActiveProfiles("test")
public abstract class TestBase {

    @Autowired
    protected UserService newUserService;

    @Autowired
    protected UserRepository userRepository;

    @Autowired
    protected ObjectMapper objectMapper;
}
