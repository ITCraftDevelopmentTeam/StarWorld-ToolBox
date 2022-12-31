import * as HTMLParser from "node-html-parser";
import $ from "jquery";

import { parseAttributes, RXComponent, RXHTMLElementAlias } from "../rxcomponent";
import { fromNode } from "../rxui";
import * as mdb from "mdb-ui-kit";

export class RXModalComponent extends RXComponent {

    public modalObject: mdb.Modal;

    constructor (raw: HTMLParser.Node) {
        super(raw);
        this.jquery = $(`<div class='modal fade'>`);
    }

    public load (): this {
        this.loaded = true;
        this.jquery.attr(parseAttributes(this.raw["attributes"])).addClass("modal fade");
        for (let i of this.raw.childNodes) {
            this.jquery.append(
                fromNode(i).render()
            );
        }
        this.modalObject = new mdb.Modal(this.jquery[0]);
        return this;
    }

    public modal (operation: "show" | "hide" | "toggle") {
        if (operation == "show") this.modalObject.show();
        else if (operation == "hide") this.modalObject.hide();
        else if (operation == "toggle") this.modalObject.toggle();
        return this;
    }
}

export class RXToastComponent extends RXComponent {

    public toastObject: mdb.Toast;

    public static get observedAttributes () {
        return {
            "@rx-autohide": ["true", "false"]
        }
    }

    constructor (raw: HTMLParser.Node) {
        super(raw);
        this.jquery = $("<div class='toast fade'>");
    }

    public load (): this {
        super.load();
        this.jquery.addClass("toast fade").attr("role", "alert").attr(
            "data-mdb-autohide", this.raw["attributes"]["@rx-autohide"] || "false",
        );
        this.toastObject = new mdb.Toast(this.render(0));
        return this;
    }

    public toast (operation: "show" | "toggle" | "hide"): this {
        if (operation == "show") this.toastObject.show();
        if (operation == "hide") this.toastObject.hide();
        if (operation == "toggle") this.toastObject.toggle();
        return this;
    }

}

export class RXToastHeaderComponent extends RXComponent {

    constructor (raw: HTMLParser.Node) {
        super(raw);
        this.jquery = $("<div class='toast-header'>");
    }

    load (): this {
        super.load();
        this.jquery.addClass("toast-header").attr("role", "alert");
        if (this.raw["attributes"]["@rx-subtitle"]) this.jquery.prepend($("<small>").text(this.raw["attributes"]["@rx-subtitle"]));
        if (this.raw["attributes"]["@rx-title"]) this.jquery.prepend($("<strong class='me-auto'>").text(this.raw["attributes"]["@rx-title"]));
        return this;
    }

}

export class RXPopOverComponent extends RXComponent {

    public static get observedAttributes () {
        return {
            "@rx-title": [""],
            "@rx-content": [""],
            "@rx-trigger": ["click", "hover", "focus", "manual"],
        };
    }

    constructor (raw: HTMLParser.Node) {
        super(raw);
        this.jquery = $([]);
    }

    load (): this {
        let list = [];
        for (let i of this.raw.childNodes) {
            if (i instanceof HTMLParser.TextNode) {
                list.push(document.createTextNode(i.rawText));
            } else {
                let elements;
                try {
                    elements = fromNode(i).render(-1).map(
                        (value) => {
                            return $(value).attr(
                                "data-mdb-toggle", "popover"
                            ).attr(
                                "data-mdb-trigger", this.raw["attributes"]["@rx-trigger"] || "focus",
                            ).attr(
                                "title", this.raw["attributes"]["@rx-title"] || ""
                            ).attr(
                                "data-mdb-content", this.raw["attributes"]["@rx-content"] || ""
                            ).get(0);
                        }
                    );
                } catch {
                    elements = undefined;
                }
                if (elements) {
                    list.push(...elements);
                }
            }
        }
        this.jquery = $(list);
        this.popover();
        this.loaded = true;
        return this;
    }

    popover (operation?: "show" | "hide" | "toggle") {
        this.jquery.get().map(
            (value) => {
                try {
                    let popover = new mdb.Popover(value);
                    if (operation == "show") popover["show"]();
                    if (operation == "hide") popover["hide"]();
                    if (operation == "toggle") popover["toggle"]();
                } catch {}
            }
        );
        return this;
    }

}

class RXToolTipComponent extends RXComponent {

    public static get observedAttributes () {
        return {
            "@rx-title": [""],
        };
    }

    constructor (raw: HTMLParser.Node) {
        super(raw);
        this.jquery = $([]);
    }

    load () {
        let list = [];
        for (let i of this.raw.childNodes) {
            if (i instanceof HTMLParser.TextNode) {
                list.push(document.createTextNode(i.rawText));
            } else {
                let elements;
                try {
                    elements = fromNode(i).render(-1).map(
                        (value) => {
                            return $(value).attr(
                                "data-mdb-toggle", "tooltip",
                            ).attr("title", this.raw["attributes"]["@rx-title"] || "").get(0);
                        }
                    );
                } catch {
                    elements = undefined;
                }
                if (elements) {
                    list.push(...elements);
                }
            }
        }
        this.jquery = $(list);
        this.tooltip();
        this.loaded = true;
        return this;
    }

    tooltip (operation?: "show" | "hide" | "toggle") {
        this.jquery.get().map(
            (value) => {
                try {
                    let popover = new mdb.Tooltip(value);
                    if (operation == "show") popover["show"]();
                    if (operation == "hide") popover["hide"]();
                    if (operation == "toggle") popover["toggle"]();
                } catch {}
            }
        );
        return this;
    }

}

export default {
    // Modals
    Modal: RXModalComponent,
    ModalHeader: RXHTMLElementAlias("div", {class: "modal-header"}, false),
    ModalBody: RXHTMLElementAlias("div", {class: "modal-body"}, false),
    ModalFooter: RXHTMLElementAlias("div", {class: "modal-footer"}, false),
    ModalDialog: RXHTMLElementAlias("div", {class: "modal-dialog"}, false),
    ModalContent: RXHTMLElementAlias("div", {class: "modal-content"}, false),
    ModalTitle: RXHTMLElementAlias("h5", {class: "modal-title"}, false),
    ModalClose: RXHTMLElementAlias("button", {class: "btn-close", "data-mdb-dismiss": "modal"}, false),
    // Toasts
    Toast: RXToastComponent,
    ToastHeader: RXToastHeaderComponent,
    ToastContainer: RXHTMLElementAlias("div", {class: "toast-container"}, false),
    ToastBody: RXHTMLElementAlias("div", {class: "toast-body"}, false),
    ToastClose: RXHTMLElementAlias("button", {class: "btn-close", "data-mdb-dismiss": "toast"}, false),
    // Popovers
    PopOver: RXPopOverComponent,
    ToolTip: RXToolTipComponent,
}
