import { JsonDecoder } from "@jsonjoy.com/json-pack/lib/json/JsonDecoder";


export class JsonDecoderWithNaNSupport extends JsonDecoder {
    constructor() {
        super();
    }

    public readAny(): unknown {
        this.skipWhitespace();
        const reader = this.reader;
        const x = reader.x;
        const uint8 = reader.uint8;
        const char = uint8[x];
        switch (char) {
            case 34 /* " */: {
                if (uint8[x + 1] === 0x64 /* d */) {
                    const bin = this.tryReadBin();
                    if (bin) return bin;
                    if (isUndefined(uint8, x + 2)) {
                        reader.x = x + 35;
                        return undefined;
                    }
                }
                return this.readStr();
            }
            case 78 /* N */:
                return this.readNaN();
            case 91 /* [ */:
                return this.readArr();
            case 102 /* f */:
                return this.readFalse();
            case 110 /* n */:
                return this.readNull();
            case 116 /* t */:
                return this.readTrue();
            case 123 /* { */:
                return this.readObj();
            default:
                if ((char >= 48 /* 0 */ && char <= 57) /* 9 */ || char === 45 /* - */) return this.readNum();
                throw new Error('Invalid JSON');
        }
    }
    public readNaN(): typeof NaN {
        if (this.reader.u8() === 0x4e && this.reader.u16() === 0x614e /* NaN */)
            return NaN;
        throw new Error('Invalid JSON');
    }
}

// Matches "data:application/cbor,base64;9w=="
const isUndefined = (u8: Uint8Array, x: number) =>
    // u8[x++] === 0x22 &&  // "
    // u8[x++] === 0x64 &&  // d
    u8[x++] === 0x61 && // a
    u8[x++] === 0x74 && // t
    u8[x++] === 0x61 && // a
    u8[x++] === 0x3a && // :
    u8[x++] === 0x61 && // a
    u8[x++] === 0x70 && // p
    u8[x++] === 0x70 && // p
    u8[x++] === 0x6c && // l
    u8[x++] === 0x69 && // i
    u8[x++] === 0x63 && // c
    u8[x++] === 0x61 && // a
    u8[x++] === 0x74 && // t
    u8[x++] === 0x69 && // i
    u8[x++] === 0x6f && // o
    u8[x++] === 0x6e && // n
    u8[x++] === 0x2f && // /
    u8[x++] === 0x63 && // c
    u8[x++] === 0x62 && // b
    u8[x++] === 0x6f && // o
    u8[x++] === 0x72 && // r
    u8[x++] === 0x2c && // ,
    u8[x++] === 0x62 && // b
    u8[x++] === 0x61 && // a
    u8[x++] === 0x73 && // s
    u8[x++] === 0x65 && // e
    u8[x++] === 0x36 && // 6
    u8[x++] === 0x34 && // 4
    u8[x++] === 0x3b && // ;
    u8[x++] === 0x39 && // 9
    u8[x++] === 0x77 && // w
    u8[x++] === 0x3d && // =
    u8[x++] === 0x3d && // =
    u8[x++] === 0x22; // "