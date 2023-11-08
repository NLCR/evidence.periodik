package cz.incad.nkp.inprove.entities.user.manager;

import cz.incad.nkp.inprove.base.BaseEntity;
import cz.incad.nkp.inprove.base.service.ManagerService;
import cz.incad.nkp.inprove.entities.user.User;
import cz.incad.nkp.inprove.entities.user.UserRepo;
import cz.incad.nkp.inprove.entities.user.dto.ResetPasswordDto;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import javax.ws.rs.ForbiddenException;
import javax.ws.rs.NotFoundException;
import java.util.*;
import java.util.stream.Collectors;

import static cz.incad.nkp.inprove.security.user.UserProducer.getCurrentUser;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserManagerService implements ManagerService<User> {

    @Getter
    private final UserRepo repo;

    public void resetPassword(ResetPasswordDto resetPasswordDto) {
        User currentUser = getCurrentUser();

        if (!DigestUtils.md5Hex(resetPasswordDto.getOldheslo()).equals(currentUser.getHeslo())) {
            throw new ForbiddenException("Old password does not correspond to actual password of user");
        }

        currentUser.setHeslo(DigestUtils.md5Hex(resetPasswordDto.getNewheslo()));
        repo.save(currentUser);
    }

    public void changePassword(String id, String newPassword) {
        User user = repo.findById(id).orElseThrow(() -> new NotFoundException("User with id '" + id + "' not found"));
        user.setHeslo(DigestUtils.md5Hex(newPassword));
        repo.save(user);
    }

    @Override
    public void save(String id, User entity) {
        repo.findById(id).ifPresent(u -> entity.setHeslo(u.getHeslo()));

        ManagerService.super.save(id, entity);
    }

    @Override
    public void saveAll(List<User> entities) {
        List<User> saved = ((Page<User>) repo.findAllById(entities.stream()
                .map(BaseEntity::getId)
                .collect(Collectors.toList()))).getContent();

        saved.forEach(s -> entities.stream()
                .filter(e -> e.getId().equals(s.getId()))
                .forEach(e -> e.setHeslo(s.getHeslo())));

        ManagerService.super.saveAll(entities);
    }
}
