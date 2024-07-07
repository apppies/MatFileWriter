import { MatFileWriter } from "./matFileWriter";

let toConvert = {
    'var1': [-1, -2, 3, 4],
    'var2': 1,
    'var3': [{
        'X': 1,
        'Y': [0.2, 0.2, 0.3],
        'Z': ["a nested mixed array", "with a", 1]
    },{
        'X': 3,
        'Y': [3, 0.2, 0.3],
        'Z': ["a nested mixed array", "with a", 1]
    }
] 
};

let writer = new MatFileWriter();
Object.entries(toConvert).forEach(([k,v]) => writer.addVariable(k, v));
let blob = writer.getBlob();

document.getElementById("write_file").addEventListener("click", () => writeFile(toConvert));

async function writeFile(data: any) {
    let writer = new MatFileWriter();
    writer.Compression = true;
    Object.entries(data).forEach(([k,v]) => writer.addVariable(k, v));
    let blob = writer.getBlob();

    var a = document.createElement("a");
    document.body.appendChild(a);
    let url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = "blob";
    a.click();
    window.URL.revokeObjectURL(url);
}

async function showFile(blob: Blob) {
    const reader = new FileReader();
    reader.readAsArrayBuffer(blob);

    let oldTable = document.getElementsByTagName("table");
    if (oldTable.length > 0)
        oldTable[0].remove();

    //  Show as hex
    let t = document.createElement("table");
    let thead = t.createTHead();
    let tbody = t.createTBody();
    let r = tbody.insertRow();

    let c = r.insertCell()
    c.appendChild(document.createTextNode("Byte"));
    for (let index = 0; index < 8; index++) {
        let c = r.insertCell();
        c.appendChild(document.createTextNode(`${index + 1}`));
    }


    let v = new Uint8Array(await blob.arrayBuffer());
    for (let iRow = 0; iRow < Math.ceil(v.length / 8); iRow++) {
        r = tbody.insertRow();
        let c = r.insertCell()
        c.appendChild(document.createTextNode(`${(iRow * 8).toString(16).padStart(4, "0")}:${(iRow * 8 + 7).toString(16).padStart(4, "0")}`));
        for (let index = 0; index < 8; index++) {
            let c = r.insertCell();
            let iByte = iRow * 8 + index;
            if (iByte < v.length)
                c.appendChild(document.createTextNode(`${v[iByte].toString(16).padStart(2, "0")}`));
            else
                c.appendChild(document.createTextNode("00"));
        }
    }

    document.body.appendChild(t)
}

showFile(blob);