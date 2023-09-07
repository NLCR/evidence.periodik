package cz.incad.nkp.inprove.entities.user;

import org.springframework.data.solr.repository.SolrCrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends SolrCrudRepository<User, String> {

    User findByUsernameIgnoreCase(String username);
}
