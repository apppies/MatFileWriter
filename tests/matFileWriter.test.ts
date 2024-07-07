import { MatFileWriter } from '../src/matFileWriter'

function loadMatfile(filename: string): Uint8Array {
    var fs = require('fs');
    let buffer = fs.readFileSync(filename);

    return buffer as Uint8Array;
}

declare global {
    namespace jest {
        interface Matchers<R> {
            toHaveAValidMatFileHeader(): CustomMatcherResult;
            toMatchMatFile(expected: Uint8Array): CustomMatcherResult;
        }
    }
}

expect.extend({
    toHaveAValidMatFileHeader(_actual: any) {
        if (
            _actual.constructor !== Uint8Array
        ) {
            throw new TypeError('Actual value must be a Uint8array.');
        }

        const actual = _actual as Uint8Array;

        // Verify if header has correct data
        const headerText = actual.subarray(0, 116); // Free text
        const headerSubsystem = actual.subarray(116, 124); // Could be anything if there is a subsystem
        const headerVersion = actual.subarray(124, 126);
        const headerEndian = actual.subarray(126, 128);

        // Get endianess and verify header version
        let endianess = "undefined"; // determined by chars MI (0x4D49)
        if (headerEndian[0] == 77 && headerEndian[1] == 73) {
            endianess = "big";
        } else if (headerEndian[0] == 73 && headerEndian[1] == 77) {
            endianess = "little"
        } else {
            return {
                pass: false,
                message: () => `expected header endian ${this.utils.printReceived(headerEndian)} to be ${this.utils.printExpected([73, 77])} or ${this.utils.printExpected([77, 73])})`
            }
        }

        if (endianess == "big" && (headerVersion[0] != 0x01 || headerVersion[1] != 0x00)) {
            return {
                pass: false,
                message: () => `expected header version ${this.utils.printReceived(headerVersion)} to be ${this.utils.printExpected([1, 0])})`
            }
        }
        else if (endianess == "little" && (headerVersion[1] != 0x01 || headerVersion[0] != 0x00)) {
            return {
                pass: false,
                message: () => `expected header version ${this.utils.printReceived(headerVersion)} to be ${this.utils.printExpected([0, 1])})`
            }
        }

        return {
            pass: true,
            message: () => 'File has a valid Mat file header'
        }
    },

    toMatchMatFile(_actual: any, _expected: any) {
        if (
            _actual.constructor !== Uint8Array ||
            (_expected.constructor !== Uint8Array && !Buffer.isBuffer(_expected))
        ) {
            throw new TypeError('Both values must be a Uint8array.');
        }

        const actual = _actual as Uint8Array;
        const expected = _expected as Uint8Array;
        if (actual.length != expected.length) {
            return {
                pass: false,
                message: () => `expected data length ${this.utils.printReceived(actual.length,)} to be ${this.utils.printExpected(expected.length)})`
            }
        }

        // Compare bits, but skip the header
        let unequalBytes: number[] = [];
        for (let i = 128; i < actual.length; i++) {
            if (actual[i] != expected[i]) {
                unequalBytes.push(i);
            }
        }

        if (unequalBytes.length == 0) {
            return {
                pass: true,
                message: () => 'Files have identical variables'
            }
        } else {
            return {
                pass: false,
                message: () => `Files differ at bytes ${unequalBytes.join(', ')}`
            }
        }
    }
});

test("Mat File header", async () => {
    let m = new MatFileWriter();
    m.addVariable("floats", [0, NaN, Infinity, -Infinity, 1]);
    const actual = new Uint8Array(await m.getBlob().arrayBuffer());
    expect(actual).toHaveAValidMatFileHeader();
});

describe("Specials", () =>{
    test("Doubles saved as integers - positive numbers", async () => {
        // Positive numbers are saved by matlab as int8 if it fits
        let expected = loadMatfile("./tests/matFiles/specials_double_as_int2.mat");

        let m = new MatFileWriter();
        m.Compression = false;
        m.addVariable("double_as_int2", [0, 1, 2]);
        let actual = new Uint8Array(await m.getBlob().arrayBuffer());
        expect(actual).toMatchMatFile(expected);
    });

    test("Doubles saved as integers - negative numbers", async () => {
        // Negative numbers are saved as int16 by matlab
        // while the values could fit in a Int8.
        // So, cut of the last 8 bytes and modify the total size
        // Manually verify the last bytes
        let expected = loadMatfile("./tests/matFiles/specials_double_as_int1.mat");

        let m = new MatFileWriter();
        m.Compression = false;
        m.addVariable("double_as_int1", [-1, -2, -3]);
        let actual = new Uint8Array(await m.getBlob().arrayBuffer());

        expected[132] = actual[132]; // Size of data
        expect(actual.subarray(0, actual.length - 8)).toMatchMatFile(expected.subarray(0, expected.length - 16));

        //Manual verify last 8 bytes     
        //                         INT8        3 bytes      -1    -2    -3   filler
        expected = new Uint8Array([0x01, 0x00, 0x03, 0x00, 0xFF, 0xFE, 0xFD, 0x00]);
        expect(actual.subarray(actual.length - 8)).toEqual(expected);
    });

    test("Special floats", async () => {
        let expected = loadMatfile("./tests/matFiles/specials_floats.mat");
        // Matlab saves NaN values as 0xF8FF, while javascripts NaN is 0xF87F
        // Both are valid, as the IEEE allows both. So modify expected to match JS behavior.
        expected[207] = 0x7F

        let m = new MatFileWriter();
        m.Compression = false;
        m.addVariable("floats", [0, NaN, Infinity, -Infinity, 1]);
        const actual = new Uint8Array(await m.getBlob().arrayBuffer());
        expect(actual).toMatchMatFile(expected);
    });
});

describe("Numeric", () => {
    test.each([
        ["f32", new Float32Array([-1234567.890])],
        ["f32_array", new Float32Array([-1234567.890, 0, +1234567.890, 1.1755e-38, 3.4028e+38])],
        ["f64", new Float64Array([-1234567.890123456789])],
        ["f64_array", new Float64Array([-1234567.890123456789, 0, +1234567.890123456789, 2.225073858507201e-308, 1.797693134862316e+308])],
        ["i8", new Int8Array([-8])],
        ["i8_array", new Int8Array([-128, 0, 127])],
        ["ui8", new Uint8Array([8])],
        ["ui8_array", new Uint8Array([0, 128, 255])],
        ["i16", new Int16Array([-1616])],
        ["i16_array", new Int16Array([-32768, 0, 32767])],
        ["ui16", new Uint16Array([1616])],
        ["ui16_array", new Uint16Array([0, 32768, 65535])],
        ["i32", new Int32Array([-32323232])],
        ["i32_array", new Int32Array([-2147483648, 0, 2147483647])],
        ["ui32", new Uint32Array([32323232])],
        ["ui32_array", new Uint32Array([0, 2147483648, 4294967295])],
        ["i64", new BigInt64Array([-646464646464646464n])],
        ["i64_array", new BigInt64Array([-9223372036854775808n, 0n, 9223372036854775807n])],
        ["ui64", new BigUint64Array([646464646464646464n])],
        ["ui64_array", new BigUint64Array([0n, 9223372036854775808n, 18446744073709551615n])],
    ])("%s", async (s, n) => {
        const expected = loadMatfile("./tests/matFiles/numericTests_" + s + ".mat");
        let m = new MatFileWriter();
        m.Compression = false;
        m.addVariable(s, n);
        const actual = new Uint8Array(await m.getBlob().arrayBuffer());
        expect(actual).toMatchMatFile(expected);
    });
    test.each([
        ["f32", new Float32Array([-1234567.890])],
        ["f32_array", new Float32Array([-1234567.890, 0, +1234567.890, 1.1755e-38, 3.4028e+38])],
        ["f64", new Float64Array([-1234567.890123456789])],
        ["f64_array", new Float64Array([-1234567.890123456789, 0, +1234567.890123456789, 2.225073858507201e-308, 1.797693134862316e+308])],
        ["i8", new Int8Array([-8])],
        ["i8_array", new Int8Array([-128, 0, 127])],
        ["ui8", new Uint8Array([8])],
        ["ui8_array", new Uint8Array([0, 128, 255])],
        ["i16", new Int16Array([-1616])],
        ["i16_array", new Int16Array([-32768, 0, 32767])],
        ["ui16", new Uint16Array([1616])],
        ["ui16_array", new Uint16Array([0, 32768, 65535])],
        ["i32", new Int32Array([-32323232])],
        ["i32_array", new Int32Array([-2147483648, 0, 2147483647])],
        ["ui32", new Uint32Array([32323232])],
        ["ui32_array", new Uint32Array([0, 2147483648, 4294967295])],
        ["i64", new BigInt64Array([-646464646464646464n])],
        ["i64_array", new BigInt64Array([-9223372036854775808n, 0n, 9223372036854775807n])],
        ["ui64", new BigUint64Array([646464646464646464n])],
        ["ui64_array", new BigUint64Array([0n, 9223372036854775808n, 18446744073709551615n])],
    ])("GZipped %s", async (s, n) => {
        const expected = loadMatfile("./tests/matFiles/numericTests_" + s + ".gz.mat");
        let m = new MatFileWriter();
        m.Compression = true;
        m.addVariable(s, n);
        const actual = new Uint8Array(await m.getBlob().arrayBuffer());

        // matFileWriter uses fflate, which is not binary compatible with zlib used by matlab
        // therefore compare decompressed values using zlib, so we now it is readable and contains the right content
        let zlib = require("node:zlib");
        expect(zlib.inflateSync(actual.subarray(0x88))).toEqual(zlib.inflateSync(expected.subarray(0x88)))
    });
});

describe("Chars", () => {
    test.each([
        ["c_1", "A"],
        ["c_42", "A longer string with some additional text!"],
        ["c_1000", "Aa0Aa1Aa2Aa3Aa4Aa5Aa6Aa7Aa8Aa9Ab0Ab1Ab2Ab3Ab4Ab5Ab6Ab7Ab8Ab9Ac0Ac1Ac2Ac3Ac4Ac5Ac6Ac7Ac8Ac9Ad0Ad1Ad2Ad3Ad4Ad5Ad6Ad7Ad8Ad9Ae0Ae1Ae2Ae3Ae4Ae5Ae6Ae7Ae8Ae9Af0Af1Af2Af3Af4Af5Af6Af7Af8Af9Ag0Ag1Ag2Ag3Ag4Ag5Ag6Ag7Ag8Ag9Ah0Ah1Ah2Ah3Ah4Ah5Ah6Ah7Ah8Ah9Ai0Ai1Ai2Ai3Ai4Ai5Ai6Ai7Ai8Ai9Aj0Aj1Aj2Aj3Aj4Aj5Aj6Aj7Aj8Aj9Ak0Ak1Ak2Ak3Ak4Ak5Ak6Ak7Ak8Ak9Al0Al1Al2Al3Al4Al5Al6Al7Al8Al9Am0Am1Am2Am3Am4Am5Am6Am7Am8Am9An0An1An2An3An4An5An6An7An8An9Ao0Ao1Ao2Ao3Ao4Ao5Ao6Ao7Ao8Ao9Ap0Ap1Ap2Ap3Ap4Ap5Ap6Ap7Ap8Ap9Aq0Aq1Aq2Aq3Aq4Aq5Aq6Aq7Aq8Aq9Ar0Ar1Ar2Ar3Ar4Ar5Ar6Ar7Ar8Ar9As0As1As2As3As4As5As6As7As8As9At0At1At2At3At4At5At6At7At8At9Au0Au1Au2Au3Au4Au5Au6Au7Au8Au9Av0Av1Av2Av3Av4Av5Av6Av7Av8Av9Aw0Aw1Aw2Aw3Aw4Aw5Aw6Aw7Aw8Aw9Ax0Ax1Ax2Ax3Ax4Ax5Ax6Ax7Ax8Ax9Ay0Ay1Ay2Ay3Ay4Ay5Ay6Ay7Ay8Ay9Az0Az1Az2Az3Az4Az5Az6Az7Az8Az9Ba0Ba1Ba2Ba3Ba4Ba5Ba6Ba7Ba8Ba9Bb0Bb1Bb2Bb3Bb4Bb5Bb6Bb7Bb8Bb9Bc0Bc1Bc2Bc3Bc4Bc5Bc6Bc7Bc8Bc9Bd0Bd1Bd2Bd3Bd4Bd5Bd6Bd7Bd8Bd9Be0Be1Be2Be3Be4Be5Be6Be7Be8Be9Bf0Bf1Bf2Bf3Bf4Bf5Bf6Bf7Bf8Bf9Bg0Bg1Bg2Bg3Bg4Bg5Bg6Bg7Bg8Bg9Bh0Bh1Bh2B"]
    ])("%s", async (s, n) => {
        const expected = loadMatfile("./tests/matFiles/charTests_" + s + ".mat");
        let m = new MatFileWriter();
        m.Compression = false;
        m.addVariable(s, n);
        const actual = new Uint8Array(await m.getBlob().arrayBuffer());
        expect(actual).toMatchMatFile(expected);
    })
    test.each([
        ["c_1", "A"],
        ["c_42", "A longer string with some additional text!"],
        ["c_1000", "Aa0Aa1Aa2Aa3Aa4Aa5Aa6Aa7Aa8Aa9Ab0Ab1Ab2Ab3Ab4Ab5Ab6Ab7Ab8Ab9Ac0Ac1Ac2Ac3Ac4Ac5Ac6Ac7Ac8Ac9Ad0Ad1Ad2Ad3Ad4Ad5Ad6Ad7Ad8Ad9Ae0Ae1Ae2Ae3Ae4Ae5Ae6Ae7Ae8Ae9Af0Af1Af2Af3Af4Af5Af6Af7Af8Af9Ag0Ag1Ag2Ag3Ag4Ag5Ag6Ag7Ag8Ag9Ah0Ah1Ah2Ah3Ah4Ah5Ah6Ah7Ah8Ah9Ai0Ai1Ai2Ai3Ai4Ai5Ai6Ai7Ai8Ai9Aj0Aj1Aj2Aj3Aj4Aj5Aj6Aj7Aj8Aj9Ak0Ak1Ak2Ak3Ak4Ak5Ak6Ak7Ak8Ak9Al0Al1Al2Al3Al4Al5Al6Al7Al8Al9Am0Am1Am2Am3Am4Am5Am6Am7Am8Am9An0An1An2An3An4An5An6An7An8An9Ao0Ao1Ao2Ao3Ao4Ao5Ao6Ao7Ao8Ao9Ap0Ap1Ap2Ap3Ap4Ap5Ap6Ap7Ap8Ap9Aq0Aq1Aq2Aq3Aq4Aq5Aq6Aq7Aq8Aq9Ar0Ar1Ar2Ar3Ar4Ar5Ar6Ar7Ar8Ar9As0As1As2As3As4As5As6As7As8As9At0At1At2At3At4At5At6At7At8At9Au0Au1Au2Au3Au4Au5Au6Au7Au8Au9Av0Av1Av2Av3Av4Av5Av6Av7Av8Av9Aw0Aw1Aw2Aw3Aw4Aw5Aw6Aw7Aw8Aw9Ax0Ax1Ax2Ax3Ax4Ax5Ax6Ax7Ax8Ax9Ay0Ay1Ay2Ay3Ay4Ay5Ay6Ay7Ay8Ay9Az0Az1Az2Az3Az4Az5Az6Az7Az8Az9Ba0Ba1Ba2Ba3Ba4Ba5Ba6Ba7Ba8Ba9Bb0Bb1Bb2Bb3Bb4Bb5Bb6Bb7Bb8Bb9Bc0Bc1Bc2Bc3Bc4Bc5Bc6Bc7Bc8Bc9Bd0Bd1Bd2Bd3Bd4Bd5Bd6Bd7Bd8Bd9Be0Be1Be2Be3Be4Be5Be6Be7Be8Be9Bf0Bf1Bf2Bf3Bf4Bf5Bf6Bf7Bf8Bf9Bg0Bg1Bg2Bg3Bg4Bg5Bg6Bg7Bg8Bg9Bh0Bh1Bh2B"]
    ])("GZipped %s", async (s, n) => {
        const expected = loadMatfile("./tests/matFiles/charTests_" + s + ".gz.mat");
        let m = new MatFileWriter();
        m.Compression = true;
        m.addVariable(s, n);
        const actual = new Uint8Array(await m.getBlob().arrayBuffer());

        // matFileWriter uses fflate, which is not binary compatible with zlib used by matlab
        // therefore compare decompressed values using zlib, so we now it is readable and contains the right content
        let zlib = require("node:zlib");
        expect(zlib.inflateSync(actual.subarray(0x88))).toEqual(zlib.inflateSync(expected.subarray(0x88)))
    });

    test.each([
        ["c_array", ['A', 'B', 'C', 'D', 'A longer string with some additional text!']],
    ])("cell array", async (s, n) => {
        const expected = loadMatfile("./tests/matFiles/charTests_" + s + ".mat");
        let m = new MatFileWriter();
        m.Compression = false;
        m.addVariable(s, n);
        const actual = new Uint8Array(await m.getBlob().arrayBuffer());
        expect(actual).toMatchMatFile(expected);
    })

    test.each([
        ["c_array", ['A', 'B', 'C', 'D', 'A longer string with some additional text!']],
    ])("GZipped %s", async (s, n) => {
        const expected = loadMatfile("./tests/matFiles/charTests_" + s + ".gz.mat");
        let m = new MatFileWriter();
        m.Compression = true;
        m.addVariable(s, n);
        const actual = new Uint8Array(await m.getBlob().arrayBuffer());

        // matFileWriter uses fflate, which is not binary compatible with zlib used by matlab
        // therefore compare decompressed values using zlib, so we now it is readable and contains the right content
        let zlib = require("node:zlib");
        expect(zlib.inflateSync(actual.subarray(0x88))).toEqual(zlib.inflateSync(expected.subarray(0x88)))
    });
});

describe("Structs", () => {
    const numeric = [
        ["f32", new Float32Array([-1234567.890])],
        ["f32_array", new Float32Array([-1234567.890, 0, +1234567.890, 1.1755e-38, 3.4028e+38])],
        ["f64", new Float64Array([-1234567.890123456789])],
        ["f64_array", new Float64Array([-1234567.890123456789, 0, +1234567.890123456789, 2.225073858507201e-308, 1.797693134862316e+308])],
        ["i8", new Int8Array([-8])],
        ["i8_array", new Int8Array([-128, 0, 127])],
        ["ui8", new Uint8Array([8])],
        ["ui8_array", new Uint8Array([0, 128, 255])],
        ["i16", new Int16Array([-1616])],
        ["i16_array", new Int16Array([-32768, 0, 32767])],
        ["ui16", new Uint16Array([1616])],
        ["ui16_array", new Uint16Array([0, 32768, 65535])],
        ["i32", new Int32Array([-32323232])],
        ["i32_array", new Int32Array([-2147483648, 0, 2147483647])],
        ["ui32", new Uint32Array([32323232])],
        ["ui32_array", new Uint32Array([0, 2147483648, 4294967295])],
        ["i64", new BigInt64Array([-646464646464646464n])],
        ["i64_array", new BigInt64Array([-9223372036854775808n, 0n, 9223372036854775807n])],
        ["ui64", new BigUint64Array([646464646464646464n])],
        ["ui64_array", new BigUint64Array([0n, 9223372036854775808n, 18446744073709551615n])],
    ];
    const chars = [
        ["c_1", "A"],
        ["c_42", "A longer string with some additional text!"],
        ["c_1000", "Aa0Aa1Aa2Aa3Aa4Aa5Aa6Aa7Aa8Aa9Ab0Ab1Ab2Ab3Ab4Ab5Ab6Ab7Ab8Ab9Ac0Ac1Ac2Ac3Ac4Ac5Ac6Ac7Ac8Ac9Ad0Ad1Ad2Ad3Ad4Ad5Ad6Ad7Ad8Ad9Ae0Ae1Ae2Ae3Ae4Ae5Ae6Ae7Ae8Ae9Af0Af1Af2Af3Af4Af5Af6Af7Af8Af9Ag0Ag1Ag2Ag3Ag4Ag5Ag6Ag7Ag8Ag9Ah0Ah1Ah2Ah3Ah4Ah5Ah6Ah7Ah8Ah9Ai0Ai1Ai2Ai3Ai4Ai5Ai6Ai7Ai8Ai9Aj0Aj1Aj2Aj3Aj4Aj5Aj6Aj7Aj8Aj9Ak0Ak1Ak2Ak3Ak4Ak5Ak6Ak7Ak8Ak9Al0Al1Al2Al3Al4Al5Al6Al7Al8Al9Am0Am1Am2Am3Am4Am5Am6Am7Am8Am9An0An1An2An3An4An5An6An7An8An9Ao0Ao1Ao2Ao3Ao4Ao5Ao6Ao7Ao8Ao9Ap0Ap1Ap2Ap3Ap4Ap5Ap6Ap7Ap8Ap9Aq0Aq1Aq2Aq3Aq4Aq5Aq6Aq7Aq8Aq9Ar0Ar1Ar2Ar3Ar4Ar5Ar6Ar7Ar8Ar9As0As1As2As3As4As5As6As7As8As9At0At1At2At3At4At5At6At7At8At9Au0Au1Au2Au3Au4Au5Au6Au7Au8Au9Av0Av1Av2Av3Av4Av5Av6Av7Av8Av9Aw0Aw1Aw2Aw3Aw4Aw5Aw6Aw7Aw8Aw9Ax0Ax1Ax2Ax3Ax4Ax5Ax6Ax7Ax8Ax9Ay0Ay1Ay2Ay3Ay4Ay5Ay6Ay7Ay8Ay9Az0Az1Az2Az3Az4Az5Az6Az7Az8Az9Ba0Ba1Ba2Ba3Ba4Ba5Ba6Ba7Ba8Ba9Bb0Bb1Bb2Bb3Bb4Bb5Bb6Bb7Bb8Bb9Bc0Bc1Bc2Bc3Bc4Bc5Bc6Bc7Bc8Bc9Bd0Bd1Bd2Bd3Bd4Bd5Bd6Bd7Bd8Bd9Be0Be1Be2Be3Be4Be5Be6Be7Be8Be9Bf0Bf1Bf2Bf3Bf4Bf5Bf6Bf7Bf8Bf9Bg0Bg1Bg2Bg3Bg4Bg5Bg6Bg7Bg8Bg9Bh0Bh1Bh2B"],
        ["c_array", ['A', 'B', 'C', 'D', 'A longer string with some additional text!']],
    ];

    let s1: {
        numeric: any
        chars: any,
    } = {
        numeric: {},
        chars: {}
    }
    numeric.forEach((a) => {
        let name = a[0] as string;
        let value = a[1];
        s1.numeric[name] = value;
    });
    chars.forEach((a) => {
        let name = a[0] as string;
        let value = a[1];
        s1.chars[name] = value;
    });
    let nested = {
        "s1": {
            "numeric": s1.numeric,
            "chars": s1.chars,
            "name": "Nested1",
        },
        "s2": {
            "numeric": s1.numeric,
            "chars": s1.chars,
            "name": "Nested2",
        },
    }
    test("Struct 1", async () => {
        const expected = loadMatfile("./tests/matFiles/structTests_s1.mat");
        let m = new MatFileWriter();
        m.Compression = false;
        m.addVariable("s1", s1);
        const actual = new Uint8Array(await m.getBlob().arrayBuffer());
        expect(actual).toMatchMatFile(expected);
    });
    test("Struct 2", async () => {
        const expected = loadMatfile("./tests/matFiles/structTests_nested.mat");
        let m = new MatFileWriter();
        m.Compression = false;
        m.addVariable("nested", nested);
        const actual = new Uint8Array(await m.getBlob().arrayBuffer());
        expect(actual).toMatchMatFile(expected);
    });
});

describe("Cells", () => {
    test.each([
        ["cell1", ["A", 1, 0]],
        ["cell2", ["A", 1, [1, 2, 3, 4, "five"]]]
    ])("%s", async (s, n) => {
        const expected = loadMatfile("./tests/matFiles/cellTests_" + s + ".mat");
        let m = new MatFileWriter();
        m.Compression = false;
        m.addVariable(s, n);
        const actual = new Uint8Array(await m.getBlob().arrayBuffer());
        expect(actual).toMatchMatFile(expected);
    });
});