import { Inject, Injectable } from '@angular/core';
import { NgxMonacoEditorConfig, NGX_MONACO_EDITOR_CONFIG } from './config';

@Injectable()
export class MonacoEditorLoader {
    constructor(
        @Inject(NGX_MONACO_EDITOR_CONFIG)
        protected config: NgxMonacoEditorConfig
    ) {
    }

    private _loaded: Promise<void>;

    /**
     * Load the Monaco editor immediately. This is automatically called when an editor component is loaded,
     * but it may be useful to call it manually to ensure that Monaco is loaded earlier for reasons like 
     * preparing language defaults etc.
     * @returns 
     */
    load() {
        return this._loaded ??= new Promise<void>((resolve: any) => {
            const baseUrl = (this.config.baseUrl || './assets') + '/monaco-editor/min/vs';
            if (typeof ((<any>window).monaco) === 'object') {
                resolve();
                return;
            }
            const onGotAmdLoader: any = () => {
                // Load monaco
                (<any>window).require.config({ paths: { 'vs': `${baseUrl}` } });
                (<any>window).require([`vs/editor/editor.main`], () => {
                    if (typeof this.config.onMonacoLoad === 'function') {
                        this.config.onMonacoLoad();
                    }
                    resolve();
                });
            };

            // Load AMD loader if necessary
            if (!(<any>window).require) {
                const loaderScript: HTMLScriptElement = document.createElement('script');
                loaderScript.type = 'text/javascript';
                loaderScript.src = `${baseUrl}/loader.js`;
                loaderScript.addEventListener('load', onGotAmdLoader);
                document.body.appendChild(loaderScript);
            } else {
                onGotAmdLoader();
            }
        });
    }

}