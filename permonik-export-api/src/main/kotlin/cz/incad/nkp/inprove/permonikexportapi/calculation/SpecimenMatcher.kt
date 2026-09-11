package cz.incad.nkp.inprove.permonikexportapi.calculation

class SpecimenMatcher {
    /** Determines whether two specimens represent the same logical issue under the selected matching rules. */
    fun matches(
        target: SpecimenSnapshot,
        candidate: SpecimenSnapshot,
        rules: SpecimenMatchingRules,
    ): Boolean = target.publicationDate == candidate.publicationDate &&
        target.isAttachment == candidate.isAttachment &&
        identifiersEqual(target.identifier(), candidate.identifier()) &&
        normalizedText(target.editionId) == normalizedText(candidate.editionId) &&
        (!target.isAttachment || attachmentNamesEqual(target, candidate)) &&
        (!rules.matchMutation || normalizedText(target.mutationId) == normalizedText(candidate.mutationId)) &&
        (!rules.matchMutationalEdition || mutationMarksEqual(target, candidate))

    /** Compares issue identifiers naturally so numeric fragments are independent of padding and letter case. */
    fun identifiersEqual(first: String?, second: String?): Boolean = naturalTokens(first) == naturalTokens(second)

    /** Compares mutation-mark type and normalized textual mark for optional mutational-edition matching. */
    private fun mutationMarksEqual(target: SpecimenSnapshot, candidate: SpecimenSnapshot): Boolean =
        target.mutationMark.type == candidate.mutationMark.type &&
            normalizedText(target.mutationMark.mark) == normalizedText(candidate.mutationMark.mark)

    /** Compares attachment names that disambiguate attachments sharing a date and identifier. */
    private fun attachmentNamesEqual(target: SpecimenSnapshot, candidate: SpecimenSnapshot): Boolean =
        normalizedText(target.name) == normalizedText(candidate.name) &&
            normalizedText(target.subName) == normalizedText(candidate.subName)

    /** Splits an identifier into normalized numeric and textual fragments for natural equality. */
    private fun naturalTokens(value: String?): List<String> = TOKEN_REGEX.findAll(normalizedText(value))
        .map { match ->
            match.value.toBigIntegerOrNull()?.toString() ?: match.value
        }
        .toList()

    /** Normalizes optional comparison text by trimming it and applying locale-independent lowercase conversion. */
    private fun normalizedText(value: String?): String = value.orEmpty().trim().lowercase()
}

/** Selects the normal issue number or attachment number used by the logical specimen identity. */
private fun SpecimenSnapshot.identifier(): String? = if (isAttachment) attachmentNumber else number

private val TOKEN_REGEX = Regex("\\d+|\\D+")
