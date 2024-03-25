import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, OnDestroy, Output, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { NGX_MONACO_EDITOR_CONFIG, NgxMonacoEditorConfig } from './config';
import { MonacoEditorLoader } from './editor-loader.service';

let loadedMonaco = false;
let loadPromise: Promise<void>;

@Component({
  template: ''
})
export abstract class BaseEditor implements AfterViewInit, OnDestroy {
  @ViewChild('editorContainer', { static: true }) _editorContainer: ElementRef;
  @Output() onInit = new EventEmitter<any>();
  protected _editor: any;
  protected _options: any = {};
  protected _windowResizeSubscription: Subscription;

  constructor(
    @Inject(NGX_MONACO_EDITOR_CONFIG) protected config: NgxMonacoEditorConfig,
    private loader: MonacoEditorLoader
  ) {
  }

  async ngAfterViewInit() {
    await this.loader.load();
    this.initMonaco(this._options);
  }

  protected abstract initMonaco(options: any): void;

  ngOnDestroy() {
    if (this._windowResizeSubscription) {
      this._windowResizeSubscription.unsubscribe();
    }
    if (this._editor) {
      this._editor.dispose();
      this._editor = undefined;
    }
  }
}
