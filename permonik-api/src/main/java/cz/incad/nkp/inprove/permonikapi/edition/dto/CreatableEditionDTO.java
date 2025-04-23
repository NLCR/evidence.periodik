package cz.incad.nkp.inprove.permonikapi.edition.dto;


// name as string
//    {
//        cs: "Ranní",
//        sk: "Ranné",
//        en: "Morning"
//    }
public record CreatableEditionDTO(String name, Boolean isDefault, Boolean isAttachment,
                                  Boolean isPeriodicAttachment) {
}
