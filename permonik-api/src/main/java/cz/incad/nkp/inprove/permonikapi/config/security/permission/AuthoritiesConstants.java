package cz.incad.nkp.inprove.permonikapi.config.security.permission;

public class AuthoritiesConstants {

    private AuthoritiesConstants() {
    }

    // TODO: this needs to be edited and finished
    // actions
    private static final String WRITE = "_WRITE";
    private static final String DELETE = "_DELETE";
    private static final String READ = "_READ";
    private static final String READ_DTO = "_READ_DTO";


    // authorities
    public static final String VOLUME_WRITE = ResourcesConstants.VOLUME + WRITE;
    public static final String VOLUME_DELETE = ResourcesConstants.VOLUME + DELETE;
    public static final String VOLUME_READ = ResourcesConstants.VOLUME + READ;
    public static final String VOLUME_READ_DTO = ResourcesConstants.VOLUME + READ_DTO;

    public static final String USER_WRITE = ResourcesConstants.USER + WRITE;
    public static final String USER_DELETE = ResourcesConstants.USER + DELETE;
    public static final String USER_READ = ResourcesConstants.USER + READ;
    public static final String USER_READ_DTO = ResourcesConstants.USER + READ_DTO;


    public static final String EXEMPLAR_WRITE = ResourcesConstants.EXEMPLAR + WRITE;
    public static final String EXEMPLAR_DELETE = ResourcesConstants.EXEMPLAR + DELETE;
    public static final String EXEMPLAR_READ = ResourcesConstants.EXEMPLAR + READ;
    public static final String EXEMPLAR_READ_DTO = ResourcesConstants.EXEMPLAR + READ_DTO;


    public static final String CALENDAR_WRITE = ResourcesConstants.CALENDAR + WRITE;
    public static final String CALENDAR_DELETE = ResourcesConstants.CALENDAR + DELETE;
    public static final String CALENDAR_READ = ResourcesConstants.CALENDAR + READ;
    public static final String CALENDAR_READ_DTO = ResourcesConstants.CALENDAR + READ_DTO;


    public static final String META_TITLE_WRITE = ResourcesConstants.META_TITLE + WRITE;
    public static final String META_TITLE_DELETE = ResourcesConstants.META_TITLE + DELETE;
    public static final String META_TITLE_READ = ResourcesConstants.META_TITLE + READ;
    public static final String META_TITLE_READ_DTO = ResourcesConstants.META_TITLE + READ_DTO;
}
