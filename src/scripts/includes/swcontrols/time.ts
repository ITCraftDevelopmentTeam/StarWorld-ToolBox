import $ from "jquery";
import dayjs from "dayjs";

export class TimeElement extends HTMLElement {


    interval: number = null;
    formatter: Function = dayjs;

    handle (): void {
        if (this.disabled) return;
        let formatted = this.formatter(new Date()).format(this.format);
        if ($(this).text() != formatted) $(this).text(formatted);
    }

    connectedCallback (): void {
        let that = this;
        let tick = this.tick;
        this.interval = Number(
            setInterval(
                function () {
                    that.handle();
                },
                tick
            )
        );
    }

    disconnectedCallback (): void {
        if (this.interval != null) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    attributeChangedCallback (name, oldValue, newValue): void {
        this.disconnectedCallback();
        this.connectedCallback();
    }

    static get observedAttributes (): string[] {
        return ['format', 'disabled', 'tick'];
    }

    get format (): string {
        if (!$(this).is("[format]")) {
            return "YYYY-MM-DD HH:mm:ss";
        } else {
            return $(this).attr("format");
        }
    }

    get disabled (): boolean {
        return $(this).is("[disabled]");
    }

    get tick (): number {
        let tick = 0;
        if ($(this).is("[tick]")) {
            tick = Number($(this).attr("tick"));
        }
        return tick;
    }
    static registry (name: string = 'kui-time', options: ElementDefinitionOptions = undefined): typeof TimeElement {
        try {
            customElements.define(name, TimeElement, options);
        } catch {}
        return TimeElement;
    }

}
