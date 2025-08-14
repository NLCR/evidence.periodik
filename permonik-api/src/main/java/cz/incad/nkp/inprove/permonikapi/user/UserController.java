package cz.incad.nkp.inprove.permonikapi.user;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.apache.solr.client.solrj.SolrServerException;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@Tag(name = "User API", description = "API for managing users")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    @Operation(summary = "Lists all users")
    @GetMapping("/list/all")
    public List<User> getUsers() throws SolrServerException, IOException {
        return userService.getUsers();
    }

    @Operation(summary = "Updates user")
    @PutMapping("/{id}")
    public void updateUser(@PathVariable String id, @RequestBody User user) throws SolrServerException, IOException {
        userService.updateUser(id, user);
    }

}
