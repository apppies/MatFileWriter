import {zlibSync} from "fflate"

type TypedArray = Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | BigInt64Array | BigUint64Array | Uint8ClampedArray | Float32Array | Float64Array;

enum DataTypes {
    UNDEFINED = 0, //
    miINT8 = 1, // 8 bit, signed
    miUINT8 = 2, // 8 bit, unsigned
    miINT16 = 3, // 16-bit, signed
    miUINT16 = 4, // 16-bit, unsigned
    miINT32 = 5, // 32-bit, signed
    miUINT32 = 6, // 32-bit, unsigned
    miSINGLE = 7, // IEEE® 754 single format
    miRESERVED1 = 8, // Reserved
    miDOUBLE = 9, // IEEE 754 double format
    miRESERVED2 = 10, // Reserved
    miRESERVED3 = 11, // Reserved
    miINT64 = 12, // 64-bit, signed
    miUINT64 = 13, // 64-bit, unsigned
    miMATRIX = 14, // MATLAB array
    miCOMPRESSED = 15, // Compressed Data
    miUTF8 = 16, // Unicode UTF-8 Encoded Character Data
    miUTF16 = 17, // Unicode UTF-16 Encoded Character Data
    miUTF32 = 18, // Unicode UTF-32 Encoded Character Data
}

enum ArrayTypes {
    mxCELL_CLASS = 1, // Cell array 
    mxSTRUCT_CLASS = 2, // Structure 
    mxOBJECT_CLASS = 3, // Object 
    mxCHAR_CLASS = 4, // Character array 
    mxSPARSE_CLASS = 5, // Sparse array 
    mxDOUBLE_CLASS = 6, // Double precision array 
    mxSINGLE_CLASS = 7, // Single precision array 
    mxINT8_CLASS = 8, // 8-bit, signed integer 
    mxUINT8_CLASS = 9, // 8-bit, unsigned integer 
    mxINT16_CLASS = 10, // 16-bit, signed integer 
    mxUINT16_CLASS = 11, // 16-bit, unsigned integer 
    mxINT32_CLASS = 12, // 32-bit, signed integer 
    mxUINT32_CLASS = 13, // 32-bit, unsigned integer 
    mxINT64_CLASS = 14, // 64-bit, signed integer 
    mxUINT64_CLASS = 15, // 64-bit, unsigned integer 
}

export class MatFileWriter {

    private matFile: TypedArray[] = [];
    constructor() {
        this.matFile = [];
        this.matFile.push(...this.createMatFileHeader());
    }

    
    private compressionEnabled : boolean = true;
    public get Compression() : boolean {
        return this.compressionEnabled;
    }
    public set Compression(v : boolean) {
        this.compressionEnabled = v;
    }
    

    /**
     * Add variable with given name and value to the current matlab file
     * @param name Variable name
     * @param value Variable data
     */
    public addVariable(name: string, value: any) {
        this.matFile.push(...this.createMatArray(value, name, true));
    }

    private sizeOfDataType(dataType: DataTypes): number {
        switch (dataType) {
            case DataTypes.miINT8:
            case DataTypes.miUINT8:
                return 1;

            case DataTypes.miINT16:
            case DataTypes.miUINT16:
                return 2;

            case DataTypes.miSINGLE:
            case DataTypes.miINT32:
            case DataTypes.miUINT32:
                return 4;

            case DataTypes.miDOUBLE:
            case DataTypes.miINT64:
            case DataTypes.miUINT64:
                return 8;

            default:
                break;
        }
        return 0;
    }

    private createMatFileHeader(): TypedArray[] {
        let headerText = new Uint8Array(116);
        let headerSubsystem = new Uint8Array(8);
        let headerVersion = new Uint16Array(2);

        const datetimeString = new Date().toISOString();
        let text = `MATLAB 5.0 MAT-file, Created using MatFileWriter on ${datetimeString}`; // limit to 116 characters
        Array.from(text).forEach((v, i) => headerText[i] = v.charCodeAt(0));
        // Version
        headerVersion[0] = 0x0100;
        // For endianness write MI
        headerVersion[1] = 0x4D49

        return [headerText, headerSubsystem, headerVersion];
    }

    private getMatDataTypeFromTypedArray(typedArray: TypedArray): DataTypes {
        let dataType: DataTypes;
        switch (typedArray.constructor.name) {
            case "Int8Array":
                dataType = DataTypes.miINT8;
                break;
            case "Uint8Array":
                dataType = DataTypes.miUINT8;
                break;
            case "Int16Array":
                dataType = DataTypes.miINT16;
                break;
            case "Uint16Array":
                dataType = DataTypes.miUINT16;
                break;
            case "Int32Array":
                dataType = DataTypes.miINT32;
                break;
            case "Uint32Array":
                dataType = DataTypes.miUINT32;
                break;
            case "BigInt64Array":
                dataType = DataTypes.miINT64;
                break;
            case "BigUint64Array":
                dataType = DataTypes.miUINT64;
                break;
            case "Float32Array":
                dataType = DataTypes.miSINGLE;
                break;
            case "Float64Array":
            default:
                dataType = DataTypes.miDOUBLE;
                break;
        }
        return dataType;
    }

    private getMatArrayTypeFromTypedArray(typedArray: TypedArray): ArrayTypes {
        let dataType: ArrayTypes;
        switch (typedArray.constructor.name) {
            case "Int8Array":
                dataType = ArrayTypes.mxINT8_CLASS;
                break;
            case "Uint8Array":
                dataType = ArrayTypes.mxUINT8_CLASS;
                break;
            case "Int16Array":
                dataType = ArrayTypes.mxINT16_CLASS;
                break;
            case "Uint16Array":
                dataType = ArrayTypes.mxUINT16_CLASS;
                break;
            case "Int32Array":
                dataType = ArrayTypes.mxINT32_CLASS;
                break;
            case "Uint32Array":
                dataType = ArrayTypes.mxUINT32_CLASS;
                break;
            case "BigInt64Array":
                dataType = ArrayTypes.mxINT64_CLASS;
                break;
            case "BigUint64Array":
                dataType = ArrayTypes.mxUINT64_CLASS;
                 break;
            case "Float32Array":
                dataType = ArrayTypes.mxSINGLE_CLASS;
                break;
            case "Float64Array":
            default:
                dataType = ArrayTypes.mxDOUBLE_CLASS;
                break;
        }
        return dataType;
    }

    /**
     * Put the data in a Data element object
     * Determines datatype based on class of first typedarray by default, can be overruled
     * @param dataType 
     * @param data 
     * @returns 
     */
    private createDataElementFromTypedArray(data: TypedArray | TypedArray[], dataType: DataTypes = DataTypes.UNDEFINED): TypedArray[] {
        if (!Array.isArray(data)) {
            // Encapsulate in an array as that is what is used for the remainder of this function
            data = [data];
        }

        if (dataType == DataTypes.UNDEFINED) {
            // Auto determine the data type
            dataType = this.getMatDataTypeFromTypedArray(data[0]);
        }

        let totalDataByteLength = data.reduce((sum, element) => sum + element.byteLength, 0);

        let tag: TypedArray;
        if (totalDataByteLength > 0 && totalDataByteLength <= 4) {
            // Compact format possible
            tag = new Uint16Array(2)
            tag[0] = dataType;
            tag[1] = totalDataByteLength;
        } else {
            tag = new Uint32Array(2)
            tag[0] = dataType;
            tag[1] = totalDataByteLength;
        }

        // Pad data to align with 8 bytes / 64 bits
        let totalByteLength = tag.byteLength + totalDataByteLength;
        let next8Byte = Math.ceil(totalByteLength / 8.0) * 8;
        let padding = new Uint8Array(next8Byte - totalByteLength);
        return [tag, ...data, padding];
    }

    private createDataElementFromNumbers(dataType: DataTypes, values: number[]): TypedArray[] {
        if (!Array.isArray(values)) {
            // Encapsulate in an array as that is what is used for the remainder of this function
            values = [values];
        }

        // Create typed array with values
        let data: TypedArray;
        switch (dataType) {
            case DataTypes.miINT8:
                data = new Int8Array(values.length);
                break;
            case DataTypes.miUINT8:
                data = new Uint8Array(values.length);
                break;
            case DataTypes.miINT16:
                data = new Int16Array(values.length);
                break;
            case DataTypes.miUINT16:
                data = new Uint16Array(values.length);
                break;
            case DataTypes.miINT32:
                data = new Int32Array(values.length);
                break;
            case DataTypes.miUINT32:
                data = new Uint32Array(values.length);
                break;
            case DataTypes.miINT64:
                data = new BigInt64Array(values.length);
                break;
            case DataTypes.miUINT64:
                data = new BigUint64Array(values.length);
                break;
            case DataTypes.miSINGLE:
                data = new Float32Array(values.length);
                break;
            case DataTypes.miDOUBLE:
            default:
                data = new Float64Array(values.length);
                break;
        }
        values.forEach((v, i) => data[i] = v);

        return this.createDataElementFromTypedArray(data, dataType);
    }

    private stringToUtf8(str: string): Uint8Array {
        let t = new TextEncoder()
        return t.encode(str);
    }

    // Determine the smallest data type that fits all numbers
    private getSmallestDataType(values: number[]): DataTypes {
        let min = 0;
        let max = 0;
        let isInteger = true;
        let isNumber = false;
        values.forEach((v) => {
            if (typeof (v) == 'number') {
                isNumber = true;
                if (v < min) min = v;
                if (v > max) max = v;
                if (isInteger) isInteger = Number.isInteger(v);
            }
        })

        if (isNumber == false) {
            // No numbers were found
            return DataTypes.miDOUBLE;
        }

        let absMin = Math.min(Math.abs(min), max);
        let absMax = Math.max(Math.abs(min), max);

        let dataType = DataTypes.miDOUBLE; // Default to double        
        if (isInteger) {
            if (min == 0 && absMax <= 255) dataType = DataTypes.miUINT8;
            else if (min >= -128 && max <= 127) dataType = DataTypes.miINT8;
            else if (min == 0 && absMax <= 65535) dataType = DataTypes.miUINT16;
            else if (min >= -32768 && max <= 32767) dataType = DataTypes.miINT16;
            else if (min == 0 && absMax <= 4294967295) dataType = DataTypes.miUINT32;
            else if (min >= -2147483648 && max <= 2147483647) dataType = DataTypes.miINT32;
        } else {
            // Dont use singles, they have less precision. We should check for each number if digits are used than don´t fit in a single
            // But that is quite some work, so default to doubles 
            // if (absMin >= 1.1755e-38 && absMax <= 3.4028e+38) dataType = MatDataTypes.miSINGLE;
            dataType = DataTypes.miDOUBLE;
        }

        return dataType;
    }

    /**
     * Creates a matrix containing numbers.
     * Only accepts 1-D arrays
     * Assumes numbers are to be represented as doubles
     * Might use a smaller range when possible for saving
     */
    private createNumericArray(name: string, realValues: number[] | TypedArray, complexValues: number[] = []): TypedArray[] {
        let matrix: TypedArray[] = [];
        let tag = new Uint32Array(2);
        tag[0] = DataTypes.miMATRIX;
        // tag[1] = number of bytes in matrix, to be set at end once all parts are in
        matrix.push(tag);

        const _flags = 0;
        let _class = ArrayTypes.mxDOUBLE_CLASS;
        if (this.isTypedArray(realValues)) {
            _class = this.getMatArrayTypeFromTypedArray(realValues);
        }
        
        let arrayFlags = this.createDataElementFromNumbers(DataTypes.miUINT32, [(_flags << 8) + _class, 0x00000000]); // 0xEFBEADDE
        matrix.push(...arrayFlags);

        let dimensionArray = this.createDataElementFromNumbers(DataTypes.miINT32, [1, realValues.length]);
        matrix.push(...dimensionArray);

        let arrayName = this.createDataElementFromTypedArray(this.stringToUtf8(name), DataTypes.miINT8); // UINT8 or UTF8 would make more sense, but docs say it should be INT8, note that higher codepoints still work
        matrix.push(...arrayName);

        let valueType: DataTypes = DataTypes.miDOUBLE;
        if (!ArrayBuffer.isView(realValues)) {
            valueType = this.getSmallestDataType(realValues);
        }

        if (Array.isArray(complexValues) && complexValues.length > 0) {
            valueType = Math.max(valueType, this.getSmallestDataType(complexValues))
        }

        if (ArrayBuffer.isView(realValues)) {
            let realData = this.createDataElementFromTypedArray(realValues);
            matrix.push(...realData);
        }
        else {
            let realData = this.createDataElementFromNumbers(valueType, realValues);
            matrix.push(...realData);

            if (Array.isArray(complexValues) && complexValues.length > 0) {
                let complexData = this.createDataElementFromNumbers(valueType, realValues);
                matrix.push(...complexData);
            }
        }

        // Set length of data of this matrix
        tag[1] = matrix.reduce((sum, element) => sum + element.byteLength, 0) - 8;
        return matrix;
    }

    /**
     * Creates a matrix containing numbers.
     * Only accepts 1-D arrays of string
     * Each string will be saved as a char array with the same length by padding spaces
     */
    private createCharArray(name: string, lines: string[]): TypedArray[] {
        let matrix: TypedArray[] = [];
        let tag = new Uint32Array(2);
        tag[0] = DataTypes.miMATRIX;
        // tag[1] = number of bytes in matrix, to be set at end once all parts are in
        matrix.push(tag);

        const _flags = 0;
        const _class = ArrayTypes.mxCHAR_CLASS;
        let arrayFlags = this.createDataElementFromNumbers(DataTypes.miUINT32, [(_flags << 8) + _class, 0x00000000]); // 0xEFBEADDE
        matrix.push(...arrayFlags);

        let maxLineLength = lines[0].length;
        lines.forEach((l) => { if (l.length > maxLineLength) maxLineLength = l.length; });

        let dimensionArray = this.createDataElementFromNumbers(DataTypes.miINT32, [lines.length, maxLineLength]);
        matrix.push(...dimensionArray);

        let arrayName = this.createDataElementFromTypedArray(this.stringToUtf8(name), DataTypes.miINT8); // UINT8 or UTF8 would make more sense, but docs say it should be INT8, note that higher codepoints still work
        matrix.push(...arrayName);

        let charData = new Uint8Array(lines.length * maxLineLength);
        let utf8Lines = lines.map((l) => this.stringToUtf8(l));
        // Create char data array, columns first as that is how matlab likes it
        let iChar = 0;
        for (let iCol = 0; iCol < maxLineLength; iCol++) {
            for (let iRow = 0; iRow < lines.length; iRow++) {
                charData[iChar] = iCol < utf8Lines[iRow].length ? utf8Lines[iRow][iCol] : 0x20;
                iChar++;
            }
        }

        let data = this.createDataElementFromTypedArray(charData, DataTypes.miUTF8);
        matrix.push(...data);

        // Set length of data of this matrix
        tag[1] = matrix.reduce((sum, element) => sum + element.byteLength, 0) - 8;
        return matrix;
    }

    /**
     * Same as createCharArray, but saves string as UTF16. Not used
     * Creates a matrix containing numbers.
     * Only accepts 1-D arrays of string
     * Each string will be saved as a char array with the same length by padding spaces
     */
    private createCharArrayUtf16(name: string, lines: string[]): TypedArray[] {
        let matrix: TypedArray[] = [];
        let tag = new Uint32Array(2);
        tag[0] = DataTypes.miMATRIX;
        // tag[1] = number of bytes in matrix, to be set at end once all parts are in
        matrix.push(tag);

        const _flags = 0;
        const _class = ArrayTypes.mxCHAR_CLASS;
        let arrayFlags = this.createDataElementFromNumbers(DataTypes.miUINT32, [(_flags << 8) + _class, 0x00000000]); // 0xEFBEADDE
        matrix.push(...arrayFlags);

        let maxLineLength = lines[0].length;
        lines.forEach((l) => { if (l.length > maxLineLength) maxLineLength = l.length; });

        let dimensionArray = this.createDataElementFromNumbers(DataTypes.miINT32, [lines.length, maxLineLength]);
        matrix.push(...dimensionArray);

        let arrayName = this.createDataElementFromTypedArray(this.stringToUtf8(name), DataTypes.miINT8); // UINT8 or UTF8 would make more sense, but docs say it should be INT8, note that higher codepoints still work
        matrix.push(...arrayName);

        let charData = new Uint16Array(lines.length * maxLineLength);
        // Create char data array, columns first as that is how matlab likes it
        let iChar = 0;
        for (let iCol = 0; iCol < maxLineLength; iCol++) {
            for (let iRow = 0; iRow < lines.length; iRow++) {
                charData[iChar] = iCol < lines[iRow].length ? lines[iRow].charCodeAt(iCol) : 0x0020;
                iChar++;
            }
        }

        let data = this.createDataElementFromTypedArray(charData, DataTypes.miUTF16);
        matrix.push(...data);

        // Set length of data of this matrix
        tag[1] = matrix.reduce((sum, element) => sum + element.byteLength, 0) - 8;
        return matrix;
    }

    /**
     * Creates a matrix containing cells.
     * Only accepts 1-D arrays
     * Converts strings to numeric arrays containg chars
     * Converts objects to structs
     * Converts numbers to numeric array
     */
    private createCellArray(name: string, values: object[] | number[] | string[]): TypedArray[] {
        let matrix: TypedArray[] = [];
        let tag = new Uint32Array(2);
        tag[0] = DataTypes.miMATRIX;
        // tag[1] = number of bytes in matrix, to be set at end once all parts are in
        matrix.push(tag);

        const _flags = 0;
        const _class = ArrayTypes.mxCELL_CLASS;
        let arrayFlags = this.createDataElementFromNumbers(DataTypes.miUINT32, [(_flags << 8) + _class, 0x00000000]); // 0xEFBEADDE
        matrix.push(...arrayFlags);

        let dimensionArray = this.createDataElementFromNumbers(DataTypes.miINT32, [1, values.length]);
        matrix.push(...dimensionArray);

        let arrayName = this.createDataElementFromTypedArray(this.stringToUtf8(name), DataTypes.miINT8); // UINT8 or UTF8 would make more sense, but docs say it should be INT8, note that higher codepoints still work
        matrix.push(...arrayName);

        values.forEach((v) => {
            if (Array.isArray(v))
                matrix.push(...this.createMatArray(v));
            else
                matrix.push(...this.createMatArray([v]));
        })

        // Set length of data of this matrix
        tag[1] = matrix.reduce((sum, element) => sum + element.byteLength, 0) - 8;
        return matrix;
    }

    /**
     * Test if all provided objects have the same keys
     * @param objects 
     */
    private allObjectsHaveTheSameKeys(objects: object[]): boolean {
        const keys1 = Object.keys(objects[0]).sort();
        for (let iObject = 1; iObject < objects.length; iObject++) {
            const keys2 = Object.keys(objects[iObject]).sort();

            if (keys1.length != keys2.length) {
                return false;
            }
            for (let iKey = 0; iKey < keys1.length; iKey++) {
                if (keys1[iKey] != keys2[iKey]) {
                    return false;
                }
            }
        }
        return true;
    }

    private allElementsHaveTheSameType(array: any[]): boolean {
        function myType(o: any): string {
            let t = typeof (o);
            if (t == 'object') t = o.constructor.name;
            return t;
        }

        let t = myType(array[0]);
        for (let i = 1; i < array.length; i++) {
            if (t != myType(array[i])) {
                return false;
            }
        }

        return true;
    }

    isTypedArray(arg: any): arg is TypedArray {
        // Auto determine the data type
        const supportedTypes = [
          "Int8Array", 
          "Uint8Array",
          "Int16Array",
          "Uint16Array",
          "Int32Array",
          "Uint32Array",
          "BigInt64Array",
          "BigUint64Array",
          "Float32Array",
          "Float64Array"
        ]
        return supportedTypes.includes(arg.constructor.name)
    }

    /**
     * Create a matrix most suited to host the given values 
     * @param values 
     * @returns 
     */
    private createMatArray(data: any, name: string = "", toplevel = false): TypedArray[] {
        let values: any[] | TypedArray;
        if (Array.isArray(data) || this.isTypedArray(data)) {
            values = data;
        } else {
            values = [data];
        }

        let matrix: TypedArray[] = [];

        if (this.isTypedArray(values)) {
            matrix = this.createNumericArray(name, values)
        } else if (values.length == 1 && this.isTypedArray(values[0])) {
            matrix = this.createNumericArray(name, values[0])
        } else {
            let allElementsHaveTheSameType = this.allElementsHaveTheSameType(values);


            if (allElementsHaveTheSameType && typeof (values[0]) == 'number') {
                matrix = this.createNumericArray(name, values as number[]);
            }
            else if (allElementsHaveTheSameType && typeof (values[0]) == 'string') {
                if (values.length == 1) {
                    matrix = this.createCharArray(name, values as string[]);
                } else {
                    // A cell array of chars is more likely to be the better fit for an array of strings
                    matrix = this.createCellArray(name, values);
                }

            }
            else if (allElementsHaveTheSameType && values[0].constructor.name == 'Object' && this.allObjectsHaveTheSameKeys(values)) {
                matrix = this.createStructArray(name, values as object[]);
            } else {
                matrix = this.createCellArray(name, values);
            }
        }

        if (toplevel && this.compressionEnabled)
            return this.createZippedArray(matrix);
        else
            return matrix;
    }

    /**
     * Create a matlab struct array
     * Only supports 1-D objects
     * @param data An array of objects of the same type
     */
    private createStructArray(name: string, data: { [key: string]: any }[]) {
        let struct: TypedArray[] = []; let tag = new Uint32Array(2);
        tag[0] = DataTypes.miMATRIX;
        // tag[1] = number of bytes in matrix, to be set at end once all parts are in
        struct.push(tag);

        const _flags = 0;
        const _class = ArrayTypes.mxSTRUCT_CLASS;
        let arrayFlags = this.createDataElementFromNumbers(DataTypes.miUINT32, [(_flags << 8) + _class, 0x00000000]); //0xEFBEADDE
        struct.push(...arrayFlags);

        let dimensionArray = this.createDataElementFromNumbers(DataTypes.miINT32, [1, data.length]);
        struct.push(...dimensionArray);

        let arrayName = this.createDataElementFromTypedArray(this.stringToUtf8(name), DataTypes.miINT8); // UINT8 or UTF8 would make more sense, but docs say it should be INT8, note that higher codepoints still work
        struct.push(...arrayName);

        // Determine fieldnames
        let keys = Object.keys(data[0]);

        // Use the maximum of X characters for the field name in the struct
        let maxFieldNameLength = Math.max(...keys.map((key) => key.length)) + 1;
        //if (maxFieldNameLength < 64) maxFieldNameLength = 64;

        let fieldNameLength = this.createDataElementFromNumbers(DataTypes.miINT32, [maxFieldNameLength]);
        struct.push(...fieldNameLength);

        // Create a single large array with all field names concatenated, each mapped to a maxFieldNameLength bytes int8 array, each name should end with NULL byte
        let fieldNamesArray = keys.map((key) => this.stringToUtf8(key.padEnd(maxFieldNameLength, "\u0000")))
        let fieldNames = this.createDataElementFromTypedArray(fieldNamesArray, DataTypes.miINT8);
        struct.push(...fieldNames);

        // Create a matrix for each key and add it
        data.forEach((o) => {
            keys.forEach((key) => {
                const v = o[key];
                if (Array.isArray(v))
                    struct.push(...this.createMatArray(v));
                else
                    struct.push(...this.createMatArray([v]));
            })
        });


        // Set length of data of this struct
        tag[1] = struct.reduce((sum, element) => sum + element.byteLength, 0) - 8;
        return struct;
    }

    private createZippedArray(variable: TypedArray[]) : TypedArray[] {
        let combined = new Uint8Array(variable.reduce((sum, element) => sum + element.byteLength, 0));
        let c = 0;
        for (let v of variable) {
            combined.set(new Uint8Array(v.buffer), c);
            c += v.byteLength;
        }

        const zipped = zlibSync(combined, {level: 6});

        let tag = new Uint32Array(2);
        tag[0] = DataTypes.miCOMPRESSED;
        tag[1] = zipped.byteLength;

        return [tag, zipped];
    }

    public getBlob(): Blob {
        let blob = new Blob(this.matFile);
        return blob;
    }

}