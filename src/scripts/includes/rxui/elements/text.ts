import * as HTMLParser from "node-html-parser";
import $ from "jquery";

import * as IconsBootstrap from "bootstrap-icons/font/bootstrap-icons.json";
import * as IconsFontAwesome from "@fortawesome/fontawesome-free/metadata/icon-families.json";
import * as IconsMaterial from "material-icons/_data/versions.json";

import { parseAttributes, RXComponent } from "../rxcomponent";
import { fromNode } from "../rxui";

export class RXTextComponent extends RXComponent {

    public static get observedAttributes () {
        return {
            "@rx-hyperlink": ""
        }
    }

    load () {
        this.loaded = true;
        if ("@rx-hyperlink" in this.raw["attributes"]) {
            this.jquery = $("<a>");
        } else {
            this.jquery = $("<p>");
        }
        for (let i of this.raw.childNodes) {
            this.jquery.append(
                fromNode(i).render()
            );
        }
        this.jquery.attr(parseAttributes(this.raw["attributes"]));
        return this;
    }

}

export class RXTextNodeComponent extends RXComponent {

    constructor (raw: HTMLParser.Node) {
        super(raw);
        this.jquery = $("");
    }

    load () {
        this.loaded = true;
        this.jquery = $(document.createTextNode(this.raw.rawText || this.raw["attributes"]["@rx-text"] || ""));
        return this;
    }

}

export class RXHTMLNodeComponent extends RXComponent {

    constructor (raw: HTMLParser.Node) {
        super(raw);
        this.jquery = $(``);
    }

    load () {
        this.loaded = true;
        let list = [];
        for (let i of this.raw.childNodes) {
            if (i instanceof HTMLParser.TextNode) {
                list.push(
                    document.createTextNode(i.rawText)
                );
            } else {
                let item = document.createElement(i["rawTagName"]);
                $(item).html(
                    i["innerHTML"] || ""
                ).text(
                    i.rawText || ""
                );
                for (let j of Object.keys(i["attributes"])) {
                    $(item).attr(j, i["attributes"][j]);
                }
                list.push(item);
            }
        }
        this.jquery = $(list);
        return this;
    }

}

export class RXCommentComponent extends RXComponent {

    render (...args) {
        return $("") as any;
    }

}

export class RXIconCompoment extends RXComponent {

    public type: "fontawesome" | "bootstrap" = "fontawesome";
    public icon: string = null;

    public static get observedAttributes () {
        let insert = (object, name) => {
            return Object.keys(object).map(
                (value) => {
                    return name + ":" + value;
                }
            );
        };
        return {
            "@rx-type": ["bootstrap", "fontawesome", "material"],
            "@rx-icon": [
                ...insert(IconsBootstrap, "bootstrap"),
                ...insert(IconsFontAwesome, "fontawesome"),
                ...insert(IconsMaterial, "material")
            ]
        }
    }

    addIconClass () {
        let icon: {[index: string]: [string, "class" | "text"]} = {
            fontawesome: ["fa", "class"],
            bootstrap: ["bi", "class"],
            material: ["material-icons", "text"]
        };
        if (icon[this.type]){
            this.jquery.addClass(icon[this.type][0]);
            if (this.icon) {
                if (icon[this.type][1] == "class") {
                    this.jquery.addClass(`${icon[this.type][0]}-${this.icon.split(':').slice(1).join(":")}`);
                } else if (icon[this.type][1] == "text") {
                    this.jquery.text(`${this.icon.split(':').slice(1).join(":")}`);
                }
            }
        }

    }

    constructor (raw: HTMLParser.Node) {
        super(raw);
        this.type = ((this.raw["attributes"] || {})["@rx-type"]) || this.type;
        this.icon = ((this.raw["attributes"] || {})["@rx-icon"]) || this.icon;
        this.jquery = $("<li>");
        this.addIconClass();
    }

    load () {
        this.jquery = $("<i>");
        super.load();
        this.addIconClass();
        return this;
    }

}

export default {
    Text: RXTextComponent,
    TextNode: RXTextNodeComponent,
    HTMLNode: RXHTMLNodeComponent,
    Comment: RXCommentComponent,
    Icon: RXIconCompoment,
}
