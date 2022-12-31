import $ from "jquery";
import "jquery-bez";

export function cubicBezier (array: number[]): string {
    return $["bez"](array);
}
