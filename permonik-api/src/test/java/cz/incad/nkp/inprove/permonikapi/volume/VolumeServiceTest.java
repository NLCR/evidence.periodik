package cz.incad.nkp.inprove.permonikapi.volume;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import cz.incad.nkp.inprove.permonikapi.AbstractSolrIntegrationTest;
import cz.incad.nkp.inprove.permonikapi.audit.AuditableDefinition;
import cz.incad.nkp.inprove.permonikapi.edition.model.EditionDefinition;
import cz.incad.nkp.inprove.permonikapi.metaTitle.MetaTitleDefinition;
import cz.incad.nkp.inprove.permonikapi.mutation.model.MutationDefinition;
import cz.incad.nkp.inprove.permonikapi.owner.OwnerDefinition;
import cz.incad.nkp.inprove.permonikapi.specimen.SpecimenService;
import cz.incad.nkp.inprove.permonikapi.specimen.model.SpecimenDTO;
import cz.incad.nkp.inprove.permonikapi.specimen.model.SpecimenDefinition;
import cz.incad.nkp.inprove.permonikapi.support.SolrFixtureFactory;
import cz.incad.nkp.inprove.permonikapi.support.SolrTestSupport;
import cz.incad.nkp.inprove.permonikapi.support.TestSecuritySupport;
import cz.incad.nkp.inprove.permonikapi.support.VolumeSpecimenDtoFactory;
import cz.incad.nkp.inprove.permonikapi.volume.dto.EditableVolumeWithSpecimensDTO;
import cz.incad.nkp.inprove.permonikapi.volume.model.VolumeDTO;
import cz.incad.nkp.inprove.permonikapi.volume.model.VolumeDefinition;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.request.SolrQuery;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.server.ResponseStatusException;

class VolumeServiceTest extends AbstractSolrIntegrationTest {

    @Autowired VolumeService volumeService;

    @Autowired SolrClient solrClient;

    @Autowired SpecimenService specimenService;

    @BeforeEach
    void setUp() throws Exception {
        // Keep tests isolated by clearing touched cores before each scenario.
        SolrTestSupport.clearCores(
                solrClient,
                VolumeDefinition.VOLUME_CORE_NAME,
                SpecimenDefinition.SPECIMEN_CORE_NAME,
                MetaTitleDefinition.META_TITLE_CORE_NAME,
                MutationDefinition.MUTATION_CORE_NAME,
                OwnerDefinition.OWNER_CORE_NAME,
                EditionDefinition.EDITION_CORE_NAME);
        SolrFixtureFactory.seedDefaultReferenceData(solrClient);
        TestSecuritySupport.setAuthenticationContext();
    }

    @AfterEach
    void tearDown() {
        TestSecuritySupport.clearAuthenticationContext();
    }

    @Test
    // Verifies create flow writes both volume and specimen and resolves reference names.
    void createVolumeWithSpecimens_createsBothAndResolvesReferenceNames() throws Exception {
        String volumeId = UUID.randomUUID().toString();
        String specimenId = UUID.randomUUID().toString();
        EditableVolumeWithSpecimensDTO dto =
                VolumeSpecimenDtoFactory.editableVolume(
                        volumeId,
                        "BAR-CREATE",
                        List.of(VolumeSpecimenDtoFactory.specimenDto(specimenId, volumeId, "N1")));

        volumeService.createVolumeWithSpecimens(dto);

        var volumeResult =
                solrClient.query(
                        VolumeDefinition.VOLUME_CORE_NAME,
                        new SolrQuery(VolumeDefinition.ID_FIELD + ":\"" + volumeId + "\""));
        assertThat(volumeResult.getResults()).hasSize(1);
        assertThat(
                        volumeResult
                                .getResults()
                                .getFirst()
                                .getFieldValue(VolumeDefinition.OWNER_NAME_FIELD))
                .isEqualTo("Owner Name");
        assertThat(
                        volumeResult
                                .getResults()
                                .getFirst()
                                .getFieldValue(VolumeDefinition.MUTATION_CS_NAME_FIELD))
                .isEqualTo("Mutation CS");
        assertThat(
                        volumeResult
                                .getResults()
                                .getFirst()
                                .getFieldValue(VolumeDefinition.META_TITLE_NAME_FIELD))
                .isEqualTo("Meta Title");

        var specimenResult =
                solrClient.query(
                        SpecimenDefinition.SPECIMEN_CORE_NAME,
                        new SolrQuery(SpecimenDefinition.ID_FIELD + ":\"" + specimenId + "\""));
        assertThat(specimenResult.getResults()).hasSize(1);
        assertThat(
                        specimenResult
                                .getResults()
                                .getFirst()
                                .getFieldValue(SpecimenDefinition.OWNER_NAME_FIELD))
                .isEqualTo("Owner Name");
    }

    @Test
    void createVolumeWithSpecimens_rejectsUnassignedOwner() {
        TestSecuritySupport.setAuthenticationContextForOwners("different-owner");
        EditableVolumeWithSpecimensDTO dto =
                VolumeSpecimenDtoFactory.editableVolume(
                        UUID.randomUUID().toString(), "BAR-FORBIDDEN", List.of());

        assertThatThrownBy(() -> volumeService.createVolumeWithSpecimens(dto))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    // Verifies update flow persists changes on volume and existing specimen rows.
    void updateVolumeWithSpecimens_updatesVolumeAndSpecimens() throws Exception {
        String volumeId = UUID.randomUUID().toString();
        String specimenId = UUID.randomUUID().toString();
        volumeService.createVolumeWithSpecimens(
                VolumeSpecimenDtoFactory.editableVolume(
                        volumeId,
                        "BAR-ORIG",
                        List.of(
                                VolumeSpecimenDtoFactory.specimenDto(
                                        specimenId, volumeId, "Before"))));

        VolumeDTO existingVolume = volumeService.getVolumeDTOById(volumeId);
        existingVolume.setBarCode("BAR-UPDATED");
        List<SpecimenDTO> existingSpecimens =
                specimenService.getSpecimensForVolumeDetail(volumeId, false);
        SpecimenDTO updatedSpecimen = existingSpecimens.getFirst();
        updatedSpecimen.setName("After");
        EditableVolumeWithSpecimensDTO updated =
                new EditableVolumeWithSpecimensDTO(existingVolume, List.of(updatedSpecimen));
        volumeService.updateVolumeWithSpecimens(volumeId, updated);

        var volumeResult =
                solrClient.query(
                        VolumeDefinition.VOLUME_CORE_NAME,
                        new SolrQuery(VolumeDefinition.ID_FIELD + ":\"" + volumeId + "\""));
        assertThat(
                        volumeResult
                                .getResults()
                                .getFirst()
                                .getFieldValue(VolumeDefinition.BAR_CODE_FIELD))
                .isEqualTo("BAR-UPDATED");

        var specimenResult =
                solrClient.query(
                        SpecimenDefinition.SPECIMEN_CORE_NAME,
                        new SolrQuery(SpecimenDefinition.ID_FIELD + ":\"" + specimenId + "\""));
        assertThat(
                        specimenResult
                                .getResults()
                                .getFirst()
                                .getFieldValue(SpecimenDefinition.NAME_FIELD))
                .isEqualTo("After");
    }

    @Test
    void updateVolumeWithSpecimens_rejectsDateRangeExcludingAnActiveSpecimenAndKeepsOriginalRange()
            throws Exception {
        String volumeId = UUID.randomUUID().toString();
        String specimenId = UUID.randomUUID().toString();
        VolumeDTO volume = VolumeSpecimenDtoFactory.volumeDto(volumeId, "BAR-DATE-RANGE");
        volume.setDateFrom(date("2026-01-10"));
        volume.setDateTo(date("2026-01-20"));
        SpecimenDTO specimen =
                VolumeSpecimenDtoFactory.specimenDto(specimenId, volumeId, "Boundary");
        specimen.setPublicationDate(date("2026-01-10"));
        volumeService.createVolumeWithSpecimens(
                new EditableVolumeWithSpecimensDTO(volume, List.of(specimen)));

        VolumeDTO updatedVolume = volumeService.getVolumeDTOById(volumeId);
        updatedVolume.setDateFrom(date("2026-01-11"));

        assertThatThrownBy(
                        () ->
                                volumeService.updateVolumeWithSpecimens(
                                        volumeId,
                                        new EditableVolumeWithSpecimensDTO(
                                                updatedVolume, List.of(specimen))))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(
                        exception ->
                                assertThat(((ResponseStatusException) exception).getStatusCode())
                                        .isEqualTo(HttpStatus.UNPROCESSABLE_ENTITY))
                .hasMessageContaining("VOLUME_DATE_RANGE_EXCLUDES_ACTIVE_SPECIMEN");

        VolumeDTO persistedVolume = volumeService.getVolumeDTOById(volumeId);
        assertThat(persistedVolume.getDateFrom()).isEqualTo(date("2026-01-10"));
        assertThat(persistedVolume.getDateTo()).isEqualTo(date("2026-01-20"));
    }

    @Test
    void createVolumeWithSpecimens_rejectsAnInvertedDateRangeBeforePersistingData()
            throws Exception {
        String volumeId = UUID.randomUUID().toString();
        VolumeDTO volume =
                VolumeSpecimenDtoFactory.volumeDto(volumeId, "BAR-INVERTED-CREATE-DATE-RANGE");
        volume.setDateFrom(date("2026-01-21"));
        volume.setDateTo(date("2026-01-20"));

        assertThatThrownBy(
                        () ->
                                volumeService.createVolumeWithSpecimens(
                                        new EditableVolumeWithSpecimensDTO(volume, List.of())))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(
                        exception ->
                                assertThat(((ResponseStatusException) exception).getStatusCode())
                                        .isEqualTo(HttpStatus.UNPROCESSABLE_ENTITY));

        assertThatThrownBy(() -> volumeService.getVolumeDTOById(volumeId))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(
                        exception ->
                                assertThat(((ResponseStatusException) exception).getStatusCode())
                                        .isEqualTo(HttpStatus.NOT_FOUND));
    }

    @Test
    void updateVolumeWithSpecimens_rejectsMissingDateRangeBoundary() throws Exception {
        String volumeId = UUID.randomUUID().toString();
        VolumeDTO volume = VolumeSpecimenDtoFactory.volumeDto(volumeId, "BAR-MISSING-DATE-RANGE");
        volume.setDateFrom(date("2026-01-10"));
        volume.setDateTo(date("2026-01-20"));
        SpecimenDTO specimen =
                VolumeSpecimenDtoFactory.specimenDto(
                        UUID.randomUUID().toString(), volumeId, "Existing");
        specimen.setPublicationDate(date("2026-01-15"));
        volumeService.createVolumeWithSpecimens(
                new EditableVolumeWithSpecimensDTO(volume, List.of(specimen)));

        VolumeDTO updatedVolume = volumeService.getVolumeDTOById(volumeId);
        updatedVolume.setDateTo(null);

        assertThatThrownBy(
                        () ->
                                volumeService.updateVolumeWithSpecimens(
                                        volumeId,
                                        new EditableVolumeWithSpecimensDTO(
                                                updatedVolume, List.of(specimen))))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(
                        exception ->
                                assertThat(((ResponseStatusException) exception).getStatusCode())
                                        .isEqualTo(HttpStatus.UNPROCESSABLE_ENTITY));

        assertThat(volumeService.getVolumeDTOById(volumeId).getDateTo())
                .isEqualTo(date("2026-01-20"));
    }

    @Test
    void updateVolumeWithSpecimens_rejectsDateRangeEndingBeforeAnActiveSpecimen() throws Exception {
        String volumeId = UUID.randomUUID().toString();
        VolumeDTO volume = VolumeSpecimenDtoFactory.volumeDto(volumeId, "BAR-UPPER-DATE-RANGE");
        volume.setDateFrom(date("2026-01-10"));
        volume.setDateTo(date("2026-01-20"));
        SpecimenDTO specimen =
                VolumeSpecimenDtoFactory.specimenDto(
                        UUID.randomUUID().toString(), volumeId, "Upper boundary");
        specimen.setPublicationDate(date("2026-01-20"));
        volumeService.createVolumeWithSpecimens(
                new EditableVolumeWithSpecimensDTO(volume, List.of(specimen)));

        VolumeDTO updatedVolume = volumeService.getVolumeDTOById(volumeId);
        updatedVolume.setDateTo(date("2026-01-19"));

        assertThatThrownBy(
                        () ->
                                volumeService.updateVolumeWithSpecimens(
                                        volumeId,
                                        new EditableVolumeWithSpecimensDTO(
                                                updatedVolume, List.of(specimen))))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(
                        exception ->
                                assertThat(((ResponseStatusException) exception).getStatusCode())
                                        .isEqualTo(HttpStatus.UNPROCESSABLE_ENTITY))
                .hasMessageContaining("VOLUME_DATE_RANGE_EXCLUDES_ACTIVE_SPECIMEN");
    }

    @Test
    void updateVolumeWithSpecimens_acceptsAnActiveSpecimenOnBothInclusiveDateBoundaries()
            throws Exception {
        String volumeId = UUID.randomUUID().toString();
        VolumeDTO volume = VolumeSpecimenDtoFactory.volumeDto(volumeId, "BAR-INCLUSIVE-RANGE");
        volume.setDateFrom(date("2026-01-10"));
        volume.setDateTo(date("2026-01-20"));
        SpecimenDTO firstSpecimen =
                VolumeSpecimenDtoFactory.specimenDto(
                        UUID.randomUUID().toString(), volumeId, "First boundary");
        firstSpecimen.setPublicationDate(date("2026-01-10"));
        SpecimenDTO lastSpecimen =
                VolumeSpecimenDtoFactory.specimenDto(
                        UUID.randomUUID().toString(), volumeId, "Last boundary");
        lastSpecimen.setPublicationDate(dateTime("2026-01-20T23:59:59Z"));
        volumeService.createVolumeWithSpecimens(
                new EditableVolumeWithSpecimensDTO(volume, List.of(firstSpecimen, lastSpecimen)));

        VolumeDTO updatedVolume = volumeService.getVolumeDTOById(volumeId);
        volumeService.updateVolumeWithSpecimens(
                volumeId,
                new EditableVolumeWithSpecimensDTO(
                        updatedVolume, List.of(firstSpecimen, lastSpecimen)));

        assertThat(volumeService.getVolumeDTOById(volumeId).getDateFrom())
                .isEqualTo(date("2026-01-10"));
        assertThat(volumeService.getVolumeDTOById(volumeId).getDateTo())
                .isEqualTo(date("2026-01-20"));
    }

    @Test
    void updateVolumeWithSpecimens_ignoresUnnumberedSpecimensOutsideDateRange() throws Exception {
        String volumeId = UUID.randomUUID().toString();
        String specimenId = UUID.randomUUID().toString();
        String activeSpecimenId = UUID.randomUUID().toString();
        VolumeDTO volume = VolumeSpecimenDtoFactory.volumeDto(volumeId, "BAR-UNNUMBERED-RANGE");
        volume.setDateFrom(date("2026-01-10"));
        volume.setDateTo(date("2026-01-20"));
        SpecimenDTO specimen =
                VolumeSpecimenDtoFactory.specimenDto(specimenId, volumeId, "Unnumbered");
        specimen.setNumExists(false);
        specimen.setPublicationDate(date("2026-01-05"));
        SpecimenDTO activeSpecimen =
                VolumeSpecimenDtoFactory.specimenDto(activeSpecimenId, volumeId, "Active");
        activeSpecimen.setPublicationDate(date("2026-01-15"));
        volumeService.createVolumeWithSpecimens(
                new EditableVolumeWithSpecimensDTO(volume, List.of(specimen, activeSpecimen)));

        VolumeDTO updatedVolume = volumeService.getVolumeDTOById(volumeId);
        updatedVolume.setDateFrom(date("2026-01-11"));
        volumeService.updateVolumeWithSpecimens(
                volumeId,
                new EditableVolumeWithSpecimensDTO(
                        updatedVolume,
                        specimenService.getSpecimensForVolumeDetail(volumeId, false)));

        assertThat(volumeService.getVolumeDTOById(volumeId).getDateFrom())
                .isEqualTo(date("2026-01-11"));
        assertThat(specimenService.getSpecimensForVolumeDetail(volumeId, false))
                .extracting(SpecimenDTO::getId)
                .containsExactly(activeSpecimenId);
    }

    @Test
    void
            updateVolumeWithSpecimens_rejectsPayloadSpecimenOutsideDateRangeWithoutUpdatingVolumeOrSpecimen()
                    throws Exception {
        String volumeId = UUID.randomUUID().toString();
        String specimenId = UUID.randomUUID().toString();
        VolumeDTO volume = VolumeSpecimenDtoFactory.volumeDto(volumeId, "BAR-PAYLOAD-DATE-RANGE");
        volume.setDateFrom(date("2026-01-10"));
        volume.setDateTo(date("2026-01-20"));
        SpecimenDTO specimen =
                VolumeSpecimenDtoFactory.specimenDto(specimenId, volumeId, "Existing");
        specimen.setPublicationDate(date("2026-01-15"));
        volumeService.createVolumeWithSpecimens(
                new EditableVolumeWithSpecimensDTO(volume, List.of(specimen)));

        SpecimenDTO updatedSpecimen =
                specimenService.getSpecimensForVolumeDetail(volumeId, false).getFirst();
        updatedSpecimen.setPublicationDate(date("2026-01-21"));

        assertThatThrownBy(
                        () ->
                                volumeService.updateVolumeWithSpecimens(
                                        volumeId,
                                        new EditableVolumeWithSpecimensDTO(
                                                volumeService.getVolumeDTOById(volumeId),
                                                List.of(updatedSpecimen))))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(
                        exception ->
                                assertThat(((ResponseStatusException) exception).getStatusCode())
                                        .isEqualTo(HttpStatus.UNPROCESSABLE_ENTITY));

        assertThat(volumeService.getVolumeDTOById(volumeId).getDateTo())
                .isEqualTo(date("2026-01-20"));
        assertThat(
                        specimenService
                                .getSpecimensForVolumeDetail(volumeId, false)
                                .getFirst()
                                .getPublicationDate())
                .isEqualTo(date("2026-01-15"));
    }

    @Test
    void
            updateOvergeneratedVolumeWithSpecimens_rejectsPayloadSpecimenOutsideDateRangeBeforeReplacingSpecimens()
                    throws Exception {
        String volumeId = UUID.randomUUID().toString();
        String oldSpecimenId = UUID.randomUUID().toString();
        VolumeDTO volume =
                VolumeSpecimenDtoFactory.volumeDto(
                        volumeId, "BAR-OVERGENERATED-PAYLOAD-DATE-RANGE");
        volume.setDateFrom(date("2026-01-10"));
        volume.setDateTo(date("2026-01-20"));
        SpecimenDTO oldSpecimen =
                VolumeSpecimenDtoFactory.specimenDto(oldSpecimenId, volumeId, "Existing");
        oldSpecimen.setPublicationDate(date("2026-01-15"));
        volumeService.createVolumeWithSpecimens(
                new EditableVolumeWithSpecimensDTO(volume, List.of(oldSpecimen)));

        SpecimenDTO newSpecimen =
                VolumeSpecimenDtoFactory.specimenDto(UUID.randomUUID().toString(), volumeId, "New");
        newSpecimen.setPublicationDate(date("2026-01-21"));

        assertThatThrownBy(
                        () ->
                                volumeService.updateOvergeneratedVolumeWithSpecimens(
                                        volumeId,
                                        new EditableVolumeWithSpecimensDTO(
                                                volumeService.getVolumeDTOById(volumeId),
                                                List.of(newSpecimen))))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(
                        exception ->
                                assertThat(((ResponseStatusException) exception).getStatusCode())
                                        .isEqualTo(HttpStatus.UNPROCESSABLE_ENTITY));

        assertThat(specimenService.getSpecimensForVolumeDetail(volumeId, false))
                .extracting(SpecimenDTO::getId)
                .containsExactly(oldSpecimenId);
    }

    @Test
    void updateOvergeneratedVolumeWithSpecimens_rejectsDateRangeBeforeDeletingActiveSpecimens()
            throws Exception {
        String volumeId = UUID.randomUUID().toString();
        String specimenId = UUID.randomUUID().toString();
        VolumeDTO volume =
                VolumeSpecimenDtoFactory.volumeDto(volumeId, "BAR-OVERGENERATED-DATE-RANGE");
        volume.setDateFrom(date("2026-01-10"));
        volume.setDateTo(date("2026-01-20"));
        SpecimenDTO specimen =
                VolumeSpecimenDtoFactory.specimenDto(specimenId, volumeId, "Existing");
        specimen.setPublicationDate(date("2026-01-20"));
        volumeService.createVolumeWithSpecimens(
                new EditableVolumeWithSpecimensDTO(volume, List.of(specimen)));

        VolumeDTO updatedVolume = volumeService.getVolumeDTOById(volumeId);
        updatedVolume.setDateTo(date("2026-01-19"));

        assertThatThrownBy(
                        () ->
                                volumeService.updateOvergeneratedVolumeWithSpecimens(
                                        volumeId,
                                        new EditableVolumeWithSpecimensDTO(
                                                updatedVolume, List.of())))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(
                        exception ->
                                assertThat(((ResponseStatusException) exception).getStatusCode())
                                        .isEqualTo(HttpStatus.UNPROCESSABLE_ENTITY));

        assertThat(specimenService.getSpecimensForVolumeDetail(volumeId, false)).hasSize(1);
        assertThat(volumeService.getVolumeDTOById(volumeId).getDateTo())
                .isEqualTo(date("2026-01-20"));
    }

    @Test
    // Verifies overgenerated update replaces active specimen set with new payload.
    void updateOvergeneratedVolumeWithSpecimens_replacesSpecimens() throws Exception {
        String volumeId = UUID.randomUUID().toString();
        String old1 = UUID.randomUUID().toString();
        String old2 = UUID.randomUUID().toString();
        volumeService.createVolumeWithSpecimens(
                VolumeSpecimenDtoFactory.editableVolume(
                        volumeId,
                        "BAR-OVER",
                        List.of(
                                VolumeSpecimenDtoFactory.specimenDto(old1, volumeId, "Old1"),
                                VolumeSpecimenDtoFactory.specimenDto(old2, volumeId, "Old2"))));

        VolumeDTO existingVolume = volumeService.getVolumeDTOById(volumeId);
        String newer = UUID.randomUUID().toString();
        EditableVolumeWithSpecimensDTO updated =
                new EditableVolumeWithSpecimensDTO(
                        existingVolume,
                        List.of(VolumeSpecimenDtoFactory.specimenDto(newer, volumeId, "New")));
        volumeService.updateOvergeneratedVolumeWithSpecimens(volumeId, updated);

        var activeSpecimens =
                solrClient.query(
                        SpecimenDefinition.SPECIMEN_CORE_NAME,
                        new SolrQuery(
                                SpecimenDefinition.VOLUME_ID_FIELD
                                        + ":\""
                                        + volumeId
                                        + "\" AND -"
                                        + AuditableDefinition.DELETED_FIELD
                                        + ":[* TO *]"));
        assertThat(activeSpecimens.getResults()).hasSize(1);
        assertThat(
                        activeSpecimens
                                .getResults()
                                .getFirst()
                                .getFieldValue(SpecimenDefinition.ID_FIELD))
                .isEqualTo(newer);
    }

    @Test
    // Verifies delete flow soft-deletes volume and all linked specimens.
    void deleteVolumeWithSpecimens_softDeletesVolumeAndAllSpecimens() throws Exception {
        String volumeId = UUID.randomUUID().toString();
        String specimenId = UUID.randomUUID().toString();
        volumeService.createVolumeWithSpecimens(
                VolumeSpecimenDtoFactory.editableVolume(
                        volumeId,
                        "BAR-DEL",
                        List.of(
                                VolumeSpecimenDtoFactory.specimenDto(
                                        specimenId, volumeId, "ToDelete"))));

        volumeService.deleteVolumeWithSpecimens(volumeId);

        var volumeResult =
                solrClient.query(
                        VolumeDefinition.VOLUME_CORE_NAME,
                        new SolrQuery(VolumeDefinition.ID_FIELD + ":\"" + volumeId + "\""));
        assertThat(volumeResult.getResults()).hasSize(1);
        assertThat(
                        volumeResult
                                .getResults()
                                .getFirst()
                                .getFieldValue(AuditableDefinition.DELETED_FIELD))
                .isNotNull();

        var specimenResult =
                solrClient.query(
                        SpecimenDefinition.SPECIMEN_CORE_NAME,
                        new SolrQuery(SpecimenDefinition.ID_FIELD + ":\"" + specimenId + "\""));
        assertThat(specimenResult.getResults()).hasSize(1);
        assertThat(
                        specimenResult
                                .getResults()
                                .getFirst()
                                .getFieldValue(AuditableDefinition.DELETED_FIELD))
                .isNotNull();
    }

    private java.util.Date date(String value) {
        return java.util.Date.from(LocalDate.parse(value).atStartOfDay(ZoneOffset.UTC).toInstant());
    }

    private java.util.Date dateTime(String value) {
        return java.util.Date.from(java.time.Instant.parse(value));
    }
}
