package cz.incad.nkp.inprove.permonikapi.support;

import org.apache.solr.client.solrj.SolrClient;

/**
 * Shared helper for test data cleanup in Solr cores.
 */
public final class SolrTestSupport {

    private SolrTestSupport() {
    }

    public static void clearCores(SolrClient solrClient, String... coreNames) throws Exception {
        for (String coreName : coreNames) {
            clearCore(solrClient, coreName);
        }
    }

    public static void clearCore(SolrClient solrClient, String coreName) throws Exception {
        solrClient.deleteByQuery(coreName, "*:*");
        solrClient.commit(coreName);
    }
}
