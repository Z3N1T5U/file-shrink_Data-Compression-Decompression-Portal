function compressRLE(buffer) {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error('Input should be buffer');
  }

  const str = buffer.toString();  // convert to string human readable
  if (str.length === 0) return '';

  let result = '';
  let count = 1;

  for (let i = 1; i <= str.length; i++) {
    if (str[i] === str[i - 1]) {
      count++;
    } else {
      result += str[i - 1] + count;
      count = 1;
    }
  }

  return result;  // returns string like "a7b4c3d1" phle jo dikkat aa rhi thi
}


function decompressRLE(rleString) {
  if (typeof rleString !== 'string') {
    throw new Error('Input must be a string');
  }

  let result = '';
  for (let i = 0; i < rleString.length; i++) {
    const char = rleString[i];
    let numStr = '';

    // Read digits following the character
    while (i + 1 < rleString.length && /\d/.test(rleString[i + 1])) {
      numStr += rleString[++i];
    }

    const count = parseInt(numStr);
    result += char.repeat(count);
  }

  return result; // returns the original decompressed string
}

module.exports={compressRLE,decompressRLE};