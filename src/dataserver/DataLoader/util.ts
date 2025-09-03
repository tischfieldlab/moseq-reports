


export function autoType(object) {
    const pattern = /^([-+]\d{2})?\d{4}(-\d{2}(-\d{2})?)?(T\d{2}:\d{2}(:\d{2}(\.\d{3})?)?(Z|[-+]\d{2}:\d{2})?)?$/;
    for (const key of Object.keys(object)) {
        let value = object[key].trim();
        let num;
        let m;
        if (!value) {
            value = null;
        } else if (value === "true") {
            value = true;
        } else if (value === "false") {
            value = false;
        } else if (value === "NaN") {
            value = NaN;
        } else if (!isNaN((num = +value))) {
            value = num;
        } else if (value.match(pattern)) {
            m = value.match(pattern);
            if (fixtz && !!m[4] && !m[7]) {
                value = value.replace(/-/g, "/").replace(/T/, " ");
            }
            value = new Date(value);
        } else {
            continue;
        }
        object[key] = value;
    }
    return object;
}
// https://github.com/d3/d3-dsv/issues/45
const fixtz = new Date("2019-01-01T00:00").getHours() || new Date("2019-07-01T00:00").getHours();
