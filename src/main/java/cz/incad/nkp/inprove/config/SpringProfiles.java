package cz.incad.nkp.inprove.config;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum SpringProfiles {
    DEV("dev"),
    TEST("test"),
    PROD("prod");

    private final String profile;

    public static boolean isDev(String profile) {
        return profile.equals(DEV.getProfile());
    }
}
