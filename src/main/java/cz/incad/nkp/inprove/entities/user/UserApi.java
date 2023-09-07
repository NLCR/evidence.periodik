package cz.incad.nkp.inprove.entities.user;

import cz.incad.nkp.inprove.entities.user.dto.ResetPasswordDto;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@Tag(name = "User API", description = "API for managing and retrieving users")
public class UserApi {

    private UserService userService;

    @PreAuthorize("hasAnyRole('ADMIN')")
    @GetMapping("/test")
    public String test() {
        return "lollollollollollollollollollollollollollollollollol";
    }

    @PostMapping("/login")
    public Map<String, Object> login(HttpServletRequest req, @RequestBody Map<String, Object> loginRequest) {
        String username = (String) loginRequest.get("username");
        String pwd = (String) loginRequest.get("password");

        Map<String, Object> map = new HashMap<>();
        if (username != null) {
            User user = userService.login(req, username, pwd);

            boolean isLoggedIn = user != null;
            map.put("logged", isLoggedIn);
            map.put("user", isLoggedIn ? user : "invalid user name or password");
        }

        return map;
    }

    @PostMapping("/logout")
    public Map<String, Object> logout(HttpServletRequest req) {
        return userService.logout(req);
    }

    @PostMapping("/resetpwd")
    public Map<String, Object> resetPwd(@RequestBody ResetPasswordDto resetPasswordDto) {
        return userService.resetHeslo(resetPasswordDto);
    }

    @PostMapping("/save")
    public User save(@RequestBody User user) {
        return userService.save(user);
    }

    @GetMapping("/info")
    public User getOne(@RequestParam String code) {
        return userService.getOne(code);
    }

    @GetMapping("/all")
    public Map<String, Object> getAll() {
        return userService.getAll();
    }

    @GetMapping("/check")
    public Map<String, Object> exists(@RequestParam String username) {
        return userService.exists(username);
    }

    @Autowired
    public void setUserService(UserService userService) {
        this.userService = userService;
    }
}
