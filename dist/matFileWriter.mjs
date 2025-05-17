// src/matFileWriter.ts
import { zlibSync } from "fflate";
var MatFileWriter = class {
  matFile = [];
  constructor() {
    this.matFile = [];
    this.matFile.push(...this.createMatFileHeader());
  }
  compressionEnabled = true;
  get Compression() {
    return this.compressionEnabled;
  }
  set Compression(v) {
    this.compressionEnabled = v;
  }
  /**
   * Add variable with given name and value to the current matlab file
   * @param name Variable name
   * @param value Variable data
   */
  addVariable(name, value) {
    this.matFile.push(...this.createMatArray(value, name, true));
  }
  sizeOfDataType(dataType) {
    switch (dataType) {
      case 1 /* miINT8 */:
      case 2 /* miUINT8 */:
        return 1;
      case 3 /* miINT16 */:
      case 4 /* miUINT16 */:
        return 2;
      case 7 /* miSINGLE */:
      case 5 /* miINT32 */:
      case 6 /* miUINT32 */:
        return 4;
      case 9 /* miDOUBLE */:
      case 12 /* miINT64 */:
      case 13 /* miUINT64 */:
        return 8;
      default:
        break;
    }
    return 0;
  }
  createMatFileHeader() {
    let headerText = new Uint8Array(116);
    let headerSubsystem = new Uint8Array(8);
    let headerVersion = new Uint16Array(2);
    const datetimeString = (/* @__PURE__ */ new Date()).toISOString();
    let text = `MATLAB 5.0 MAT-file, Created using MatFileWriter on ${datetimeString}`;
    Array.from(text).forEach((v, i) => headerText[i] = v.charCodeAt(0));
    headerVersion[0] = 256;
    headerVersion[1] = 19785;
    return [headerText, headerSubsystem, headerVersion];
  }
  getMatDataTypeFromTypedArray(typedArray) {
    let dataType;
    switch (typedArray.constructor.name) {
      case "Int8Array":
        dataType = 1 /* miINT8 */;
        break;
      case "Uint8Array":
        dataType = 2 /* miUINT8 */;
        break;
      case "Int16Array":
        dataType = 3 /* miINT16 */;
        break;
      case "Uint16Array":
        dataType = 4 /* miUINT16 */;
        break;
      case "Int32Array":
        dataType = 5 /* miINT32 */;
        break;
      case "Uint32Array":
        dataType = 6 /* miUINT32 */;
        break;
      case "BigInt64Array":
        dataType = 12 /* miINT64 */;
        break;
      case "BigUint64Array":
        dataType = 13 /* miUINT64 */;
        break;
      case "Float32Array":
        dataType = 7 /* miSINGLE */;
        break;
      case "Float64Array":
      default:
        dataType = 9 /* miDOUBLE */;
        break;
    }
    return dataType;
  }
  getMatArrayTypeFromTypedArray(typedArray) {
    let dataType;
    switch (typedArray.constructor.name) {
      case "Int8Array":
        dataType = 8 /* mxINT8_CLASS */;
        break;
      case "Uint8Array":
        dataType = 9 /* mxUINT8_CLASS */;
        break;
      case "Int16Array":
        dataType = 10 /* mxINT16_CLASS */;
        break;
      case "Uint16Array":
        dataType = 11 /* mxUINT16_CLASS */;
        break;
      case "Int32Array":
        dataType = 12 /* mxINT32_CLASS */;
        break;
      case "Uint32Array":
        dataType = 13 /* mxUINT32_CLASS */;
        break;
      case "BigInt64Array":
        dataType = 14 /* mxINT64_CLASS */;
        break;
      case "BigUint64Array":
        dataType = 15 /* mxUINT64_CLASS */;
        break;
      case "Float32Array":
        dataType = 7 /* mxSINGLE_CLASS */;
        break;
      case "Float64Array":
      default:
        dataType = 6 /* mxDOUBLE_CLASS */;
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
  createDataElementFromTypedArray(data, dataType = 0 /* UNDEFINED */) {
    if (!Array.isArray(data)) {
      data = [data];
    }
    if (dataType == 0 /* UNDEFINED */) {
      dataType = this.getMatDataTypeFromTypedArray(data[0]);
    }
    let totalDataByteLength = data.reduce((sum, element) => sum + element.byteLength, 0);
    let tag;
    if (totalDataByteLength > 0 && totalDataByteLength <= 4) {
      tag = new Uint16Array(2);
      tag[0] = dataType;
      tag[1] = totalDataByteLength;
    } else {
      tag = new Uint32Array(2);
      tag[0] = dataType;
      tag[1] = totalDataByteLength;
    }
    let totalByteLength = tag.byteLength + totalDataByteLength;
    let next8Byte = Math.ceil(totalByteLength / 8) * 8;
    let padding = new Uint8Array(next8Byte - totalByteLength);
    return [tag, ...data, padding];
  }
  createDataElementFromNumbers(dataType, values) {
    if (!Array.isArray(values)) {
      values = [values];
    }
    let data;
    switch (dataType) {
      case 1 /* miINT8 */:
        data = new Int8Array(values.length);
        break;
      case 2 /* miUINT8 */:
        data = new Uint8Array(values.length);
        break;
      case 3 /* miINT16 */:
        data = new Int16Array(values.length);
        break;
      case 4 /* miUINT16 */:
        data = new Uint16Array(values.length);
        break;
      case 5 /* miINT32 */:
        data = new Int32Array(values.length);
        break;
      case 6 /* miUINT32 */:
        data = new Uint32Array(values.length);
        break;
      case 12 /* miINT64 */:
        data = new BigInt64Array(values.length);
        break;
      case 13 /* miUINT64 */:
        data = new BigUint64Array(values.length);
        break;
      case 7 /* miSINGLE */:
        data = new Float32Array(values.length);
        break;
      case 9 /* miDOUBLE */:
      default:
        data = new Float64Array(values.length);
        break;
    }
    values.forEach((v, i) => data[i] = v);
    return this.createDataElementFromTypedArray(data, dataType);
  }
  stringToUtf8(str) {
    let t = new TextEncoder();
    return t.encode(str);
  }
  // Determine the smallest data type that fits all numbers
  getSmallestDataType(values) {
    let min = 0;
    let max = 0;
    let isInteger = true;
    let isNumber = false;
    values.forEach((v) => {
      if (typeof v == "number") {
        isNumber = true;
        if (v < min) min = v;
        if (v > max) max = v;
        if (isInteger) isInteger = Number.isInteger(v);
      }
    });
    if (isNumber == false) {
      return 9 /* miDOUBLE */;
    }
    let absMin = Math.min(Math.abs(min), max);
    let absMax = Math.max(Math.abs(min), max);
    let dataType = 9 /* miDOUBLE */;
    if (isInteger) {
      if (min == 0 && absMax <= 255) dataType = 2 /* miUINT8 */;
      else if (min >= -128 && max <= 127) dataType = 1 /* miINT8 */;
      else if (min == 0 && absMax <= 65535) dataType = 4 /* miUINT16 */;
      else if (min >= -32768 && max <= 32767) dataType = 3 /* miINT16 */;
      else if (min == 0 && absMax <= 4294967295) dataType = 6 /* miUINT32 */;
      else if (min >= -2147483648 && max <= 2147483647) dataType = 5 /* miINT32 */;
    } else {
      dataType = 9 /* miDOUBLE */;
    }
    return dataType;
  }
  /**
   * Creates a matrix containing numbers.
   * Only accepts 1-D arrays
   * Assumes numbers are to be represented as doubles
   * Might use a smaller range when possible for saving
   */
  createNumericArray(name, realValues, complexValues = []) {
    let matrix = [];
    let tag = new Uint32Array(2);
    tag[0] = 14 /* miMATRIX */;
    matrix.push(tag);
    const _flags = 0;
    let _class = 6 /* mxDOUBLE_CLASS */;
    if (this.isTypedArray(realValues)) {
      _class = this.getMatArrayTypeFromTypedArray(realValues);
    }
    let arrayFlags = this.createDataElementFromNumbers(6 /* miUINT32 */, [(_flags << 8) + _class, 0]);
    matrix.push(...arrayFlags);
    let dimensionArray = this.createDataElementFromNumbers(5 /* miINT32 */, [1, realValues.length]);
    matrix.push(...dimensionArray);
    let arrayName = this.createDataElementFromTypedArray(this.stringToUtf8(name), 1 /* miINT8 */);
    matrix.push(...arrayName);
    let valueType = 9 /* miDOUBLE */;
    if (!ArrayBuffer.isView(realValues)) {
      valueType = this.getSmallestDataType(realValues);
    }
    if (Array.isArray(complexValues) && complexValues.length > 0) {
      valueType = Math.max(valueType, this.getSmallestDataType(complexValues));
    }
    if (ArrayBuffer.isView(realValues)) {
      let realData = this.createDataElementFromTypedArray(realValues);
      matrix.push(...realData);
    } else {
      let realData = this.createDataElementFromNumbers(valueType, realValues);
      matrix.push(...realData);
      if (Array.isArray(complexValues) && complexValues.length > 0) {
        let complexData = this.createDataElementFromNumbers(valueType, realValues);
        matrix.push(...complexData);
      }
    }
    tag[1] = matrix.reduce((sum, element) => sum + element.byteLength, 0) - 8;
    return matrix;
  }
  /**
   * Creates a matrix containing numbers.
   * Only accepts 1-D arrays of string
   * Each string will be saved as a char array with the same length by padding spaces
   */
  createCharArray(name, lines) {
    let matrix = [];
    let tag = new Uint32Array(2);
    tag[0] = 14 /* miMATRIX */;
    matrix.push(tag);
    const _flags = 0;
    const _class = 4 /* mxCHAR_CLASS */;
    let arrayFlags = this.createDataElementFromNumbers(6 /* miUINT32 */, [(_flags << 8) + _class, 0]);
    matrix.push(...arrayFlags);
    let maxLineLength = lines[0].length;
    lines.forEach((l) => {
      if (l.length > maxLineLength) maxLineLength = l.length;
    });
    let dimensionArray = this.createDataElementFromNumbers(5 /* miINT32 */, [lines.length, maxLineLength]);
    matrix.push(...dimensionArray);
    let arrayName = this.createDataElementFromTypedArray(this.stringToUtf8(name), 1 /* miINT8 */);
    matrix.push(...arrayName);
    let charData = new Uint8Array(lines.length * maxLineLength);
    let utf8Lines = lines.map((l) => this.stringToUtf8(l));
    let iChar = 0;
    for (let iCol = 0; iCol < maxLineLength; iCol++) {
      for (let iRow = 0; iRow < lines.length; iRow++) {
        charData[iChar] = iCol < utf8Lines[iRow].length ? utf8Lines[iRow][iCol] : 32;
        iChar++;
      }
    }
    let data = this.createDataElementFromTypedArray(charData, 16 /* miUTF8 */);
    matrix.push(...data);
    tag[1] = matrix.reduce((sum, element) => sum + element.byteLength, 0) - 8;
    return matrix;
  }
  /**
   * Same as createCharArray, but saves string as UTF16. Not used
   * Creates a matrix containing numbers.
   * Only accepts 1-D arrays of string
   * Each string will be saved as a char array with the same length by padding spaces
   */
  createCharArrayUtf16(name, lines) {
    let matrix = [];
    let tag = new Uint32Array(2);
    tag[0] = 14 /* miMATRIX */;
    matrix.push(tag);
    const _flags = 0;
    const _class = 4 /* mxCHAR_CLASS */;
    let arrayFlags = this.createDataElementFromNumbers(6 /* miUINT32 */, [(_flags << 8) + _class, 0]);
    matrix.push(...arrayFlags);
    let maxLineLength = lines[0].length;
    lines.forEach((l) => {
      if (l.length > maxLineLength) maxLineLength = l.length;
    });
    let dimensionArray = this.createDataElementFromNumbers(5 /* miINT32 */, [lines.length, maxLineLength]);
    matrix.push(...dimensionArray);
    let arrayName = this.createDataElementFromTypedArray(this.stringToUtf8(name), 1 /* miINT8 */);
    matrix.push(...arrayName);
    let charData = new Uint16Array(lines.length * maxLineLength);
    let iChar = 0;
    for (let iCol = 0; iCol < maxLineLength; iCol++) {
      for (let iRow = 0; iRow < lines.length; iRow++) {
        charData[iChar] = iCol < lines[iRow].length ? lines[iRow].charCodeAt(iCol) : 32;
        iChar++;
      }
    }
    let data = this.createDataElementFromTypedArray(charData, 17 /* miUTF16 */);
    matrix.push(...data);
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
  createCellArray(name, values) {
    let matrix = [];
    let tag = new Uint32Array(2);
    tag[0] = 14 /* miMATRIX */;
    matrix.push(tag);
    const _flags = 0;
    const _class = 1 /* mxCELL_CLASS */;
    let arrayFlags = this.createDataElementFromNumbers(6 /* miUINT32 */, [(_flags << 8) + _class, 0]);
    matrix.push(...arrayFlags);
    let dimensionArray = this.createDataElementFromNumbers(5 /* miINT32 */, [1, values.length]);
    matrix.push(...dimensionArray);
    let arrayName = this.createDataElementFromTypedArray(this.stringToUtf8(name), 1 /* miINT8 */);
    matrix.push(...arrayName);
    values.forEach((v) => {
      if (Array.isArray(v))
        matrix.push(...this.createMatArray(v));
      else
        matrix.push(...this.createMatArray([v]));
    });
    tag[1] = matrix.reduce((sum, element) => sum + element.byteLength, 0) - 8;
    return matrix;
  }
  /**
   * Test if all provided objects have the same keys
   * @param objects 
   */
  allObjectsHaveTheSameKeys(objects) {
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
  allElementsHaveTheSameType(array) {
    function myType(o) {
      let t2 = typeof o;
      if (t2 == "object") t2 = o.constructor.name;
      return t2;
    }
    let t = myType(array[0]);
    for (let i = 1; i < array.length; i++) {
      if (t != myType(array[i])) {
        return false;
      }
    }
    return true;
  }
  isTypedArray(arg) {
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
    ];
    return supportedTypes.includes(arg.constructor.name);
  }
  /**
   * Create a matrix most suited to host the given values 
   * @param values 
   * @returns 
   */
  createMatArray(data, name = "", toplevel = false) {
    let values;
    if (Array.isArray(data) || this.isTypedArray(data)) {
      values = data;
    } else {
      values = [data];
    }
    let matrix = [];
    if (this.isTypedArray(values)) {
      matrix = this.createNumericArray(name, values);
    } else if (values.length == 1 && this.isTypedArray(values[0])) {
      matrix = this.createNumericArray(name, values[0]);
    } else {
      let allElementsHaveTheSameType = this.allElementsHaveTheSameType(values);
      if (allElementsHaveTheSameType && typeof values[0] == "number") {
        matrix = this.createNumericArray(name, values);
      } else if (allElementsHaveTheSameType && typeof values[0] == "string") {
        if (values.length == 1) {
          matrix = this.createCharArray(name, values);
        } else {
          matrix = this.createCellArray(name, values);
        }
      } else if (allElementsHaveTheSameType && values[0].constructor.name == "Object" && this.allObjectsHaveTheSameKeys(values)) {
        matrix = this.createStructArray(name, values);
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
  createStructArray(name, data) {
    let struct = [];
    let tag = new Uint32Array(2);
    tag[0] = 14 /* miMATRIX */;
    struct.push(tag);
    const _flags = 0;
    const _class = 2 /* mxSTRUCT_CLASS */;
    let arrayFlags = this.createDataElementFromNumbers(6 /* miUINT32 */, [(_flags << 8) + _class, 0]);
    struct.push(...arrayFlags);
    let dimensionArray = this.createDataElementFromNumbers(5 /* miINT32 */, [1, data.length]);
    struct.push(...dimensionArray);
    let arrayName = this.createDataElementFromTypedArray(this.stringToUtf8(name), 1 /* miINT8 */);
    struct.push(...arrayName);
    let keys = Object.keys(data[0]);
    let maxFieldNameLength = Math.max(...keys.map((key) => key.length)) + 1;
    let fieldNameLength = this.createDataElementFromNumbers(5 /* miINT32 */, [maxFieldNameLength]);
    struct.push(...fieldNameLength);
    let fieldNamesArray = keys.map((key) => this.stringToUtf8(key.padEnd(maxFieldNameLength, "\0")));
    let fieldNames = this.createDataElementFromTypedArray(fieldNamesArray, 1 /* miINT8 */);
    struct.push(...fieldNames);
    data.forEach((o) => {
      keys.forEach((key) => {
        const v = o[key];
        if (Array.isArray(v))
          struct.push(...this.createMatArray(v));
        else
          struct.push(...this.createMatArray([v]));
      });
    });
    tag[1] = struct.reduce((sum, element) => sum + element.byteLength, 0) - 8;
    return struct;
  }
  createZippedArray(variable) {
    let combined = new Uint8Array(variable.reduce((sum, element) => sum + element.byteLength, 0));
    let c = 0;
    for (let v of variable) {
      combined.set(new Uint8Array(v.buffer), c);
      c += v.byteLength;
    }
    const zipped = zlibSync(combined, { level: 6 });
    let tag = new Uint32Array(2);
    tag[0] = 15 /* miCOMPRESSED */;
    tag[1] = zipped.byteLength;
    return [tag, zipped];
  }
  getBlob() {
    let blob = new Blob(this.matFile);
    return blob;
  }
};
export {
  MatFileWriter
};
//# sourceMappingURL=matFileWriter.mjs.map