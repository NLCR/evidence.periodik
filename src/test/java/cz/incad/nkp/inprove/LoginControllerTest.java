package cz.incad.nkp.inprove;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LoginControllerTest {

    @Mock
    private HttpServletRequest httpServletRequest;

    @Test
    void logout() {
        when(httpServletRequest.getSession()).thenReturn(mock(HttpSession.class));
        LoginController.logout(httpServletRequest);
        assertThat(5).isEqualTo(5);
    }
}