import $ from "jquery";
import swal from "sweetalert2";
import saver from "file-saver";

import { fabric as Fabric } from "fabric";
import { APP } from "../../app";
import { IEvent } from "fabric/fabric-impl";


export function readFileAsURL (callback: (input: JQuery) => void = (...args) => null): Promise<string> {
    return new Promise (
        function (resolve, reject) {
            let input: JQuery<HTMLElement> = $("<input accept='image/*'>").attr("type", "file");
            callback(input);
            input.trigger("click").on(
                "change",
                function () {
                    let fileReader = new FileReader();
                    fileReader.onload = function () {
                        resolve(fileReader.result as string);
                    };
                    fileReader.onabort = reject;
                    fileReader.onerror = reject;
                    fileReader.readAsDataURL(input.prop("files")[0]);
                }
            );
        }
    );
}

export function checkKey (
    event: JQuery.KeyDownEvent<Window & typeof globalThis, undefined, Window & typeof globalThis, Window & typeof globalThis>,
    keyName: string | number | null, ctrl: boolean = false, alt: boolean = false, meta: boolean = false
) {
    if (keyName == null) {
        return (event.altKey == alt) && (event.metaKey == meta) && (event.ctrlKey == ctrl);
    }
    if (typeof keyName == "number") {
        // noinspection JSDeprecatedSymbols
        return (event.keyCode == keyName) && (event.altKey == alt) && (event.metaKey == meta) && (event.ctrlKey == ctrl);
    }
    return (event.key.toLowerCase() == String(keyName).toLowerCase()) && (event.altKey == alt) && (event.metaKey == meta) && (event.ctrlKey == ctrl);
}

export enum StarWorldPainterMode {
    Circle, Drawing, None
}

export class StarWorldPainter {

    public app: APP;
    public canvas: Fabric.Canvas;
    public canvasElement: JQuery<HTMLCanvasElement>;
    public buttonGroup: JQuery;
    public buttons: JQuery[];
    public fillColor: string = "#000000";
    public strokeColor: string = "#000000";
    public height: number = 1;
    public width: number = 1;
    public mode: StarWorldPainterMode = StarWorldPainterMode.Drawing;

    public currentCircle;
    public downPoint = null;
    public upPoint = null;
    public mouseDown: boolean = false;

    constructor (app: APP) {
        app.initNavbar(app.getConstants().defaultNavbarContext);
        app.initNavbarSearch();
        this.app = app;
        this.buttonGroup = $("<div class='btn-group'>").appendTo($("<div class='container'>").appendTo(this.app.app));
        this.canvasElement = $("<canvas style='height: 0; width: 0;'>").appendTo(this.app.app) as JQuery<HTMLCanvasElement>;
        this.canvas = new Fabric.Canvas(this.canvasElement[0]);
        this.buttons = [];
    }

    init () {
        let that = this;
        this.initButtons();
        this.initEvents();
    }

    canvasMode () {
        let that = this;
        swal.fire(
            {
                title: "选择画板模式",
                showConfirmButton: true,
                showCancelButton: true,
                showDenyButton: true,
                showCloseButton: true,
                confirmButtonColor: "#3b71ca",
                cancelButtonColor: "#3b71ca",
                denyButtonColor: "#3b71ca",
                confirmButtonText: "框选",
                cancelButtonText: "绘画",
                denyButtonText: "圆形",
                customClass: {
                    container: "sw-text-shadow",
                    cancelButton: "btn btn-primary shadow",
                    denyButton: "btn btn-primary shadow",
                    confirmButton: "btn btn-primary shadow",
                    icon: "shadow",
                }
            }
        ).then(
            select => {
                if (select.isConfirmed) {
                    that.mode = StarWorldPainterMode.None;
                } else if (select.isDenied) {
                    that.mode = StarWorldPainterMode.Circle;
                } else if (select.isDismissed && select.dismiss.toString() == "cancel") {
                    that.mode = StarWorldPainterMode.Drawing;
                }
            }
        )
    }

     canvasDraw (event: IEvent<MouseEvent>, type: "down" | "up" | "move" = "move") {
        let that = this;
        this.canvas.isDrawingMode = this.mode == StarWorldPainterMode.Drawing;
        if (this.mode == StarWorldPainterMode.Circle) {
            this.canvas.skipTargetFind = true;
            if (type == "down") {
                this.mouseDown = true;
                this.downPoint = event.absolutePointer;
                this.currentCircle = new Fabric.Circle(
                    {
                        top: that.downPoint.y,
                        left: that.downPoint.x,
                        radius: 0,
                        fill: that.fillColor,
                        stroke: that.strokeColor
                    }
                );
                this.canvas.add(this.currentCircle);
            }
            if (type == "move" && this.mouseDown) {
                const currentPoint = event.absolutePointer;
                let radius = Math.min(Math.abs(that.downPoint.x - currentPoint.x), Math.abs(that.downPoint.y - currentPoint.y)) / 2;
                let top = currentPoint.y > that.downPoint.y ? that.downPoint.y : that.downPoint.y - radius * 2;
                let left = currentPoint.x > that.downPoint.x ? that.downPoint.x :  that.downPoint.x - radius * 2;
                that.currentCircle.set('radius', radius);
                that.currentCircle.set('top', top);
                that.currentCircle.set('left', left);
                that.canvas.requestRenderAll();
            }
            if (type == "up") {
                this.mouseDown = false;
                this.upPoint = event.absolutePointer;
                if (JSON.stringify(that.downPoint) === JSON.stringify(that.upPoint)) {
                    that.canvas.remove(that.currentCircle);
                } else {
                    if (that.currentCircle) {
                        that.currentCircle.set('stroke', that.strokeColor);
                    }
                }
                that.currentCircle = new Fabric.Circle();
            }
        } else if (this.mode == StarWorldPainterMode.Drawing) {
            this.canvas.skipTargetFind = true;
        } else if (this.mode == StarWorldPainterMode.None) {
            this.canvas.skipTargetFind = false;
        }
    }

    canvasUPLoadImage () {
        let that = this;
        readFileAsURL(
            (input) => {
                input.attr("accept", "image/*");
            }
        ).then(
            (url) => {
                Fabric.Image.fromURL(
                    url,
                    (image) => {
                        that.canvas.add(image);
                    }
                );
            }
        );
    }

    canvasClear () {
        let that = this;
        swal.fire(
            {
                title: "确定清空画板？", icon: "warning", text: "此操作会删除画板的所有内容",
                showCancelButton: true, showConfirmButton: true,
                cancelButtonText: "取消", confirmButtonText: "确定",
                cancelButtonColor: "#14a44d", confirmButtonColor: "#3b71ca",
                customClass: {container: "sw-text-shadow sw-text-shadow-plus", cancelButton: "btn btn-success shadow", confirmButton: "btn btn-primary shadow", icon: "shadow",}
            }
        ).then(
            result => {
                if (result.isConfirmed) {
                    that.canvas.clear();
                    void swal.fire({title: "画板清空成功", icon: "success", showConfirmButton: true, confirmButtonText: "确定", confirmButtonColor: "#3b71ca", customClass: {container: "sw-text-shadow sw-text-shadow-plus", cancelButton: "btn btn-success shadow", confirmButton: "btn btn-primary shadow", icon: "shadow",}});
                }
            }
        );
    }

    canvasDownLoad () {
        let that = this;
        swal.fire(
            {
                title: "导出",
                text: "请选择一个文件格式",
                icon: "question",
                showCancelButton: true,
                showConfirmButton: true,
                cancelButtonText: "JSON",
                confirmButtonText: "SVG",
                cancelButtonColor: "#3b71ca",
                confirmButtonColor: "#3b71ca",
                customClass: {
                    container: "sw-text-shadow sw-text-shadow-plus",
                    icon: "shadow",
                    cancelButton: "btn btn-primary shadow",
                    confirmButton: "btn btn-primary shadow"
                }
            }
        ).then(
            (result) => {
                let type: "json" | "svg" = null;
                if (result.isConfirmed) type = "svg";
                else if (result.isDismissed && result.dismiss.toString() == "cancel") type = "json";
                let resultText: string;
                if (type != null) {
                    if (type == "json") {
                        resultText = JSON.stringify(that.canvas.toJSON());
                    } else {
                        resultText = that.canvas.toSVG();
                    }
                    saver.saveAs(new Blob([resultText]), `image.${type}`);
                }
            }
        );
    }

    initButtons () {
        let that = this;
        this.buttons = [
            $("<button class='btn btn-primary'>").text("清空").on(
                "click",
                () => that.canvasClear()
            ),
            $("<button class='btn btn-primary'>").text("导入").on(
                "click", () => that.canvasUPLoadImage()
            ),
            $("<button class='btn btn-primary'>").text("导出").on(
                "click", () => that.canvasDownLoad()
            ),
            $("<button class='btn btn-primary'>").text("模式").on(
                "click", () => that.canvasMode()
            )
        ];
        this.buttonGroup.children().remove();
        this.buttonGroup.append(
            ...this.buttons
        );
    }

    initEvents () {
        this.initWindowEvents();
        this.initCanvasEvents();
    }

    initWindowEvents () {
        let that = this;
        $(window).on(
            {
                "resize": that.eventResize(),
                "keydown": (event) => that.eventKeyDown(event)
            }
        );
    }

    initCanvasEvents () {
        let that = this;
        this.canvas.on(
            "mouse:down", (e) => that.canvasDraw(e, "down")
        ).on(
            "mouse:up", (e) => that.canvasDraw(e, "up")
        ).on(
            "mouse:move", (e) => that.canvasDraw(e, "move")
        );
    }

    eventKeyDown (event: JQuery.KeyDownEvent<Window & typeof globalThis, undefined, Window & typeof globalThis, Window & typeof globalThis>) {
        let that = this;
        console.log(event.key);
        if (checkKey(event, "a", true)) {
            let group = new Fabric.ActiveSelection(that.canvas.getObjects(), {canvas: that.canvas});
            that.canvas.setActiveObject(group);
            that.canvas.requestRenderAll();
            event.preventDefault();
        } else if (checkKey(event, "delete")) {
            that.canvas.remove(...that.canvas.getActiveObjects());
            event.preventDefault();
        } else if (checkKey(event, "arrowdown")) {
            for (let i of that.canvas.getActiveObjects()) {
                i.set("top", i.get("top") + 1);
                i.setCoords();
                that.canvas.requestRenderAll();
            }
            event.preventDefault();
        } else if (checkKey(event, "arrowup")) {
            for (let i of that.canvas.getActiveObjects()) {
                i.set("top", i.get("top") - 1);
                i.setCoords();
                that.canvas.requestRenderAll();
            }
            event.preventDefault();
        } else if (checkKey(event, "arrowleft")) {
            for (let i of that.canvas.getActiveObjects()) {
                i.set("left", i.get("left") - 1);
                i.setCoords();
                that.canvas.requestRenderAll();
            }
            event.preventDefault();
        } else if (checkKey(event, "arrowright")) {
            for (let i of that.canvas.getActiveObjects()) {
                i.set("left", i.get("left") + 1);
                i.setCoords();
                that.canvas.requestRenderAll();
            }
            event.preventDefault();
        } else if (checkKey(event, "arrowright", true)) {
            that.canvas.getActiveObjects().forEach(
                (i) => {
                    i.rotate(i.angle + 1).setCoords();
                }
            )
            that.canvas.requestRenderAll();
            event.preventDefault();
        } else if (checkKey(event, "arrowleft", true)) {
            that.canvas.getActiveObjects().forEach(
                (i) => {
                    i.rotate(i.angle - 1).setCoords();
                }
            )
            that.canvas.requestRenderAll();
            event.preventDefault();
        }
    }

    eventResize () {
        let that = this;
        this.canvas.setHeight(window.innerHeight).setWidth(window.innerWidth);
        return () => that.eventResize();
    }
}

export function initialize (app: APP) {
    new StarWorldPainter(app).init()
}
