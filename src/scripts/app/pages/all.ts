import { APP, callbackGetValue } from "../app";

import * as TOOLS_BASE64 from "./tools/base64";
import * as TOOLS_EDITOR from "./tools/editor";
import * as TOOLS_XRUNNER from "./tools/xrunner";
import * as TOOLS_PAINTER from "./tools/painter";
import * as TOOLS_RXMLEDITOR from "./tools/rxmleditor";

export interface PageType {
    [index: string] : {
        button?: JQuery;
        init?: (app: APP) => void;
        categorizes?: string[];
        navbar?: "default" | any;
        pages: "default" | any;
        events: boolean;
        search: boolean;
        newpage?: boolean;
    },
}

let categorizes: { title: string | callbackGetValue<string>, icon: string | callbackGetValue<string>, id: string}[] = [
    {
        title: " 编程工具",
        icon: "fa fa-cube",
        id: "programming"
    },
    {
      title: " 艺术工具",
      icon: "fa fa-paintbrush",
      id: "art",
    },
    {
        title: " 其他工具",
        icon: "fa fa-layer-group",
        id: "other",
    },
];

let pages: PageType = {
    "/tools/base64": {
        button: $("<button class='btn btn-primary'>").append($("<i class='fa fa-floppy-disk'>")).append(" Base64 编码/解码"),
        navbar: "default",
        pages: TOOLS_BASE64.getPageContext,
        events: true,
        search: true,
        init: TOOLS_BASE64.initialize,
        categorizes: ["programming"],
    },
    "/tools/editor": {
        button: $("<button class='btn btn-primary'>").append($("<i class='fa fa-file-code'>")).append(" 在线代码编辑器"),
        navbar: "default",
        pages: TOOLS_EDITOR.getPageContext,
        events: true,
        search: true,
        init: TOOLS_EDITOR.initialize,
        categorizes: ["programming"],
    },
    "/tools/xrunner": {
        button: $("<button class='btn btn-primary'>").append($("<i class='fa fa-folder'>").append(" X代码测试器")),
        navbar: "default",
        pages: (...args) => [],
        events: true,
        search: true,
        init: TOOLS_XRUNNER.initialize,
        categorizes: ["programming"],
    },
    "/tools/painter": {
        button: $("<button class='btn btn-primary'>").append($("<i class='fa fa-palette'>").append(" 画板")),
        pages: (...args) => [],
        events: true,
        search: true,
        init: TOOLS_PAINTER.initialize,
        categorizes: ["art"],
    },
    "/tools/rxmleditor": {
        button: $("<button class='btn btn-primary'>").append($("<i class='fa fa-file-circle-xmark'>").append(" RXML编辑器")),
        pages: (...args) => [],
        events: true,
        search: true,
        navbar: "default",
        init: TOOLS_RXMLEDITOR.initialize,
        categorizes: ["other"],
    }
};

export {
    pages, categorizes
};
