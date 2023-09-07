
package cz.incad.nkp.inprove.old.importing;

/**
 *
 * @author alberto.a.hernandez
 */
public enum VDKSetMonths {
    LED("01"),
    ÚN("02"),
    ÚNO("02"),
    BRE("03"),
    BŘE("03"),
    BŘEZ("03"),
    DUB("04"),
    KVĚ("05"),
    KVĚT("05"),
    ČER("06"),
    ČVN("06"),
    ČVC("07"),
    SRP("08"),
    ZAR("09"),
    ZÁŘ("09"),
    ZÁŘÍ("09"),
    RIJ("10"),
    ŘÍJ("10"),
    LIS("11"),
    LIST("11"),
    PROS("12"),
    UNKNOWN("");

    private String num;

    VDKSetMonths(String num) {
        this.num = num;
    }

    public String num() {
        return num;
    }
}
