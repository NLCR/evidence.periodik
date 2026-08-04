package cz.incad.nkp.inprove.permonikapi.edition.model;

public interface EditionDefinition {
    String EDITION_CORE_NAME = "edition";
    String ID_FIELD = "id";

    String NAME_CS_FIELD = "name_cs";
    String NAME_CS_SEARCH_FIELD = "name_cs_search";
    String NAME_CS_SORT_FIELD = "name_cs_sort";

    String NAME_SK_FIELD = "name_sk";
    String NAME_SK_SEARCH_FIELD = "name_sk_search";
    String NAME_SK_SORT_FIELD = "name_sk_sort";

    String NAME_EN_FIELD = "name_en";
    String NAME_EN_SEARCH_FIELD = "name_en_search";
    String NAME_EN_SORT_FIELD = "name_en_sort";

    String IS_DEFAULT_FIELD = "is_default";
    String IS_ATTACHMENT_FIELD = "is_attachment";
    String IS_PERIODIC_ATTACHMENT_FIELD = "is_periodic_attachment";
}
