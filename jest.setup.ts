
if (typeof FormData === "undefined") {
    try {

        const { FormData: UndiciFormData } = require("undici");

        global.FormData = UndiciFormData;
    } catch (_e) {
    }
}

if (typeof TextEncoder === "undefined" || typeof TextDecoder === "undefined") {
    try {

        const util = require("util");
        if (typeof TextEncoder === "undefined") {

            global.TextEncoder = util.TextEncoder;
        }
        if (typeof TextDecoder === "undefined") {

            global.TextDecoder = util.TextDecoder;
        }
    } catch (_e) {
    }
}

if (typeof setImmediate === "undefined") {

    global.setImmediate = (fn, ...args) => setTimeout(fn, 0, ...args);
}

if (typeof clearImmediate === "undefined") {

    global.clearImmediate = (id) => clearTimeout(id);
}