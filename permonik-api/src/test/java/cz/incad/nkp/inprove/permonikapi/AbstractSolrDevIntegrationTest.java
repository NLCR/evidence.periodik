package cz.incad.nkp.inprove.permonikapi;

import org.springframework.test.context.ActiveProfiles;

@ActiveProfiles(value = {"test", "dev"}, inheritProfiles = false)
public abstract class AbstractSolrDevIntegrationTest extends AbstractSolrIntegrationTest {
}
