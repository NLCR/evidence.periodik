package cz.incad.nkp.inprove.permonikapi.specimen.model;

public interface SpecimenDefinition {
    String SPECIMEN_CORE_NAME = "specimen";
    String ID_FIELD = "id";

    String META_TITLE_ID_FIELD = "metatitle_id";
    String META_TITLE_NAME_FIELD = "metatitle_name";
    String META_TITLE_SEARCH_FIELD = "metatitle_search";
    String META_TITLE_SORT_FIELD = "metatitle_sort";

    String VOLUME_ID_FIELD = "volume_id";
    String BAR_CODE_FIELD = "bar_code";
    String NUM_EXISTS_FIELD = "num_exists";
    String NUM_MISSING_FIELD = "num_missing";

    String OWNER_ID_FIELD = "owner_id";
    String OWNER_NAME_FIELD = "owner_name";
    String OWNER_NAME_SEARCH_FIELD = "owner_name_search";
    String OWNER_NAME_SORT_FIELD = "owner_name_sort";
    String OWNER_SHORTHAND_FIELD = "owner_shorthand";
    String OWNER_SHORTHAND_SEARCH_FIELD = "owner_shorthand_search";
    String OWNER_SHORTHAND_SORT_FIELD = "owner_shorthand_sort";
    String OWNER_SIGLA_FIELD = "owner_sigla";
    String OWNER_SIGLA_SEARCH_FIELD = "owner_sigla_search";
    String OWNER_SIGLA_SORT_FIELD = "owner_sigla_sort";

    String DAMAGE_TYPES_FIELD = "damage_types";
    String DAMAGED_PAGES_FIELD = "damaged_pages";
    String MISSING_PAGES_FIELD = "missing_pages";

    String NOTE_FIELD = "note";
    String NOTE_SEARCH_FIELD = "note_search";

    String NAME_FIELD = "name";
    String NAME_SEARCH_FIELD = "name_search";
    String NAME_SORT_FIELD = "name_sort";

    String SUB_NAME_FIELD = "subname";
    String SUB_NAME_SEARCH_FIELD = "subname_search";
    String SUB_NAME_SORT_FIELD = "subname_sort";

    String EDITION_ID_FIELD = "edition_id";
    String EDITION_CS_NAME_FIELD = "edition_name_cs";
    String EDITION_CS_SEARCH_FIELD = "edition_name_cs_search";
    String EDITION_CS_SORT_FIELD = "edition_name_cs_sort";
    String EDITION_SK_NAME_FIELD = "edition_name_sk";
    String EDITION_SK_SEARCH_FIELD = "edition_name_sk_search";
    String EDITION_SK_SORT_FIELD = "edition_name_sk_sort";
    String EDITION_EN_NAME_FIELD = "edition_name_en";
    String EDITION_EN_SEARCH_FIELD = "edition_name_en_search";
    String EDITION_EN_SORT_FIELD = "edition_name_en_sort";

    String MUTATION_ID_FIELD = "mutation_id";
    String MUTATION_CS_NAME_FIELD = "mutation_name_cs";
    String MUTATION_CS_SEARCH_FIELD = "mutation_name_cs_search";
    String MUTATION_CS_SORT_FIELD = "mutation_name_cs_sort";
    String MUTATION_SK_NAME_FIELD = "mutation_name_sk";
    String MUTATION_SK_SEARCH_FIELD = "mutation_name_sk_search";
    String MUTATION_SK_SORT_FIELD = "mutation_name_sk_sort";
    String MUTATION_EN_NAME_FIELD = "mutation_name_en";
    String MUTATION_EN_SEARCH_FIELD = "mutation_name_en_search";
    String MUTATION_EN_SORT_FIELD = "mutation_name_en_sort";

    String MUTATION_MARK_FIELD = "mutation_mark";
    String MUTATION_MARK_TYPE_FIELD = "mutation_mark_type";
    String MUTATION_MARK_DESCRIPTION_FIELD = "mutation_mark_description";
    String PUBLICATION_DATE_FIELD = "publication_date";
    String NUMBER_FIELD = "number";
    String ATTACHMENT_NUMBER_FIELD = "attachment_number";
    String NUMBER_SORT_KEY_FIELD = "number_sort_key";
    String PAGES_COUNT_FIELD = "pages_count";
    String IS_ATTACHMENT_FIELD = "is_attachment";
}
