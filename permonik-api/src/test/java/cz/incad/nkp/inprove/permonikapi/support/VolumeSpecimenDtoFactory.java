package cz.incad.nkp.inprove.permonikapi.support;

import cz.incad.nkp.inprove.permonikapi.common.mutationMark.MutationMark;
import cz.incad.nkp.inprove.permonikapi.common.mutationMark.MutationMarkTypeEnum;
import cz.incad.nkp.inprove.permonikapi.specimen.model.SpecimenDTO;
import cz.incad.nkp.inprove.permonikapi.volume.dto.EditableVolumeWithSpecimensDTO;
import cz.incad.nkp.inprove.permonikapi.volume.dto.VolumePeriodicityDTO;
import cz.incad.nkp.inprove.permonikapi.volume.enums.AttachmentsSortEnum;
import cz.incad.nkp.inprove.permonikapi.volume.model.VolumeDTO;

import java.util.Date;
import java.util.List;

/**
 * Shared builder for Volume/Specimen DTO payloads used in integration tests.
 */
public final class VolumeSpecimenDtoFactory {

    private VolumeSpecimenDtoFactory() {
    }

    public static EditableVolumeWithSpecimensDTO editableVolume(
        String volumeId,
        String barCode,
        List<SpecimenDTO> specimens
    ) {
        return new EditableVolumeWithSpecimensDTO(volumeDto(volumeId, barCode), specimens);
    }

    public static VolumeDTO volumeDto(String volumeId, String barCode) {
        VolumeDTO volume = new VolumeDTO();
        volume.setId(volumeId);
        volume.setBarCode(barCode);
        volume.setDateFrom(new Date(System.currentTimeMillis() - 100_000L));
        volume.setDateTo(new Date());
        volume.setMetaTitleId(SolrFixtureFactory.ReferenceData.META_TITLE_ID);
        volume.setMutationId(SolrFixtureFactory.ReferenceData.MUTATION_ID);
        volume.setOwnerId(SolrFixtureFactory.ReferenceData.OWNER_ID);
        volume.setPeriodicity(
            List.of(
                new VolumePeriodicityDTO(
                    "MONDAY",
                    true,
                    SolrFixtureFactory.ReferenceData.EDITION_ID,
                    8,
                    "Morning",
                    "",
                    false
                )
            )
        );
        volume.setFirstNumber(1);
        volume.setLastNumber(1);
        volume.setAttachmentsSort(AttachmentsSortEnum.NONE);
        volume.setYear(2026);
        volume.setMutationMark(new MutationMark("", MutationMarkTypeEnum.UNMARKED, ""));
        return volume;
    }

    public static SpecimenDTO specimenDto(String specimenId, String volumeId, String name) {
        SpecimenDTO specimen = new SpecimenDTO();
        specimen.setId(specimenId);
        specimen.setVolumeId(volumeId);
        specimen.setNumExists(true);
        specimen.setNumMissing(false);
        specimen.setName(name);
        specimen.setSubName("");
        specimen.setEditionId(SolrFixtureFactory.ReferenceData.EDITION_ID);
        specimen.setMutationId(SolrFixtureFactory.ReferenceData.MUTATION_ID);
        specimen.setMutationMark(new MutationMark("", MutationMarkTypeEnum.UNMARKED, ""));
        specimen.setPublicationDate(new Date());
        specimen.setNumber("1");
        specimen.setPagesCount(8);
        specimen.setIsAttachment(false);
        return specimen;
    }
}
