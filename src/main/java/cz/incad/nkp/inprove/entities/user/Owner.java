package cz.incad.nkp.inprove.entities.user;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum Owner {
    NKP("0", "NKP", "https://shibboleth.nkp.cz/idp/shibboleth"),
    MZK("1", "MZK", "https://shibboleth.mzk.cz/simplesaml/metadata.xml"),
    VKOL("2", "VKOL", "https://shibo.vkol.cz/idp/shibboleth"),
    KUK("3", "KUK", "https://svkul.cz/idp/shibboleth");

    private final String id;
    private final String name;
    private final String url;
}

