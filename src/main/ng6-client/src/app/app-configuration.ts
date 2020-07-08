import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Configuration } from './shared/configuration';

@Injectable({
    providedIn: 'root'
}) export class AppConfiguration {

    private config: Configuration;
    public invalidServer: boolean;

    public configured: boolean;

    public get defaultLang() {
        return this.config.defaultLang;
    }
    public get context() {
        return this.config.context;
    }

    public get owners() {
        return this.config.owners;
    }

    public get znak_oznaceni_vydani() {
        return this.config.znak_oznaceni_vydani;
    }

    public get states() {
        return this.config.states;
    }

    public get stavy() {
        return this.config.stavy;
    }

    public get vdkFormats() {
        return this.config.vdkFormats;
    }

    public get periodicity() {
        return this.config.periodicity;
    }

    public get vydani() {
        return this.config.vydani;
    }

    public get mutations() {
        return this.config.mutations;
    }

    public get icons() {
        return this.config.icons;
    }

    public get expiredTime() {
        return this.config.expiredTime;
    }

    /**
     * List the files holding section configuration in assets/configs folder
     * ['search'] will look for /assets/configs/search.json
     */
    private configs: string[] = [];

    constructor(
        private http: HttpClient) { }

    public configLoaded() {
        return this.config && true;
    }

    public load(): Promise<any> {
        console.log('loading app...');
        const promise = this.http.get('assets/config.json')
            .toPromise()
            .then(cfg => {
                this.config = cfg as Configuration;
                this.configured = true;
            }).then(() => {
                return this.loadConfigs();
            });
        return promise;
    }

    async loadConfigs(): Promise<any> {

        // Load common configs
        this.configs.forEach(async config => {
            const url = 'assets/configs/' + config + '.json';
            const value = await this.mergeFile(url) as string;
            if (value) {
                this.config[config] = value;
            } else {
                console.log(url + ' not found');
            }
        });

        return new Promise((resolve, reject) => {
            resolve();
        });
    }

    mergeFile(url: string): Promise<any> {

        return new Promise((resolve, reject) => {
            this.http.get(url)
                .subscribe(
                    res => {
                        resolve(res);
                    },
                    error => {
                        resolve(false);
                        return of(url + ' not found');
                    }
                );
        });
    }

}
