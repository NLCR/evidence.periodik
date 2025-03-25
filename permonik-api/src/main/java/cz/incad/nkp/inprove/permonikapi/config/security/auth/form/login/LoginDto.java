package cz.incad.nkp.inprove.permonikapi.config.security.auth.form.login;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class LoginDto {

    @NotNull
    private String username;

    @NotNull
    private String password;

}


