package cz.incad.nkp.inprove.permonikdomain

/** Authoritative damage vocabulary; codes are stable storage and transport values, not enum names. */
enum class SpecimenDamageType(val code: String) {
    VERIFIED("OK"),
    MISSING_ISSUE("ChCC"),
    MISSING_PAGES("ChS"),
    DAMAGED_DOCUMENT("PP"),
    DEGRADATION("Deg"),
    INCORRECT_PAGINATION("ChPag"),
    INCORRECT_NUMBERING("ChCis"),
    INCORRECT_BINDING("ChSv"),
    CENSORED("Cz"),
    ILLEGIBLE_BINDING("NS"),
    CENSORED_COPY("CzV"),
    INCORRECT_DATE("ChDatum");

    companion object {
        /** Looks up an exact stable code, returning null for unknown or absent historical values. */
        @JvmStatic
        fun fromCode(code: String?): SpecimenDamageType? = entries.firstOrNull { it.code == code }
    }
}
