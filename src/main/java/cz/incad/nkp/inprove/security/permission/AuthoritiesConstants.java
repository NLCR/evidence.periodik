package cz.incad.nkp.inprove.security.permission;

import static cz.incad.nkp.inprove.security.permission.ResourcesConstants.*;

public class AuthoritiesConstants {

    private AuthoritiesConstants() {}

    // actions
    private static final String WRITE = "_WRITE";
    private static final String DELETE = "_DELETE";
    private static final String READ = "_READ";
    private static final String READ_DTO = "_READ_DTO";


    // authorities
    public static final String VOLUME_WRITE = VOLUME + WRITE;
    public static final String VOLUME_DELETE = VOLUME + DELETE;
    public static final String VOLUME_READ = VOLUME + READ;
    public static final String VOLUME_READ_DTO = VOLUME + READ_DTO;

    public static final String USER_WRITE = USER + WRITE;
    public static final String USER_DELETE = USER + DELETE;
    public static final String USER_READ = USER + READ;
    public static final String USER_READ_DTO = USER + READ_DTO;


    public static final String EXEMPLAR_WRITE = EXEMPLAR + WRITE;
    public static final String EXEMPLAR_DELETE = EXEMPLAR + DELETE;
    public static final String EXEMPLAR_READ = EXEMPLAR + READ;
    public static final String EXEMPLAR_READ_DTO = EXEMPLAR + READ_DTO;


    public static final String CALENDAR_WRITE = CALENDAR + WRITE;
    public static final String CALENDAR_DELETE = CALENDAR + DELETE;
    public static final String CALENDAR_READ = CALENDAR + READ;
    public static final String CALENDAR_READ_DTO = CALENDAR + READ_DTO;


    public static final String META_TITLE_WRITE = META_TITLE + WRITE;
    public static final String META_TITLE_DELETE = META_TITLE + DELETE;
    public static final String META_TITLE_READ = META_TITLE + READ;
    public static final String META_TITLE_READ_DTO = META_TITLE + READ_DTO;
}
