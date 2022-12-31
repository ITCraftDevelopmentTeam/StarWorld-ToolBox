import * as $ from "jquery";

import { APP } from "../../app";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { basicSetup } from "codemirror";
import { xcodeDark } from "@uiw/codemirror-theme-xcode";

import { Modal } from "mdb-ui-kit";
import { autocomplete } from "../../../includes/autocomplete";

function loadScript(win: {eval: (x: string) => any, document: Document}, scriptURL: string, temp: {[index: string]: string}) {
    $(win.document.body).append($("<script>").attr("src", scriptURL));
    if (scriptURL in temp) {
        try {
            win.eval(temp[scriptURL]);
        } catch (e) {}
    } else {
        $.ajax(
            {
                url: scriptURL,
                success: (data) => {
                    temp[scriptURL] = data;
                    try {
                        win.eval(data);
                    } catch (e) {}
                },
                error: (e) => {
                    let p = $("<p>").text(String(e)).css("color", "red");
                    p.html(p.html().replace(/\n/g,'<br/>'))
                    $(win.document.body).append(p);
                }
            }
        );
    }
}

function loadStyle(win: {eval: (x: string) => any, document: Document}, styleURL: string) {
    $(win.document.head).append($("<link>").attr("rel", "stylesheet").attr("href", styleURL));
}

function createEditor(lang: Function, parent: JQuery) {
    return new EditorView(
        {
            state: EditorState.create(
                {
                    extensions: [basicSetup, lang(), xcodeDark],
                }
            ),
            parent: parent.get(0),
        }
    );
}

export function getPageContext (app: APP) {
    return [];
}

export function createModal (app: APP, element: JQuery, list: string[], complete: boolean = true) {
    let listView = $("<div class='list-group'>");
    let getter = (inp: string) => {
        return new Promise<any[]>(
            (resolve) => {
                $.ajax(
                    {
                        url: "https://api.cdnjs.com/libraries",
                        data: {
                            search: inp,
                            fields: "homepage"
                        },
                        success: (data) => {
                            let result = [];
                            data.results.forEach(
                                (i) => {
                                    result.push(i.latest);
                                }
                            );
                            resolve(result);
                        }
                    }
                )
            }
        );
    };
    let checker = (inp) => 0;
    let modal = $("<div class='modal top fade'>").appendTo(element);
    let modalDialog = $("<div class='modal-dialog modal-xl'>").appendTo(modal);
    let modalContent = $("<div class='modal-content'>").appendTo(modalDialog);
    let modalHeader = $("<div class='modal-header'>").appendTo(modalContent);
    let modalBody = $("<div class='modal-body'>").appendTo(modalContent);
    modalHeader.append($("<h5>").text("库管理")).append($("<button class='btn-close' data-mdb-dismiss='modal'>"));
    let inputGroup = $("<div class='input-group'>").appendTo(modalBody);
    let search = $("<input class='form-control' placeholder='请输入库名称'>").appendTo(inputGroup);
    if (complete) autocomplete(search, getter, checker, () => null);
    inputGroup.append(
        $("<button class='btn btn-primary'>").text("添加").on(
            "click", () => {
                if (list.indexOf(search.val() as string) === -1) list.push(search.val() as string);
                listView.children().remove();
                for (let i in list) {
                    let listItem = $("<a class='list-group-item list-group-item-action text-truncate'>");
                    listView.append(
                        listItem.text(list[i]).data("index", i).append(
                            $("<button class='btn-close float-end'>").on(
                                "click",
                                () => {
                                    delete list[parseInt(listItem.data("index"))];
                                    listItem.remove();
                                    modalObject.hide();
                                    modal.remove();
                                    createModal(app, element, list);
                                }
                            )
                        ).prepend(
                            $("<i class='fa fa-box'>"),
                            " "
                        )
                    );
                }
            }
        )
    );
    modalBody.append("<br>").append(listView);
    listView.children().remove();
    for (let i in list) {
        let listItem = $("<a class='list-group-item list-group-item-action text-truncate'>");
        listView.append(
            listItem.text(list[i]).data("index", i).append(
                $("<button class='btn-close float-end'>").on(
                    "click",
                    () => {
                        delete list[parseInt(listItem.data("index"))];
                        listItem.remove();
                        modalObject.hide();
                        modal.remove();
                        createModal(app, element, list);
                    }
                )
            ).prepend(
                $("<i class='fa fa-box'>"),
                " "
            )
        );
    }
    let modalObject = new Modal(modal);
    modalObject.show();
    modal.on("hidden.mdb.modal", () => modal.remove());
    return {
        modal, modalBody, modalContent, modalHeader, modalDialog, modalObject, listView, inputGroup, search
    };
}

export function initialize (app: APP) {
    let list = [];
    let element = $("<div class='container'>");
    let button = $("<button class='btn btn-primary'>").appendTo(element).on("click", () => createModal(app, element, list)).text("库");
    element.append("<br><br>");
    let row = $("<div class='row'>");
    let row2 = $("<div class='row'>");
    let columnHTML = $("<div class='col'>").appendTo(row);
    let columnCSS = $("<div class='col'>").appendTo(row);
    let columnJS = $("<div class='col'>").appendTo(row2);
    let columnFrame = $("<div class='col'>").appendTo(row2);
    element.append(
        $("<h1>").text("在线代码编辑器")
    ).append(
        $("<div class='row'>").append(
            $("<div class='col'>").text("HTML")
        ).append(
            $("<div class='col'>").text("CSS")
        )
    ).append(row).append(
        $("<div class='row'>").append(
            $("<div class='col'>").text("JS")
        ).append(
            $("<div class='col'>").text("预览")
        )
    ).append(row2);
    let temp = {};
    let htmlEditor = createEditor(html, columnHTML);
    let javascriptEditor = createEditor(javascript, columnJS);
    let cssEditor = createEditor(css, columnCSS);
    $(javascriptEditor.dom).height("100%").width("100%");
    $(cssEditor.dom).height("100%").width("100%");
    $(htmlEditor.dom).height("100%").width("100%");
    let frameView: HTMLIFrameElement = $("<iframe>").appendTo(columnFrame).get(0) as HTMLIFrameElement;
    let callback = () => {
        let frameWindow: Window = frameView.contentWindow;
        $(frameWindow.document.body).empty();
        $(frameWindow.document.head).empty();
        frameWindow.document.write(htmlEditor.contentDOM.innerText || "<head><title></title></head><body></body>");
        $(frameWindow.document.head).append($("<style>").text(cssEditor.contentDOM.innerText));
        for (let i of list) {
            if (String(i).endsWith(".css")) loadStyle(frameWindow.window, i)
            else loadScript(frameWindow.window, i, temp)
        }
        try {
            frameWindow.window.eval(javascriptEditor.contentDOM.innerText);
        } catch (e) {
            let p = $("<p>").text(e.stack).css("color", "red");
            p.html(p.html().replace(/\n/g,'<br/>'));
            $(frameWindow.document.body).append(p);
        }
        $(frameView).height("100%").width("100%");
        $(javascriptEditor.dom).height("100%").width("100%");
        $(cssEditor.dom).height("100%").width("100%");
        $(htmlEditor.dom).height("100%").width("100%");
    };
    $(frameView).on(
        "load",
        () => {
            $(columnHTML).on("propetychange input keydown", callback);
            $(columnCSS).on("propetychange input keydown", callback);
            $(columnJS).on("propetychange input keydown", callback);
            callback();
        }
    );
    element.hide().appendTo(app.app).fadeIn(250);
}
