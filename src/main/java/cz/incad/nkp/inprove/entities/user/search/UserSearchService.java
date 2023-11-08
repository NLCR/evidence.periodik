package cz.incad.nkp.inprove.entities.user.search;

import cz.incad.nkp.inprove.base.service.BaseSearchService;
import cz.incad.nkp.inprove.entities.user.User;
import cz.incad.nkp.inprove.entities.user.UserRepo;
import cz.incad.nkp.inprove.security.user.UserProducer;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
@Getter
public class UserSearchService extends BaseSearchService<User> {

    private final UserRepo repo;

    private final String solrCollection = User.COLLECTION;

    private final Class<User> clazz = User.class;

    public User getCurrentUser() {
        return UserProducer.getCurrentUser();
    }
}
