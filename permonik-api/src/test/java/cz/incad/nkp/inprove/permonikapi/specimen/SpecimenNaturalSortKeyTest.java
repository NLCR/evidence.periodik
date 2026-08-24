package cz.incad.nkp.inprove.permonikapi.specimen;

import org.junit.jupiter.api.Test;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

class SpecimenNaturalSortKeyTest {

    @Test
    void from_nullAndBlank_returnsNull() {
        assertThat(SpecimenNaturalSortKey.from(null)).isNull();
        assertThat(SpecimenNaturalSortKey.from("   ")).isNull();
    }

    @Test
    void from_numericAndMixedValues_sortsNaturallyInComplexDomainSet() {
        List<String> sorted = Stream.of(
                "1a10", "1-2", "10", "2", "1a2", "1a1", "1a", "1-10", "1", "A-10", "A-1", "A-2", "1b"
            )
            .sorted(Comparator.comparing(SpecimenNaturalSortKey::from))
            .toList();

        assertThat(sorted).containsExactly(
            "1",
            "1-2",
            "1-10",
            "1a",
            "1a1",
            "1a2",
            "1a10",
            "1b",
            "2",
            "10",
            "A-1",
            "A-2",
            "A-10"
        );
    }

    @Test
    void from_singleComparisons_sortsNaturally() {
        assertThat(SpecimenNaturalSortKey.from("1-1"))
            .isLessThan(SpecimenNaturalSortKey.from("1-2"));
        assertThat(SpecimenNaturalSortKey.from("1"))
            .isLessThan(SpecimenNaturalSortKey.from("1a"));
        assertThat(SpecimenNaturalSortKey.from("1a9"))
            .isLessThan(SpecimenNaturalSortKey.from("1a10"));
        assertThat(SpecimenNaturalSortKey.from("A-2"))
            .isLessThan(SpecimenNaturalSortKey.from("A-10"));
    }

    @Test
    void from_leadingZeros_normalizesToSameNumericValue() {
        assertThat(SpecimenNaturalSortKey.from("001"))
            .isEqualTo(SpecimenNaturalSortKey.from("1"));
        assertThat(SpecimenNaturalSortKey.from("1-02"))
            .isEqualTo(SpecimenNaturalSortKey.from("1-2"));
    }

    @Test
    void from_caseAndWhitespace_normalizesInput() {
        assertThat(SpecimenNaturalSortKey.from("  1A-02  "))
            .isEqualTo(SpecimenNaturalSortKey.from("1a-2"));
        assertThat(SpecimenNaturalSortKey.from("  A-10  "))
            .isEqualTo(SpecimenNaturalSortKey.from("a-10"));
    }

    @Test
    void from_attachmentIssueNumbers_sortsNaturally() {
        List<String> sorted = Stream.of("ATT-10", "ATT-2", "ATT-1", "att-02")
            .sorted(Comparator.comparing(SpecimenNaturalSortKey::from))
            .toList();

        assertThat(sorted).containsExactly("ATT-1", "ATT-2", "att-02", "ATT-10");
        assertThat(SpecimenNaturalSortKey.from("att-02"))
            .isEqualTo(SpecimenNaturalSortKey.from("ATT-2"));
    }
}
