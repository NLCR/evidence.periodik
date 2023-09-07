package cz.incad.nkp.inprove.entities.user;

import cz.incad.nkp.inprove.entities.user.dto.ResetPasswordDto;
import cz.incad.nkp.inprove.utils.MD5;

import java.time.Duration;
import java.util.*;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.ForbiddenException;

import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.solr.core.query.result.SolrResultPage;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class UserService {

    private UserRepository userRepository;

    private ModelMapper modelMapper;

    public User login(HttpServletRequest req, String username, String pwd) {
        User user = userRepository.findByUsernameIgnoreCase(username);

        if (!user.getHeslo().equals(pwd)) {
            throw new ForbiddenException("Invalid password");
        }

        req.getSession().setAttribute("login", user);
        return user;
    }

    public Map<String, Object> logout(HttpServletRequest req) {
        req.getSession().invalidate();
        return Collections.singletonMap("msg", "logged out");
    }

    public Map<String, Object> resetHeslo(ResetPasswordDto resetPasswordDto) {
        User orig = getOne(resetPasswordDto.getId());
        if (resetPasswordDto.getOldheslo().equals(orig.getHeslo())) {
            orig.setHeslo(resetPasswordDto.getNewheslo());
            User saved = userRepository.save(orig);
            return modelMapper.map(saved, JSONObject.class).toMap();
        } else {
            return Collections.singletonMap("error", "heslo.nespravne_heslo");
        }
    }

    public User save(User user) {
        if (userRepository.existsById(user.getId())) {
            User orig = getOne(user.getId());
            user.setHeslo(orig.getHeslo());
        } else {
            if (user.getHeslo() != null && user.getHeslo().length() != 32) {
                user.setHeslo(MD5.generate(user.getHeslo()));
            }
        }

        return userRepository.save(user, Duration.ZERO);
    }

    public User getOne(String id) {
        return userRepository.findById(id).orElse(null);
    }

    public Map<String, Object> getAll() {
        Sort sortByNazev = Sort.by(Sort.Direction.ASC, "nazev");
        SolrResultPage<User> users = (SolrResultPage<User>) userRepository.findAll(sortByNazev);

        Map<String, Object> mapToMatchOldFormat = new HashMap<>();
        mapToMatchOldFormat.put("docs", users.toList());
        mapToMatchOldFormat.put("numFound", users.getSize());
        return mapToMatchOldFormat;
    }

    public Map<String, Object> exists(String username) {
        User newUser = userRepository.findByUsernameIgnoreCase(username);
        return Collections.singletonMap("exists", newUser != null);
    }

    @Autowired
    public void setUserRepository(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Autowired
    public void setModelMapper(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }
}
