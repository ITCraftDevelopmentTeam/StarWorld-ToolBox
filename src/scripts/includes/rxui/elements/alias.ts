import { RXHTMLElementAlias } from "../rxcomponent";

let HTMLBase = {
    HTML: RXHTMLElementAlias("html"),
    Body: RXHTMLElementAlias("body"),
    Head: RXHTMLElementAlias("head"),
};

let RXMLBase = {
    RXML: RXHTMLElementAlias("html", {"data-rxml": "true"}),
};

let HeadLink = {
    Link: RXHTMLElementAlias("link"),
    LinkStyleSheet: RXHTMLElementAlias("link", {rel: "stylesheet"}),
};

let HeadBase = {
    ...HeadLink,
    Title: RXHTMLElementAlias("title"),
    Meta: RXHTMLElementAlias("meta"),
    RXStyle: RXHTMLElementAlias("style"),
};

let FormBase = {
    Form: RXHTMLElementAlias("form"),
    TextArea: RXHTMLElementAlias("textarea"),
    Input: RXHTMLElementAlias("input"),
    InputCheckBox: RXHTMLElementAlias("input", {type: "checkbox"}),
    InputButton: RXHTMLElementAlias("input", {type: "button"}),
    InputColor: RXHTMLElementAlias("input", {type: "color"}),
    InputDate: RXHTMLElementAlias("input", {type: "checkbox"}),
    InputDateTime: RXHTMLElementAlias("input", {type: "datetime"}),
    InputDateTimeLocal: RXHTMLElementAlias("input", {type: "datetime-local"}),
    InputEmail: RXHTMLElementAlias("input", {type: "email"}),
    InputFile: RXHTMLElementAlias("input", {type: "file"}),
    InputHidden: RXHTMLElementAlias("input", {type: "hidden"}),
    InputImage: RXHTMLElementAlias("input", {type: "image"}),
    InputMonth: RXHTMLElementAlias("input", {type: "month"}),
    InputNumber: RXHTMLElementAlias("input", {type: "number"}),
    InputPassWord: RXHTMLElementAlias("input", {type: "password"}),
    InputRadio: RXHTMLElementAlias("input", {type: "radio"}),
    InputRange: RXHTMLElementAlias("input", {type: "range"}),
    InputReset: RXHTMLElementAlias("input", {type: "reset"}),
    InputSearch: RXHTMLElementAlias("input", {type: "search"}),
    InputSubmit: RXHTMLElementAlias("input", {type: "submit"}),
    InputTelephone: RXHTMLElementAlias("input", {type: "tel"}),
    InputTime: RXHTMLElementAlias("input", {type: "time"}),
    InputText: RXHTMLElementAlias("input", {type: "text"}),
    InputURL: RXHTMLElementAlias("input", {type: "url"}),
    InputWeek: RXHTMLElementAlias("input", {type: "week"}),

};

let ListBase = {
    UnorderedList: RXHTMLElementAlias("ul"),
    OrderedList: RXHTMLElementAlias("ol"),
    ListItem: RXHTMLElementAlias("li"),
    DefinitionList: RXHTMLElementAlias("dl"),
    DefinitionTitle: RXHTMLElementAlias("dt"),
    DefinitionDescription: RXHTMLElementAlias("dd"),
    NavigationList: RXHTMLElementAlias("nl")
};

let TableBase = {
    Table: RXHTMLElementAlias("table"),
    TableData: RXHTMLElementAlias("td"),
    TableRow: RXHTMLElementAlias("tr"),
    TableHeader: RXHTMLElementAlias("th"),
    TableCaption: RXHTMLElementAlias("caption"),
    TableColumnGroup: RXHTMLElementAlias("colgroup"),
    TableColumn: RXHTMLElementAlias("col"),
    TableHead: RXHTMLElementAlias("thead"),
    TableBody: RXHTMLElementAlias("tbody"),
    TableFoot: RXHTMLElementAlias("tfoot"),
};

let ContainerBase = {
    Division: RXHTMLElementAlias("div")
};

let BodyBase = {
    ...FormBase,
    ...ListBase,
    ...TableBase,
    ...ContainerBase,
    Break: RXHTMLElementAlias("br"),
    Button: RXHTMLElementAlias("button"),
    Anchor: RXHTMLElementAlias("a"),
    Paragraph: RXHTMLElementAlias("p"),
};

let StyledBase = {
    ButtonClose: RXHTMLElementAlias("button", {class: "btn-close"}, false),
    Container: RXHTMLElementAlias("div", {class: "container"}, false),
    ContainerFluid: RXHTMLElementAlias("div", {class: "container-fluid"}, false),
};

export let aliases = {
    ...HTMLBase,
    ...RXMLBase,
    ...HeadBase,
    ...BodyBase,
    ...StyledBase
};

export default aliases;
