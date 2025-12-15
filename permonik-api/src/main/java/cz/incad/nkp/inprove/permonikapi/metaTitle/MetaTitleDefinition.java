package cz.incad.nkp.inprove.permonikapi.metaTitle;

public interface MetaTitleDefinition {
    String META_TITLE_CORE_NAME = "metatitle";
    String ID_FIELD = "id";
    String NAME_FIELD = "name";
    String NAME_SORT_FIELD = "name_sort"; // This field is using Solr ICUCollationField for sorting with diacritic
    String NOTE_FIELD = "note";
    String IS_PUBLIC_FIELD = "isPublic";
}
