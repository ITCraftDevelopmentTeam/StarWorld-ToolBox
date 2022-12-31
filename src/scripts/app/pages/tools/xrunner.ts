import $ from "jquery";
import _ from "lodash";

import {APP} from "../../app";
import {EditorState} from "@codemirror/state";
import {EditorView, hoverTooltip, keymap,} from "@codemirror/view";
import {javascript, localCompletionSource, snippets} from "@codemirror/lang-javascript";
import {basicSetup} from "codemirror";
import {xcodeLight} from "@uiw/codemirror-theme-xcode";
import {historyKeymap, insertTab, standardKeymap} from "@codemirror/commands";
import {autocompletion, snippetCompletion} from "@codemirror/autocomplete";
import {createModal as manageModule} from "./editor";

import FileSystem from "memory-fs";
import repr from "object-inspect";
import escodegen from "escodegen";

export const fs = new FileSystem();

export function strip (str: string, char: string, type?: "left" | "right") {
    if (char) {
        if (type == 'left') {
            return str.replace(new RegExp('^\\' + char + '+', 'g'), '');
        } else if (type == 'right') {
            return str.replace(new RegExp('\\' + char + '+$', 'g'), '');
        }
        return str.replace(new RegExp('^\\' + char + '+|\\' + char + '+$', 'g'), '');
    }
    return str.replace(/^\s+|\s+$/g, '');
}

export const keywords = [
    'break',    'case',    'const',
    'continue', 'default', 'delete',
    'export',   'extends', 'false',
    'finally',  'in',      'instanceof',
    'let',      'new',     'return',
    'static',   'super',   'switch',
    'this',     'throw',   'true',
    'typeof',   'var',     'yield',
    'function', 'class',   'import',
    'from'
];

export function textHover (view: EditorView, pos, side) {
    let {from, to, text} = view.state.doc.lineAt(pos);
    let start = pos, end = pos;
    let regexp = /^([^\x00-\xff]|[a-zA-Z0-9_$.])*$/;
    while (start > from && regexp.test(text[start - from - 1])) start--;
    while (end < to && regexp.test(text[end - from])) end++;
    if (start == pos && side < 0 || end == pos && side > 0) return null;
    return {
        pos: start,
        end,
        above: true,
        create (view) {
            let mouseText = strip(text.slice(start - from, end - from).trim(), ".");
            const outputContent = output.text();
            const outputHTML = output.html();
            let windowContext = _.clone(context);
            try {
                new Evaluator(Array.from(view.state.doc).join("").replaceAll("top", "<top>").replaceAll("parent", "<parent>"), windowContext,
                    {
                        removeTimeout: 0,
                    }
                ).evaluate();
            } catch {
                try{
                    new Evaluator("", windowContext,
                        {
                            removeTimeout: 0,
                        }
                    ).evaluate();
                } catch {}

            }
            setTimeout(
                () => {
                    output.html(outputHTML);
                    output.text(outputContent);
                }
            );
            let dom = $("<ul class='list-group sw-tooltip shadow sw-scroll-dark'>").css(
                {
                    "border": "none",
                }
            );
            try {
                let value = _.get(windowContext, mouseText);
                let valueType: string = typeof value;
                if (["true", "false", "this"].indexOf(mouseText) != -1) {
                    switch (mouseText) {
                        case "true": valueType = "Boolean"; value = true; break;
                        case "false": valueType = "boolean"; value = false; break;
                        case "this": valueType = "ThisType"; value = windowContext["window"]; break;
                    }
                } else if (keywords.indexOf(mouseText) != -1) {
                    value = mouseText;
                    valueType = "KeyWord";
                } else {
                    if (valueType == "undefined") {
                        valueType = "Unknown";
                    } else {
                        try {
                            valueType = Object.prototype.toString.call(value).match(/^\[object\s(.*)]$/)[1];
                        } catch {}
                    }
                }
                try {
                    if (value == null) value = mouseText;
                    else value = (repr(value) || String(value));
                } catch {
                    value = String(value);
                }
                dom.append(
                    $("<li class='list-group-item text-truncate'>").append(
                        $("<span style='color: #099fcc;'>").text(`(${valueType}) `),
                        $("<span style='color: #ffa900;'>").text(`[${mouseText}] `),
                        $("<span style='color: #a87ecb;'>").text(`${value} `)
                    ).css("border", "none")
                );
            } catch (e) {
                dom.append(
                    $("<li class='list-group-item text-truncate'>").append(
                        $("<span style='color: #099fcc;'>").text(`(Unknown) `),
                        $("<span style='color: #ffa900;'>").text(`[${mouseText}] `),
                        $("<span style='color: #a87ecb;'>").text(`${mouseText} `)
                    ).css("border", "none")
                );
            }
            return {
                dom: dom.get(0)
            };
        }
    };
}

export function editorAutoComplete (codeContext) {
    let windowKeys = [];
    let windowContext = _.clone(context);
    const outputContent = output.text();
    const outputHTML = output.html();
    try {
        windowContext = new Evaluator("window", windowContext,
            {
                removeTimeout: 0,
            }
        ).evaluate()[0];
        windowContext = new Evaluator(Array.from(codeContext.state.doc).join("").replaceAll("top", "<top>").replaceAll("parent", "<parent>"), windowContext,
            {
                removeTimeout: 0,
            }
        ).evaluateChained().evaluateScript("window")[0];
    } catch {}
    setTimeout(
        () => {
            output.html(outputHTML);
            output.text(outputContent);
        }
    );
    let text = (codeContext.matchBefore(/([^\x00-\xff]|[a-zA-Z_$])([^\x00-\xff]|[a-zA-Z0-9_$.\[\]])+/) || codeContext.matchBefore(/([^\x00-\xff]|[a-zA-Z_$])/) || {text: ""}).text;
    if (text != "") {
        let keys: any[] = [];
        try {
            let path = text.split(".").slice(0, text.split(".").length - 1).join(".").replaceAll("[", ".").replaceAll("]", "");
            let pathList: string[] = path.split(".");
            for (let j in pathList) {
                let i = pathList[j];
                if (!isNaN(i as any)) {
                    pathList[j] = `[${i}]`;
                }
            }
            let getObject = _.get(windowContext, path) || windowContext[path];
            let objectKeys: string[] = Object.getOwnPropertyNames(getObject);
            try {
                if ("constructor" in getObject) {
                    if ("prototype" in getObject["constructor"]) {
                        for (let i of Object.getOwnPropertyNames(getObject.constructor.prototype || {})) {
                            if (i in (getObject || {})) objectKeys.push(i);
                        }
                    }

                }
            } catch {}
            objectKeys = Array.from(new Set(objectKeys));
            let displayPath = "";
            for (let j in pathList) {
                let i: string = pathList[j];
                if (i.startsWith("[")) {
                    displayPath += i;
                } else {
                    displayPath += "." + i;
                }
            }
            displayPath = strip(displayPath, ".");
            for (let i of objectKeys) {
                let display = i;
                if (!isNaN(i as any)) {
                    display = `[${i}]`;
                    i = "." + i;
                } else {
                    display = "." + i;
                    i = "." + i;
                }
                keys.push(
                    {
                        type: "snippet",
                        value: snippetCompletion(
                            displayPath + display, {
                                label: path + i,
                            }
                        )
                    }
                );
            }
        } catch (e) {
            for (let i of Object.getOwnPropertyNames(windowContext)) {
                keys.push(
                    {
                        type: "text",
                        value: i,
                    }
                )
            }
        }
        for (let item of keys) {
            if (item.type == "snippet") {
                windowKeys.push(item.value);
                continue;
            } else if (item.type == "text") {
                item = item.value;
            }
            let type = "variable";
            let value = _.get(windowContext, item);
            if (typeof value === "function" && "prototype" in value) {
                if (Object.getOwnPropertyNames(value.prototype).length == 1 && Object.getOwnPropertySymbols(value.prototype).length == 0) {
                    if (Object.getOwnPropertyNames(value.prototype)[0] == "constructor") type = "namespace";
                    else type = "class";
                } else {
                    type = "class";
                }
            } else if (_.isFunction(value)) {
                type = "function";
            }
            try {
                windowKeys.push(
                    {
                        label: item,
                        type: type,
                        info: item + ": " + repr(_.get(windowContext, item)),
                    }
                );
            } catch {
                windowKeys.push(
                    {
                        label: item,
                        type: type,
                        info: item,
                    }
                );
            }

        }
    }
    keywords.forEach(
        (item) => {
            windowKeys.push(
                {
                    type: "keyword",
                    label: item,
                    info: item,
                }
            );
        }
    );
    let keywordSnippets = [
        snippetCompletion("let ${name} = ${value}", {label: "let", detail: "definition", type: "keyword"}),
        snippetCompletion("const ${name} = ${value}", {label: "const", detail: "definition", type: "keyword"}),
        snippetCompletion("var ${name} = ${value}", {label: "var", detail: "definition", type: "keyword"}),
        snippetCompletion("delete ${name}", {label: "delete", detail: "identifier", type: "keyword"}),
        snippetCompletion("scriptX.require(${name})", {label: "require", detail: "synchronous", type: "function",}),
        snippetCompletion("scriptX.requireAsync(${name}).then(\n    (module) => {}\n).catch(echoRepr)", {label: "require", detail: "asynchronous", type: "function"}),
        snippetCompletion("scriptX.require(${name}, false)", {label: "require", detail: "eval use synchronous", type: "function",}),
        snippetCompletion("scriptX.requireAsync(${name}, false).then(\n    (module) => {}\n).catch(echoRepr)", {label: "require", detail: "eval use asynchronous", type: "function",}),
        snippetCompletion("scriptX.requireBuiltIn(${name})", {label: "require", detail: "built-in use synchronous", type: "function",}),
        snippetCompletion("scriptX.requireBuiltInAsync(${name}).then(\n    (module) => {}\n).catch(echoRepr)", {label: "require", detail: "built-in use asynchronous", type: "function",}),
    ];
    let before = codeContext.matchBefore(/([^\x00-\xff]|[a-zA-Z_$])([^\x00-\xff]|[a-zA-Z0-9_$.\[\]])+/) || codeContext.matchBefore(/([^\x00-\xff]|[a-zA-Z_$])/);
    if (!codeContext.explicit && !before) return null;
    return {
        from: before ? before.from : codeContext.pos,
        options: [
            ...windowKeys,
            ...snippets,
            ...keywordSnippets,
        ],
        validFor: /^([^\x00-\xff]|[a-zA-Z0-9_$][.])*$/,
    };
}

export function createEditor (parent: JQuery) {
    return new EditorView(
        {
            state: EditorState.create(
                {
                    doc: [
                        `scriptX.requireBuiltIn('jquery').exports.jQuery(                        `,
                        `  $ => {                                                                `,
                        `    scriptX.requireBuiltIn('lodash').exports.lodash(                    `,
                        `      scriptX.requireBuiltIn('modulex').exports.getAllBuiltInModules()  `,
                        `    ).every(                                                            `,
                        `      (item) => {                                                       `,
                        `        echo(                                                           `,
                        `          item + ': [',                                                 `,
                        `          Object.keys(                                                  `,
                        `            scriptX.requireBuiltIn(item).exports                        `,
                        `          ).join(', '),                                                 `,
                        `          ']'                                                           `,
                        `        );                                                              `,
                        `        echo('\\n');                                                    `,
                        `        return true;                                                    `,
                        `      }                                                                 `,
                        `    );                                                                  `,
                        `  }                                                                     `,
                        `);                                                                      `,
                    ].join("\n"),
                    extensions: [
                        keymap.of(
                            [
                                ...standardKeymap,
                                ...historyKeymap,
                                {
                                    "key": "Tab",
                                    run: insertTab
                                }
                            ],
                        ),
                        basicSetup, javascript(), hoverTooltip(textHover), xcodeLight, autocompletion({override: [localCompletionSource, editorAutoComplete]})
                    ],
                }
            ),
            parent: parent.get(0),
        }
    );
}

namespace ScriptX {

    export class Module {
        public code: string;
        public url: string;
        public parent: ScriptX.Module;
        public childrens: ScriptX.Module[];
        public exports: any;

        public loader: Evaluator;

        public require: Function;
        public requireAsync: Function;
        public requireBuiltIn: Function;
        public requireBuiltInAsync: Function;

        public static from (module: ScriptX.Module): ScriptX.Module {
            return new ScriptX.Module(module.url, module.code, module.parent, module.childrens, module.exports, module.loader);
        }

        public constructor (url: string, code: string, parent: ScriptX.Module, childrens: ScriptX.Module[], exports: any, loader: Evaluator) {
            let that = this;
            this.url = url;
            this.code = code;
            this.parent = parent;
            this.childrens = childrens;
            this.exports = exports;
            this.loader = loader;
            this.require = (url: string, runInVM: boolean = true): ScriptX.Module => {
                if (url.startsWith("scriptx-builtin:")) url = url.trimEnd();
                for (let i of that.childrens) if (i.url == url) return i;
                let loader: Evaluator, code = $.ajax(url, {async: false, crossDomain: true, headers: {"Content-Type": "application/json"}}).responseText;
                if (runInVM) {loader = new Evaluator(code).evaluateChained();} else {loader = that.loader.evaluateScriptChained(code);}
                let module = new ScriptX.Module(url, code, that, [], loader.context, loader);
                that.childrens.push(module);
                return module;
            };
            this.requireBuiltIn = (name: string): ScriptX.Module => {
                name = name.trim();
                for (let i of that.childrens) if (i.url === "builtin:" + name) return i;
                let modules = {
                    lodash: {_, lodash: _},
                    jquery: {$, jQuery: $},
                };
                let modulesDefault = {fs};
                modules = Object.assign(modules, modulesDefault);
                modules["modulex"] = {
                    getAllBuiltInModules (): string[] {return _.keys(modules)},
                };
                if (!(name in modules)) throw new ReferenceError(`Module Not Found: ${JSON.stringify(name)}`);
                let loader = new Evaluator("").evaluateChained();
                loader.context = modules[name];
                try {loader.cacheWindow = Object.assign(loader.cacheWindow, modules[name]);} catch {}
                let module = new ScriptX.Module("scriptx-builtin:" + name, "/* Native Code */", that, [], modules[name], loader);
                this.childrens.push(module)
                return module;
            };
            this.requireAsync = async (url: string, runInVM: boolean = true): Promise<ScriptX.Module> => new Promise((resolve, reject) => { try { resolve(that.require(url, runInVM)); } catch (e) { reject(e); } });
            this.requireBuiltInAsync = async (name: string): Promise<ScriptX.Module> => new Promise((resolve, reject) => { try { resolve(that.requireBuiltIn(name)); } catch (e) { reject(e); } });
        }
    }
}

export namespace ScriptXAST {
    export function getRequireCodeWithExports (moduleName: string) {
        let ast = {"type": "Program", "body": [{"type": "ExpressionStatement", "expression": {"type": "AssignmentExpression", "operator": "=", "left": {"type": "MemberExpression", "computed": true, "object": {"type": "LogicalExpression", "operator": "||", "left": {"type": "Identifier", "name": "modules"}, "right": {"type": "ObjectExpression", "properties": []}}, "property": {"type": "Literal", "value": moduleName}}, "right": {"type": "MemberExpression", "computed": false, "object": {"type": "CallExpression", "callee": {"type": "MemberExpression", "computed": false, "object": {"type": "Identifier", "name": "scriptX"}, "property": {"type": "Identifier", "name": "require"}}, "arguments": [{"type": "Literal", "value": moduleName}]}, "property": {"type": "Identifier", "name": "exports"}}}}], "sourceType": "script"};
        return escodegen.generate(ast);
    }
}

export type VMCallback = (window: any, context: any) => void;
export interface VMOptions {
    scriptType: "eval" | "script" | "script-module" | string;
    removeTimeout: number;
}

export class VM {

    public context: object = {};

    public static defaultVMOptions (): VMOptions {
        return {
            scriptType: "eval",
            removeTimeout: 0,
        };
    };

    constructor (context: object = {}) {
        this.context = Object.assign(this.context, context);
    }

    public runInThisContext(code: string, ...args): any {
        return VM.runInContext(code, this.context, ...args);
    }

    public static runInContext(code: string, context: object, callback?: VMCallback, options: VMOptions = VM.defaultVMOptions()): [any, JQuery, JQuery] {
        let frame = $("<iframe>").prop("style", {}).hide().appendTo(document.body);
        let win: typeof window = frame.prop("contentWindow").window;
        for (let i of Object.getOwnPropertyNames(context)) {
            try {
                win[i] = context[i];
            } catch {}
        }
        if (callback) callback(win, context);
        let result;
        let error = null;
        if (options.scriptType == "eval"){
            try{
                result = [win.eval.call(win, code), win.document.body, frame];
            } catch (e) {
                error = e;
            }
        } else if (options.scriptType == "script") {
            result = [$("<script type='text/javascript'>").text(code).appendTo(win.document.body), $(win.document.body), frame];
        } else if (options.scriptType == "script-module") {
            result = [$("<script type='module'>").text(code).appendTo(win.document.body), $(win.document.body), frame];
        } else {
            result = [$("<script>").attr("type", options.scriptType).text(code).appendTo(win.document.body), $(win.document.body), frame];
        }
        for (let i of Object.getOwnPropertyNames(win)) {
            try {
                context[i] = win[i];
            } catch {}
        }
        if (!(options.removeTimeout < 0)) {
            if (options.removeTimeout == 0) frame.remove();
            else setTimeout(() => frame.remove(), options.removeTimeout);
        }
        if (error != null) throw error;
        return result;
    }

    public static runInNewContext(code, ...args): any {
        return VM.runInContext(code, {}, ...args);
    }

}

export class Evaluator {

    public code: string;
    public context: object;
    public cacheWindow: object;
    public options: VMOptions;

    public module: ScriptX.Module;

    constructor (code: string, context: object = {}, options: VMOptions | any = VM.defaultVMOptions()) {
        this.code = code;
        this.context = context;
        this.module = new ScriptX.Module("", code, null, [], this.context, this);
        this.options = Object.assign(VM.defaultVMOptions(), options);
    }

    public evaluate (): any {
        return this.evaluateScript(this.code);
    }

    public evaluateScript (code: string): any {
        let that = this;
        return VM.runInContext(
            code, this.context,
            (win, context) => {
                that.initializeContext(win, win);
                that.initializeContext(context, win);
            },
            this.options
        );
    }

    public evaluateScriptChained (code: string): this {
        this.evaluateScript(code);
        return this;
    }

    public evaluateChained (): this {
        this.evaluate();
        return this;
    }

    public initializeContext (context: object, win: object): void {
        let that = this;
        this.cacheWindow = win;
        let ScriptX = {};
        Evaluator.defineContextItem(ScriptX, "module", this.module, {writable: false, configurable: false});
        Evaluator.defineContextItem(ScriptX, "require", that.module.require);
        Evaluator.defineContextItem(ScriptX, "requireAsync", that.module.requireAsync);
        Evaluator.defineContextItem(ScriptX, "requireBuiltIn", that.module.requireBuiltIn);
        Evaluator.defineContextItem(ScriptX, "requireBuiltInAsync", that.module.requireBuiltInAsync)
        Evaluator.defineContextItem(context, "scriptX", ScriptX);

        Evaluator.defineContextItem(context, "Buffer", Buffer);
    }

    public static defineContextItem (x: object, key: PropertyKey, value: any, options: PropertyDescriptor & ThisType<any>={}): boolean {
        try {
            x[key] = value;
            Object.defineProperty(
                x, key, Object.assign({
                    value: value,
                }, options)
            );
            return true;
        } catch {
            try {
                Object.defineProperty(
                    x, key, Object.assign({
                        value: value,
                    }, options)
                );
                return true;
            } catch {
                x[key] = value;
                return false;
            }
        }
    }
}

export function call (func, ...args) {
    return func(...args)
}

export const output = $("<textarea readonly class='form-control' placeholder='无内容'>").hide();

export let context = {
    echo: call(
        () => {
            let echo =  (...args): void => {
                args.forEach(
                    (item) => {
                        let container = $(echo["container"]);
                        container.text(output.text() + String(item));
                        container.scrollTop(container.height());
                    }
                );
            };
            echo["container"] = output;
            echo["clear"] = () => $(echo["out"]).text("");
            return echo;
        }
    ),
    echoRepr: (...args) => {
        args.forEach(
            (item) => {
                context.echo(repr(item));
            }
        );
    },
    repr,
    Circular: call(
        () => {
            let x = [];
            x[0] = x;
            return x;
        }
    )
};

export let importModules: string[] = [];

export async function initialize (app: APP) {
    let container = $("<div class='container'>");
    let editorContainer = $("<div class='container'>");
    let editor = $("<div>").appendTo(editorContainer).addClass("form-control cm-no-outline sw-editor").css("padding", "0.1rem");
    let codemirror = createEditor(editor);
    let currentIframe = {iframe: $("<iframe>")};
    let selectScriptType = $("<select class='form-select'>").append(
        $("<option value='script-module' selected>").text("Script (Module)"),
        $("<option value='script'>").text("Script"),
        $("<option value='eval'>").text("Evaluate"),
    );
    container.append(
        $("<div class='container'>").append(
            selectScriptType,
            "<br>"
        ),
        editorContainer
    ).append(
        $("<div class='container'>").append(
            $("<br>"),
            $("<div class='btn-group'>").append(
                $("<button class='btn btn-primary'>").text("运行").on(
                    "click", () => {
                        output.text("").show();
                        currentIframe.iframe.remove();
                        let evaluator = new Evaluator(
                            Array.from<string>(codemirror.state.doc).join(""),
                            context, {
                                scriptType: selectScriptType.val(),
                                removeTimeout: -1,
                            }
                        );
                        try {
                            currentIframe.iframe = evaluator.evaluate()[2];
                        } catch (e) {
                            output.text(output.text() + "\n" + (e.stack || Error(e).stack));
                        }
                    }
                ),
                $("<button class='btn btn-primary'>").text("清空").on(
                    "click", () => {
                        output.text("").hide();
                        currentIframe.iframe.remove();
                    }
                ),
                $("<button class='btn btn-primary'>").text("库管理").on(
                    "click", () => {
                        manageModule(app, container, importModules).modalBody.find(".input-group").prepend(
                            $("<button class='btn btn-primary'>").text("安装").on(
                                "click", () => {
                                    let doc = Array.from(codemirror.state.doc).join(" ");
                                    let code = [
                                        "var modules = {};",
                                    ];
                                    importModules.forEach(
                                        (item) => {
                                            code.push(
                                                ScriptXAST.getRequireCodeWithExports(item)
                                            );
                                        }
                                    );
                                    if (!(doc).startsWith(code.join("\n"))) {
                                       $(codemirror.contentDOM).text(code.join("\n")+ "\n\n" + doc,);
                                    }
                                }
                            )
                        );
                    }
                ),
            ),
            $("<br>"),
            $("<br>"),
            output
        )
    );
    container.appendTo(app.app);
}
