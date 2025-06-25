const { resolveInclude } = require("ejs");

//everynode is a byte, freq and left right are the children
class HuffmanNode {
    constructor(byte, freq, left = null, right = null) {
        this.byte = byte;
        this.freq = freq;
        this.left = left;
        this.right = right;
    }
}

function countFrequencies(buffer) {
    const freqMap = new Map();
    for (let i = 0; i < buffer.length; i++) {
        const byte = buffer[i];
        freqMap.set(byte, (freqMap.get(byte) || 0) + 1);
    }
    return freqMap;
}

//lowest freq wale merge hote h
function createHuffmanTree(freqMap) {
    const nodes = Array.from(freqMap.entries()).map(([byte, freq]) => new HuffmanNode(byte, freq));
    while (nodes.length > 1) {
        nodes.sort((a, b) => a.freq - b.freq);
        const left = nodes.shift();
        const right = nodes.shift();
        nodes.push(new HuffmanNode(null, left.freq + right.freq, left, right));
    }
    return nodes[0];
}

function mapCodesFromTree(node, prefix = '', codeMap = {}) {
    if (!node.left && !node.right) {
        codeMap[node.byte.toString()] = prefix;
        return;
    }
    mapCodesFromTree(node.left, prefix + '0', codeMap);
    mapCodesFromTree(node.right, prefix + '1', codeMap);
    return codeMap;
}

function treeToFlatArray(node, result = []) {
    if (!node.left && !node.right) {
        result.push(1);
        result.push(node.byte);
    } else {
        result.push(0);
        treeToFlatArray(node.left, result);
        treeToFlatArray(node.right, result);
    }
    return result;
}

function arrayToTree(data, idxRef) {
    const bit = data[idxRef.i++];
    if (bit === 1) {
        const byte = data[idxRef.i++];
        return new HuffmanNode(byte, 0);
    } else {
        const left = arrayToTree(data, idxRef);
        const right = arrayToTree(data, idxRef);
        return new HuffmanNode(null, 0, left, right);
    }
}

//aka bitsteam
function encodeToBitStream(buffer, codeMap) {
    let bits = '';
    for (let i = 0; i < buffer.length; i++) {
        bits += codeMap[buffer[i].toString()];
    }
    return bits;
}

function compressHuffman(buffer) {
    const freqMap = countFrequencies(buffer);
    const tree = createHuffmanTree(freqMap);
    const codeMap = mapCodesFromTree(tree);
    const bitStream = encodeToBitStream(buffer, codeMap);

    const padLength = (8 - (bitStream.length % 8)) % 8;
    const paddedBitStream = bitStream + '0'.repeat(padLength);

    const bytes = [];
    for (let i = 0; i < paddedBitStream.length; i += 8) {
        bytes.push(parseInt(paddedBitStream.slice(i, i + 8), 2));
    }

    const treeSerialized = treeToFlatArray(tree);
    const header = Buffer.alloc(1 + treeSerialized.length);
    header[0] = padLength;
    for (let j = 0; j < treeSerialized.length; j++) {
        header[j + 1] = treeSerialized[j];
    }

    return Buffer.concat([header, Buffer.from(bytes)]);
}

function decompressHuffman(buffer) {
    const padLength = buffer[0];
    const treeBytes = [];
    let i = 1;
    while (i < buffer.length) {
        treeBytes.push(buffer[i]);
        i++;
    }

    const indexRef = { i: 0 };
    const tree = arrayToTree(treeBytes, indexRef);
    const compressedDataStart = 1 + indexRef.i;
    const data = buffer.slice(compressedDataStart);

    let bits = '';
    for (let k = 0; k < data.length; k++) {
        bits += data[k].toString(2).padStart(8, '0');
    }
    bits = bits.slice(0, -padLength);

    let node = tree;
    const result = [];
    for (let bit of bits) {
        node = bit === '0' ? node.left : node.right;
        if (!node.left && !node.right) {
            result.push(node.byte);
            node = tree;
        }
    }

    return Buffer.from(result);
}

module.exports = {
    compressHuffman,
    decompressHuffman
};
