# @/monaco
## Monaco Editor Component for Angular

[![Version](https://img.shields.io/npm/v/@astronautlabs/monaco.svg)](https://www.npmjs.com/package/@astronautlabs/monaco)

> **Stable**  
> This software is ready for production use.

# Setup

> **Which version should I use for my version of Angular?**  
> As new Angular versions are released, the major version of this library will always match the major version of Angular.

```bash
npm install monaco-editor @astronautlabs/monaco@12 --save # eg, for Angular 12
 ```

You must include the monaco-editor assets in the build so they can be loaded at runtime:
```typescript
// in projects.[project-name].architect.build:
{
  "options": {
    {
      "assets": [
        { "glob": "**/*", "input": "node_modules/monaco-editor", "output": "assets/monaco-editor" }
      ],
      ...
    }
    ...
  },
  ...
}
 ```

# Referencing Monaco Types

**Important**: Monaco is loaded dynamically at runtime. You should only use `import type` or `/// <reference ...>` when accessing types from the `monaco-editor` package to avoid loading Monaco twice which can cause reference confusion.

However, Monaco's `monaco` global cannot be represented to Typescript using, for instance, `import type * as monaco from 'monaco-editor'`. 

The other solution is to use `/// <reference ...>`, but unfortunately the type declarations found by Typescript when using `// <reference types="monaco-editor" />` is the editor API which is incorrect.

A working solution is the following:

```typescript
/// <reference path="../../node_modules/monaco-editor/monaco.d.ts" />
monaco.languages // <-- Correct Typescript types and no undefined variable "monaco" error
```

Unfortunately this means you will need to vary this directive based on where a source file is within your application.

# Add the Angular Module

Include `MonacoEditorModule`:

```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { MonacoEditorModule } from '@astronautlabs/monaco';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    MonacoEditorModule.forRoot({
      // Options
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
```

Make sure to also import `MonacoEditorModule` (without `.forRoot()`) in each module that you use `<ngx-monaco-editor>`

# Using the Editor

In most cases you'll want to specify options for particular instances of Monaco:
```typescript
import { Component } from '@angular/core';
import type * as monaco from 'monaco-editor';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    theme: 'vs-dark', 
    language: 'javascript'
  };

  code: string = 'function x() {\nconsole.log("Hello world!");\n}';
}
```

HTML

```html
<ngx-monaco-editor [options]="editorOptions" [(ngModel)]="code"></ngx-monaco-editor>
```

# Using the Diff Editor

```typescript
import { Component } from '@angular/core';
import { DiffEditorModel } from '@astronautlabs/monaco';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  options = {
    theme: 'vs-dark'
  };
  originalModel: DiffEditorModel = {
    code: 'heLLo world!',
    language: 'text/plain'
  };

  modifiedModel: DiffEditorModel = {
    code: 'hello orlando!',
    language: 'text/plain'
  };
}
```

HTML

```html
<ngx-monaco-diff-editor [options]="options" [originalModel]="originalModel" [modifiedModel]="modifiedModel"></ngx-monaco-diff-editor>
```

# Styling
To match height of container element add height: 100% and wrap in container
```html
<div style="height: 500px">
    <ngx-monaco-editor style="height: 100%" [options]="editorOptions" [(ngModel)]="code"></ngx-monaco-editor>
</div>
```
Add class to editor tag. (eg. class="my-code-editor")
```html
<ngx-monaco-editor class="my-code-editor" [options]="editorOptions" [(ngModel)]="code"></ngx-monaco-editor>
```
Add styling in css/scss file:
```scss
.my-code-editor {
  .editor-container {
    height: calc(100vh - 100px);
  }
}
```
Set automaticLayout option to adjust editor size dynamically. Recommended when using in modal dialog or tabs where editor is not visible initially.

# Events
Output event (onInit) expose editor instance that can be used for performing custom operations on the editor. 
```html
<ngx-monaco-editor [options]="editorOptions" [(ngModel)]="code" (onInit)="onInit($event)"></ngx-monaco-editor>
```

```typescript
export class AppComponent {
  editorOptions = {theme: 'vs-dark', language: 'javascript'};
  code: string= 'function x() {\nconsole.log("Hello world!");\n}';
  onInit(editor) {
      let line = editor.getPosition();
      console.log(line);
    }
}
```

# Configuration

`forRoot()` method of MonacoEditorModule accepts config of type `NgxMonacoEditorConfig`.
```typescript
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { MonacoEditorModule, NgxMonacoEditorConfig } from '@astronautlabs/monaco';
import { AppComponent } from './app.component';

const monacoConfig: NgxMonacoEditorConfig = {
  baseUrl: 'app-name/assets', // configure base path cotaining monaco-editor directory after build default: './assets'
  defaultOptions: { scrollBeyondLastLine: false }, // pass default options to be used
  onMonacoLoad: () => { console.log((<any>window).monaco); } // here monaco object will be available as window.monaco use this function to extend monaco editor functionalities.
};

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    MonacoEditorModule.forRoot(monacoConfig)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
```

# Language Defaults
`onMonacoLoad` property of `NgxMonacoEditorConfig` can be used to configure language defaults.

```typescript
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { MonacoEditorModule, NgxMonacoEditorConfig } from '@astronautlabs/monaco';
import { AppComponent } from './app.component';

export function onMonacoLoad() {

  console.log((window as any).monaco);

  const uri = monaco.Uri.parse('a://b/foo.json');
  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    validate: true,
    schemas: [{
      uri: 'http://myserver/foo-schema.json',
      fileMatch: [uri.toString()],
      schema: {
        type: 'object',
        properties: {
          p1: {
            enum: ['v1', 'v2']
          },
          p2: {
            $ref: 'http://myserver/bar-schema.json'
          }
        }
      }
    }, {
      uri: 'http://myserver/bar-schema.json',
      fileMatch: [uri.toString()],
      schema: {
        type: 'object',
        properties: {
          q1: {
            enum: ['x1', 'x2']
          }
        }
      }
    }]
  });

}

const monacoConfig: NgxMonacoEditorConfig = {
  baseUrl: 'assets',
  defaultOptions: { scrollBeyondLastLine: false },
  onMonacoLoad
};

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    MonacoEditorModule.forRoot(monacoConfig)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
```

Now pass model config of type `NgxEditorModel` to Editor Component
```typescript
@Component({
  selector: 'app-root',
  template: `<ngx-monaco-editor [options]="options" [model]="model"></ngx-monaco-editor>`,
  styles: []
})
export class AppComponent {
  options = {
    theme: 'vs-dark'
  };
  
  jsonCode = [
    '{',
    '    "p1": "v3",',
    '    "p2": false',
    '}'
  ].join('\n');

  model: NgxEditorModel = {
    value: this.jsonCode,
    language: 'json',
    uri: monaco.Uri.parse('a://b/foo.json')
  };
}
```

# Resources

- [Monaco Editor](https://github.com/Microsoft/monaco-editor/)
    - [Options](https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ieditorconstructionoptions.html)
