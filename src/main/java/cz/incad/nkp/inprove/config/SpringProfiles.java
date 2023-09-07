package cz.incad.nkp.inprove.config;

import lombok.Getter;

@Getter
public enum SpringProfiles {
    DEV("dev"),
    TEST("test"),
    PROD("prod");

    private final String profile;

    SpringProfiles(String profile) {
        this.profile = profile;
    }

    public static boolean isDev(String profile) {
        return profile.equals(DEV.getProfile());
    }
}
