type TypedArray = Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | BigInt64Array | BigUint64Array | Uint8ClampedArray | Float32Array | Float64Array;
declare class MatFileWriter {
    private matFile;
    constructor();
    private compressionEnabled;
    get Compression(): boolean;
    set Compression(v: boolean);
    addVariable(name: string, value: any): void;
    private sizeOfDataType;
    private createMatFileHeader;
    private getMatDataTypeFromTypedArray;
    private getMatArrayTypeFromTypedArray;
    private createDataElementFromTypedArray;
    private createDataElementFromNumbers;
    private stringToUtf8;
    private getSmallestDataType;
    private createNumericArray;
    private createCharArray;
    private createCharArrayUtf16;
    private createCellArray;
    private allObjectsHaveTheSameKeys;
    private allElementsHaveTheSameType;
    isTypedArray(arg: any): arg is TypedArray;
    private createMatArray;
    private createStructArray;
    private createZippedArray;
    getBlob(): Blob;
}

export { MatFileWriter };
