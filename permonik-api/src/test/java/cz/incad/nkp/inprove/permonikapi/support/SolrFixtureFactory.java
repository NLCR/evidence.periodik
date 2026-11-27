package cz.incad.nkp.inprove.permonikapi.support;

import cz.incad.nkp.inprove.permonikapi.audit.AuditableDefinition;
import cz.incad.nkp.inprove.permonikapi.common.mutationMark.MutationMarkTypeEnum;
import cz.incad.nkp.inprove.permonikapi.edition.model.EditionDefinition;
import cz.incad.nkp.inprove.permonikapi.metaTitle.MetaTitleDefinition;
import cz.incad.nkp.inprove.permonikapi.mutation.model.MutationDefinition;
import cz.incad.nkp.inprove.permonikapi.owner.OwnerDefinition;
import cz.incad.nkp.inprove.permonikapi.specimen.SpecimenNaturalSortKey;
import cz.incad.nkp.inprove.permonikapi.specimen.model.SpecimenDefinition;
import cz.incad.nkp.inprove.permonikapi.volume.model.VolumeDefinition;
import java.util.Date;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.common.SolrInputDocument;

/**
 * Centralized source of valid Solr test documents. Methods intentionally provide "minimum valid"
 * docs for individual test scenarios.
 */
public final class SolrFixtureFactory {

    /** Shared reference dataset used by volume/specimen integration tests. */
    public static final class ReferenceData {
        public static final String META_TITLE_ID = "00000000-0000-0000-0000-000000000001";
        public static final String OWNER_ID = "00000000-0000-0000-0000-000000000002";
        public static final String MUTATION_ID = "00000000-0000-0000-0000-000000000003";
        public static final String EDITION_ID = "00000000-0000-0000-0000-000000000004";

        public static final String META_TITLE_NAME = "Meta Title";
        public static final String OWNER_NAME = "Owner Name";
        public static final String OWNER_SHORTHAND = "OWN";
        public static final String OWNER_SIGLA = "OWN001";
        public static final String MUTATION_NAME_CS = "Mutation CS";
        public static final String MUTATION_NAME_SK = "Mutation SK";
        public static final String MUTATION_NAME_EN = "Mutation EN";
        public static final String EDITION_NAME_CS = "Edition CS";
        public static final String EDITION_NAME_SK = "Edition SK";
        public static final String EDITION_NAME_EN = "Edition EN";

        private ReferenceData() {}
    }

    public static final String LISTING_META_TITLE_ID = "meta-1";

    private SolrFixtureFactory() {}

    public static SolrInputDocument metaTitleDoc(String id, String name, boolean isPublic) {
        Date now = new Date();
        SolrInputDocument doc = new SolrInputDocument();
        doc.addField(MetaTitleDefinition.ID_FIELD, id);
        doc.addField(MetaTitleDefinition.NAME_FIELD, name);
        doc.addField(MetaTitleDefinition.IS_PUBLIC_FIELD, isPublic);
        doc.addField(AuditableDefinition.CREATED_FIELD, now);
        doc.addField(AuditableDefinition.CREATED_BY_FIELD, TestSecuritySupport.TEST_USER_ID);
        return doc;
    }

    public static SolrInputDocument ownerDoc(
            String id, String name, String shorthand, String sigla) {
        Date now = new Date();
        SolrInputDocument doc = new SolrInputDocument();
        doc.addField(OwnerDefinition.ID_FIELD, id);
        doc.addField(OwnerDefinition.NAME_FIELD, name);
        doc.addField(OwnerDefinition.SHORTHAND_FIELD, shorthand);
        doc.addField(OwnerDefinition.SIGLA_FIELD, sigla);
        doc.addField(AuditableDefinition.CREATED_FIELD, now);
        doc.addField(AuditableDefinition.CREATED_BY_FIELD, TestSecuritySupport.TEST_USER_ID);
        return doc;
    }

    public static SolrInputDocument mutationDoc(String id, String cs, String sk, String en) {
        Date now = new Date();
        SolrInputDocument doc = new SolrInputDocument();
        doc.addField(MutationDefinition.ID_FIELD, id);
        doc.addField(MutationDefinition.NAME_CS_FIELD, cs);
        doc.addField(MutationDefinition.NAME_SK_FIELD, sk);
        doc.addField(MutationDefinition.NAME_EN_FIELD, en);
        doc.addField(AuditableDefinition.CREATED_FIELD, now);
        doc.addField(AuditableDefinition.CREATED_BY_FIELD, TestSecuritySupport.TEST_USER_ID);
        return doc;
    }

    public static SolrInputDocument editionDoc(
            String id,
            String cs,
            String sk,
            String en,
            boolean isDefault,
            boolean isAttachment,
            boolean isPeriodicAttachment) {
        Date now = new Date();
        SolrInputDocument doc = new SolrInputDocument();
        doc.addField(EditionDefinition.ID_FIELD, id);
        doc.addField(EditionDefinition.NAME_CS_FIELD, cs);
        doc.addField(EditionDefinition.NAME_SK_FIELD, sk);
        doc.addField(EditionDefinition.NAME_EN_FIELD, en);
        doc.addField(EditionDefinition.IS_DEFAULT_FIELD, isDefault);
        doc.addField(EditionDefinition.IS_ATTACHMENT_FIELD, isAttachment);
        doc.addField(EditionDefinition.IS_PERIODIC_ATTACHMENT_FIELD, isPeriodicAttachment);
        doc.addField(AuditableDefinition.CREATED_FIELD, now);
        doc.addField(AuditableDefinition.CREATED_BY_FIELD, TestSecuritySupport.TEST_USER_ID);
        return doc;
    }

    public static SolrInputDocument volumeForOwner(
            String id, String ownerId, String ownerName, String shorthand, String sigla) {
        return baseVolume(
                id,
                new OwnerReference(ownerId, ownerName, shorthand, sigla),
                new LocalizedReference("mutation-id", "Mutation CS", "Mutation SK", "Mutation EN"),
                new TitleReference("metatitle-id", "Meta title"));
    }

    public static SolrInputDocument volumeForMutation(
            String id, String mutationId, String cs, String sk, String en) {
        return baseVolume(
                id,
                new OwnerReference("owner-id", "Owner", "OWN", "OWN001"),
                new LocalizedReference(mutationId, cs, sk, en),
                new TitleReference("metatitle-id", "Meta title"));
    }

    public static SolrInputDocument volumeForMetaTitle(
            String id, String metaTitleId, String metaTitleName) {
        return baseVolume(
                id,
                new OwnerReference("owner-id", "Owner", "OWN", "OWN001"),
                new LocalizedReference("mutation-id", "Mutation CS", "Mutation SK", "Mutation EN"),
                new TitleReference(metaTitleId, metaTitleName));
    }

    public static SolrInputDocument specimenForOwner(
            String id, String ownerId, String ownerName, String shorthand, String sigla) {
        return baseSpecimen(
                id,
                new TitleReference("meta-id", "Meta"),
                "volume-id",
                new OwnerReference(ownerId, ownerName, shorthand, sigla),
                new LocalizedReference("edition-id", "Edition CS", "Edition SK", "Edition EN"),
                new LocalizedReference("mutation-id", "Mutation CS", "Mutation SK", "Mutation EN"),
                new SpecimenContent(
                        new Date(), "Name", "Sub", true, MutationMarkTypeEnum.UNMARKED));
    }

    public static SolrInputDocument specimenForMutation(
            String id, String mutationId, String cs, String sk, String en) {
        return baseSpecimen(
                id,
                new TitleReference("meta-id", "Meta"),
                "volume-id",
                new OwnerReference("owner-id", "Owner", "OWN", "OWN001"),
                new LocalizedReference("edition-id", "Edition CS", "Edition SK", "Edition EN"),
                new LocalizedReference(mutationId, cs, sk, en),
                new SpecimenContent(
                        new Date(), "Name", "Sub", true, MutationMarkTypeEnum.UNMARKED));
    }

    public static SolrInputDocument specimenForMetaTitle(
            String id, String metaTitleId, String metaTitleName) {
        return baseSpecimen(
                id,
                new TitleReference(metaTitleId, metaTitleName),
                "volume-id",
                new OwnerReference("owner-id", "Owner", "OWN", "OWN001"),
                new LocalizedReference("edition-id", "Edition CS", "Edition SK", "Edition EN"),
                new LocalizedReference("mutation-id", "Mutation CS", "Mutation SK", "Mutation EN"),
                new SpecimenContent(
                        new Date(), "Name", "Sub", true, MutationMarkTypeEnum.UNMARKED));
    }

    public static SolrInputDocument specimenForEdition(
            String id, String editionId, String cs, String sk, String en) {
        return baseSpecimen(
                id,
                new TitleReference("meta-id", "Meta"),
                "volume-id",
                new OwnerReference("owner-id", "Owner", "OWN", "OWN001"),
                new LocalizedReference(editionId, cs, sk, en),
                new LocalizedReference("mutation-id", "Mutation CS", "Mutation SK", "Mutation EN"),
                new SpecimenContent(
                        new Date(), "Name", "Sub", true, MutationMarkTypeEnum.UNMARKED));
    }

    public static SolrInputDocument specimenForListing(
            String id,
            String metaTitleId,
            Date publicationDate,
            String name,
            String subName,
            boolean numExists) {
        return baseSpecimen(
                id,
                new TitleReference(metaTitleId, "Meta"),
                "volume-1",
                new OwnerReference("owner-1", "Owner", "OWN", "OWN001"),
                new LocalizedReference("edition-1", "Edition CS", "Edition SK", "Edition EN"),
                new LocalizedReference("mutation-1", "Mutation CS", "Mutation SK", "Mutation EN"),
                new SpecimenContent(
                        publicationDate, name, subName, numExists, MutationMarkTypeEnum.UNMARKED));
    }

    /** Seeds all reference cores required by volume/specimen service flows. */
    public static void seedDefaultReferenceData(SolrClient solrClient) throws Exception {
        solrClient.add(
                MetaTitleDefinition.META_TITLE_CORE_NAME,
                metaTitleDoc(ReferenceData.META_TITLE_ID, ReferenceData.META_TITLE_NAME, true));
        solrClient.add(
                OwnerDefinition.OWNER_CORE_NAME,
                ownerDoc(
                        ReferenceData.OWNER_ID,
                        ReferenceData.OWNER_NAME,
                        ReferenceData.OWNER_SHORTHAND,
                        ReferenceData.OWNER_SIGLA));
        solrClient.add(
                MutationDefinition.MUTATION_CORE_NAME,
                mutationDoc(
                        ReferenceData.MUTATION_ID,
                        ReferenceData.MUTATION_NAME_CS,
                        ReferenceData.MUTATION_NAME_SK,
                        ReferenceData.MUTATION_NAME_EN));
        solrClient.add(
                EditionDefinition.EDITION_CORE_NAME,
                editionDoc(
                        ReferenceData.EDITION_ID,
                        ReferenceData.EDITION_NAME_CS,
                        ReferenceData.EDITION_NAME_SK,
                        ReferenceData.EDITION_NAME_EN,
                        false,
                        false,
                        false));

        solrClient.commit(MetaTitleDefinition.META_TITLE_CORE_NAME);
        solrClient.commit(OwnerDefinition.OWNER_CORE_NAME);
        solrClient.commit(MutationDefinition.MUTATION_CORE_NAME);
        solrClient.commit(EditionDefinition.EDITION_CORE_NAME);
    }

    private static SolrInputDocument baseVolume(
            String id, OwnerReference owner, LocalizedReference mutation, TitleReference title) {
        Date now = new Date();
        SolrInputDocument doc = new SolrInputDocument();
        doc.addField(VolumeDefinition.ID_FIELD, id);
        doc.addField(VolumeDefinition.BAR_CODE_FIELD, "BAR-" + id.substring(0, 8));
        doc.addField(VolumeDefinition.DATE_FROM_FIELD, now);
        doc.addField(VolumeDefinition.DATE_TO_FIELD, now);
        doc.addField(VolumeDefinition.META_TITLE_ID_FIELD, title.id());
        doc.addField(VolumeDefinition.META_TITLE_NAME_FIELD, title.name());
        doc.addField(VolumeDefinition.MUTATION_ID_FIELD, mutation.id());
        doc.addField(VolumeDefinition.MUTATION_CS_NAME_FIELD, mutation.cs());
        doc.addField(VolumeDefinition.MUTATION_SK_NAME_FIELD, mutation.sk());
        doc.addField(VolumeDefinition.MUTATION_EN_NAME_FIELD, mutation.en());
        doc.addField(VolumeDefinition.OWNER_ID_FIELD, owner.id());
        doc.addField(VolumeDefinition.OWNER_NAME_FIELD, owner.name());
        doc.addField(VolumeDefinition.OWNER_SHORTHAND_FIELD, owner.shorthand());
        doc.addField(VolumeDefinition.OWNER_SIGLA_FIELD, owner.sigla());
        doc.addField(VolumeDefinition.PERIODICITY_FIELD, "[]");
        doc.addField(VolumeDefinition.FIRST_NUMBER_FIELD, 1);
        doc.addField(VolumeDefinition.LAST_NUMBER_FIELD, 1);
        doc.addField(VolumeDefinition.ATTACHMENTS_SORT_FIELD, "NONE");
        doc.addField(VolumeDefinition.YEAR_FIELD, 2026);
        doc.addField(
                VolumeDefinition.MUTATION_MARK_TYPE_FIELD, MutationMarkTypeEnum.UNMARKED.name());
        doc.addField(AuditableDefinition.CREATED_FIELD, now);
        doc.addField(AuditableDefinition.CREATED_BY_FIELD, TestSecuritySupport.TEST_USER_ID);
        return doc;
    }

    private static SolrInputDocument baseSpecimen(
            String id,
            TitleReference title,
            String volumeId,
            OwnerReference owner,
            LocalizedReference edition,
            LocalizedReference mutation,
            SpecimenContent content) {
        Date now = new Date();
        SolrInputDocument doc = new SolrInputDocument();
        doc.addField(SpecimenDefinition.ID_FIELD, id);
        doc.addField(SpecimenDefinition.META_TITLE_ID_FIELD, title.id());
        doc.addField(SpecimenDefinition.META_TITLE_NAME_FIELD, title.name());
        doc.addField(SpecimenDefinition.VOLUME_ID_FIELD, volumeId);
        doc.addField(SpecimenDefinition.BAR_CODE_FIELD, "BAR-" + id.substring(0, 8));
        doc.addField(SpecimenDefinition.NUM_EXISTS_FIELD, content.numExists());
        doc.addField(SpecimenDefinition.NUM_MISSING_FIELD, !content.numExists());
        doc.addField(SpecimenDefinition.OWNER_ID_FIELD, owner.id());
        doc.addField(SpecimenDefinition.OWNER_NAME_FIELD, owner.name());
        doc.addField(SpecimenDefinition.OWNER_SHORTHAND_FIELD, owner.shorthand());
        doc.addField(SpecimenDefinition.OWNER_SIGLA_FIELD, owner.sigla());
        doc.addField(SpecimenDefinition.NAME_FIELD, content.name());
        doc.addField(SpecimenDefinition.SUB_NAME_FIELD, content.subName());
        doc.addField(SpecimenDefinition.EDITION_ID_FIELD, edition.id());
        doc.addField(SpecimenDefinition.EDITION_CS_NAME_FIELD, edition.cs());
        doc.addField(SpecimenDefinition.EDITION_SK_NAME_FIELD, edition.sk());
        doc.addField(SpecimenDefinition.EDITION_EN_NAME_FIELD, edition.en());
        doc.addField(SpecimenDefinition.MUTATION_ID_FIELD, mutation.id());
        doc.addField(SpecimenDefinition.MUTATION_CS_NAME_FIELD, mutation.cs());
        doc.addField(SpecimenDefinition.MUTATION_SK_NAME_FIELD, mutation.sk());
        doc.addField(SpecimenDefinition.MUTATION_EN_NAME_FIELD, mutation.en());
        doc.addField(
                SpecimenDefinition.MUTATION_MARK_TYPE_FIELD, content.mutationMarkType().name());
        doc.addField(SpecimenDefinition.PUBLICATION_DATE_FIELD, content.publicationDate());
        String specimenNumber = "1";
        doc.addField(SpecimenDefinition.NUMBER_FIELD, specimenNumber);
        doc.addField(
                SpecimenDefinition.NUMBER_SORT_KEY_FIELD,
                SpecimenNaturalSortKey.from(specimenNumber));
        doc.addField(SpecimenDefinition.PAGES_COUNT_FIELD, 8);
        doc.addField(SpecimenDefinition.IS_ATTACHMENT_FIELD, false);
        doc.addField(AuditableDefinition.CREATED_FIELD, now);
        doc.addField(AuditableDefinition.CREATED_BY_FIELD, TestSecuritySupport.TEST_USER_ID);
        return doc;
    }

    private record OwnerReference(String id, String name, String shorthand, String sigla) {}

    private record LocalizedReference(String id, String cs, String sk, String en) {}

    private record TitleReference(String id, String name) {}

    private record SpecimenContent(
            Date publicationDate,
            String name,
            String subName,
            boolean numExists,
            MutationMarkTypeEnum mutationMarkType) {}
}
