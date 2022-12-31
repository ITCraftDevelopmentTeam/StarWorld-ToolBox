import "mdb-ui-kit";

import "jquery-bez";

import $ from "jquery";

import RX from "./includes/rxui/rxui";

import { RXModalComponent } from "./includes/rxui/elements/popover";

import { APP, APPConfig } from "./app/app";
import { requireNonError } from "./app/utils/require-value";

// Styles
import "../styles/all.scss";
import "mdb-ui-kit/css/mdb.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap-icons/font/bootstrap-icons.scss";
import "material-icons/iconfont/material-icons.scss";

export const config: APPConfig = {
    "api": {
        "url": ""
    }
};

export function index () {
    let appContainer = document.body;
    $(window).on("hashchange", (event) => location.reload());
    $(appContainer).hide();
    let app = new APP(appContainer, config).init();
    $(appContainer).fadeIn(
        500, () => {
            if (!(location.hash === "#" || location.hash === "")) return;
            console.log(RX.fromName(""));
            let modal = (RX.from(require("../rxmls/welcome.rxml"))) as RXModalComponent;
            modal.modal("show");
            (modal.render() as JQuery<HTMLElement>)[0].addEventListener(
                "hidden.mdb.modal", () => {
                    modal.render().remove();
                }
            );
        }
    );
    return app;
}

console.log(
    requireNonError(
        index
    )
);

