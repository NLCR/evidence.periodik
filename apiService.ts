/* tslint:disable */
/* eslint-disable */
// Generated using typescript-generator version 2.37.1128 on 2024-05-13 15:02:04.

export interface ResetPasswordDto {
    id: string;
    oldheslo: string;
    newheslo: string;
}

export interface User extends BaseEntity, Serializable {
    email: string;
    username: string;
    nazev: string;
    role: string;
    active: boolean;
    poznamka: string;
    owner: string;
    indextime: Date;
}

export interface BaseEntity {
    id: string;
}

export interface Serializable {
}

export interface RestApplication {

    /**
     * HTTP POST /api/v2/auth/login/basic
     * Java method: cz.incad.nkp.inprove.auth.AuthApi.basicLogin
     */
    basicLogin(): RestResponse<void>;

    /**
     * HTTP GET /api/v2/auth/login/shibboleth
     * Java method: cz.incad.nkp.inprove.auth.AuthApi.shibbolethLogin
     */
    shibbolethLogin(): RestResponse<void>;

    /**
     * HTTP POST /api/v2/auth/logout
     * Java method: cz.incad.nkp.inprove.auth.AuthApi.shibbolethLogout
     */
    shibbolethLogout(): RestResponse<void>;

    /**
     * HTTP GET /api/v2/search/**
     * Java method: cz.incad.nkp.inprove.old.SearchApi.search
     */
    search(): RestResponse<{ [index: string]: any }>;

    /**
     * HTTP GET /api/v2/user/current
     * Java method: cz.incad.nkp.inprove.entities.user.search.UserSearchApi.getCurrentUser
     */
    getCurrentUser(): RestResponse<User>;

    /**
     * HTTP POST /api/v2/user/reset-password
     * Java method: cz.incad.nkp.inprove.entities.user.manager.UserManagerApi.resetPassword
     */
    resetPassword(dto: ResetPasswordDto): RestResponse<void>;

    /**
     * HTTP PUT /api/v2/user/{id}/change-password
     * Java method: cz.incad.nkp.inprove.entities.user.manager.UserManagerApi.changePassword
     */
    changePassword(id: string, newPassword: string): RestResponse<void>;

    /**
     * HTTP GET /api/v2/users/all
     * Java method: cz.incad.nkp.inprove.entities.user.old.UserApi.getAll
     */
    getAll(): RestResponse<{ [index: string]: any }>;

    /**
     * HTTP GET /api/v2/users/check
     * Java method: cz.incad.nkp.inprove.entities.user.old.UserApi.exists
     */
    exists(queryParams: { username: string; }): RestResponse<{ [index: string]: any }>;

    /**
     * HTTP GET /api/v2/users/info
     * Java method: cz.incad.nkp.inprove.entities.user.old.UserApi.getOne
     */
    getOne(queryParams: { code: string; }): RestResponse<User>;

    /**
     * HTTP POST /api/v2/users/login
     * Java method: cz.incad.nkp.inprove.entities.user.old.UserApi.login
     */
    login(loginRequest: { [index: string]: any }): RestResponse<{ [index: string]: any }>;

    /**
     * HTTP POST /api/v2/users/logout
     * Java method: cz.incad.nkp.inprove.entities.user.old.UserApi.logout
     */
    logout(): RestResponse<{ [index: string]: any }>;

    /**
     * HTTP POST /api/v2/users/resetpwd
     * Java method: cz.incad.nkp.inprove.entities.user.old.UserApi.resetPwd
     */
    resetPwd(resetPasswordDto: ResetPasswordDto): RestResponse<{ [index: string]: any }>;

    /**
     * HTTP POST /api/v2/users/save
     * Java method: cz.incad.nkp.inprove.entities.user.old.UserApi.save
     */
    save(user: User): RestResponse<User>;
}

export interface HttpClient {

    request<R>(requestConfig: { method: string; url: string; queryParams?: any; data?: any; copyFn?: (data: R) => R; }): RestResponse<R>;
}

export class RestApplicationClient implements RestApplication {

    constructor(protected httpClient: HttpClient) {
    }

    /**
     * HTTP POST /api/v2/auth/login/basic
     * Java method: cz.incad.nkp.inprove.auth.AuthApi.basicLogin
     */
    basicLogin(): RestResponse<void> {
        return this.httpClient.request({ method: "POST", url: uriEncoding`api/v2/auth/login/basic` });
    }

    /**
     * HTTP GET /api/v2/auth/login/shibboleth
     * Java method: cz.incad.nkp.inprove.auth.AuthApi.shibbolethLogin
     */
    shibbolethLogin(): RestResponse<void> {
        return this.httpClient.request({ method: "GET", url: uriEncoding`api/v2/auth/login/shibboleth` });
    }

    /**
     * HTTP POST /api/v2/auth/logout
     * Java method: cz.incad.nkp.inprove.auth.AuthApi.shibbolethLogout
     */
    shibbolethLogout(): RestResponse<void> {
        return this.httpClient.request({ method: "POST", url: uriEncoding`api/v2/auth/logout` });
    }

    /**
     * HTTP GET /api/v2/search/**
     * Java method: cz.incad.nkp.inprove.old.SearchApi.search
     */
    search(): RestResponse<{ [index: string]: any }> {
        return this.httpClient.request({ method: "GET", url: uriEncoding`api/v2/search/**` });
    }

    /**
     * HTTP GET /api/v2/user/current
     * Java method: cz.incad.nkp.inprove.entities.user.search.UserSearchApi.getCurrentUser
     */
    getCurrentUser(): RestResponse<User> {
        return this.httpClient.request({ method: "GET", url: uriEncoding`api/v2/user/current` });
    }

    /**
     * HTTP POST /api/v2/user/reset-password
     * Java method: cz.incad.nkp.inprove.entities.user.manager.UserManagerApi.resetPassword
     */
    resetPassword(dto: ResetPasswordDto): RestResponse<void> {
        return this.httpClient.request({ method: "POST", url: uriEncoding`api/v2/user/reset-password`, data: dto });
    }

    /**
     * HTTP PUT /api/v2/user/{id}/change-password
     * Java method: cz.incad.nkp.inprove.entities.user.manager.UserManagerApi.changePassword
     */
    changePassword(id: string, newPassword: string): RestResponse<void> {
        return this.httpClient.request({ method: "PUT", url: uriEncoding`api/v2/user/${id}/change-password`, data: newPassword });
    }

    /**
     * HTTP GET /api/v2/users/all
     * Java method: cz.incad.nkp.inprove.entities.user.old.UserApi.getAll
     */
    getAll(): RestResponse<{ [index: string]: any }> {
        return this.httpClient.request({ method: "GET", url: uriEncoding`api/v2/users/all` });
    }

    /**
     * HTTP GET /api/v2/users/check
     * Java method: cz.incad.nkp.inprove.entities.user.old.UserApi.exists
     */
    exists(queryParams: { username: string; }): RestResponse<{ [index: string]: any }> {
        return this.httpClient.request({ method: "GET", url: uriEncoding`api/v2/users/check`, queryParams: queryParams });
    }

    /**
     * HTTP GET /api/v2/users/info
     * Java method: cz.incad.nkp.inprove.entities.user.old.UserApi.getOne
     */
    getOne(queryParams: { code: string; }): RestResponse<User> {
        return this.httpClient.request({ method: "GET", url: uriEncoding`api/v2/users/info`, queryParams: queryParams });
    }

    /**
     * HTTP POST /api/v2/users/login
     * Java method: cz.incad.nkp.inprove.entities.user.old.UserApi.login
     */
    login(loginRequest: { [index: string]: any }): RestResponse<{ [index: string]: any }> {
        return this.httpClient.request({ method: "POST", url: uriEncoding`api/v2/users/login`, data: loginRequest });
    }

    /**
     * HTTP POST /api/v2/users/logout
     * Java method: cz.incad.nkp.inprove.entities.user.old.UserApi.logout
     */
    logout(): RestResponse<{ [index: string]: any }> {
        return this.httpClient.request({ method: "POST", url: uriEncoding`api/v2/users/logout` });
    }

    /**
     * HTTP POST /api/v2/users/resetpwd
     * Java method: cz.incad.nkp.inprove.entities.user.old.UserApi.resetPwd
     */
    resetPwd(resetPasswordDto: ResetPasswordDto): RestResponse<{ [index: string]: any }> {
        return this.httpClient.request({ method: "POST", url: uriEncoding`api/v2/users/resetpwd`, data: resetPasswordDto });
    }

    /**
     * HTTP POST /api/v2/users/save
     * Java method: cz.incad.nkp.inprove.entities.user.old.UserApi.save
     */
    save(user: User): RestResponse<User> {
        return this.httpClient.request({ method: "POST", url: uriEncoding`api/v2/users/save`, data: user });
    }
}

export type RestResponse<R> = Promise<R>;

function uriEncoding(template: TemplateStringsArray, ...substitutions: any[]): string {
    let result = "";
    for (let i = 0; i < substitutions.length; i++) {
        result += template[i];
        result += encodeURIComponent(substitutions[i]);
    }
    result += template[template.length - 1];
    return result;
}
