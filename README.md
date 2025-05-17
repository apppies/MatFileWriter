# MatFileWriter

A basic MATLAB level 5 MAT-file writer for javascript written in TypeScript. Based on the Mathworks documentation at [https://www.mathworks.com/help/pdf_doc/matlab/matfile_format.pdf](https://www.mathworks.com/help/pdf_doc/matlab/matfile_format.pdf)

## Support

MatFileWriter supports the following datatypes

- numbers: both integers and floats
- strings: saved as char arrays in the MAT file as MATLAB strings are not documented.
- objects: saved as structs. Nested objects are supported
- arrays: only 1D arrays are supported. Saved as MATLAB array if possible, saved as Cell array otherwise.

To force a specific data type, use JS Typed Arrays as input. If a normal array is used, the most data size efficient data type will be used.

Compression is enabled by default, but can be disabled if wanted.

There is no reading support, there are other modules which support that.

## Usage

See the example folder and tests for simple examples. Basic usage is as follows:

```typescript
import { MatFileWriter } from "mat-file-writer";

let writer = new MatFileWriter();
writer.addVariable("Variable1", [1,2,3]);
let blob = writer.getBlob();
```


