import { RXComponent } from "../rxcomponent";

import * as HTMLParser from "node-html-parser";

class RXCollapseButtonComponent extends RXComponent {

    public status: boolean = false;

    public static get observedAttributes() {
        return {
            "@rx-event": ["on", "off", "toggle"],
        }
    }

    constructor (raw: HTMLParser.Node) {
        super(raw);
        this.jquery = $("<button type='button' class='sw-rxui-animation-all-primary sw-collapse'>");
    }

    load () {
        this.jquery = $("<button type='button' class='sw-rxui-animation-all-primary sw-collapse'>")
        super.load();
        this.jquery.addClass("sw-rxui-animation-all-primary sw-collapse");
        if ("@rx-event" in this.raw["attributes"]) this.collapse();
        return this;
    }

    collapse (operation: "on" | "toggle" | "off" = null) {
        let that = this;
        if (operation == "on") this.status = true;
        if (operation == "off") this.status = false;
        if (operation == "toggle") this.status = !this.status;
        else this.jquery.on("click", () => that.collapse("toggle"));
        if (this.status) this.jquery.addClass("sw-active");
        else this.jquery.removeClass("sw-active");
    }

}

export default {
    CollapseButton: RXCollapseButtonComponent
}
