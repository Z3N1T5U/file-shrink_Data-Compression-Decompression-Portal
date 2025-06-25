const cors = require('cors');
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { compressRLE, decompressRLE } = require('./algorithms/rle');
const { compressHuffman, decompressHuffman } = require('./algorithms/huffman');

const app = express();

['uploads', 'outputs'].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created missing folder: ${dir}`);
  }
});

//accepts req from the frontend
app.use(cors());

//wasted a lot of time custom headers expose krna for frontend
app.use((req, res, next) => {
  res.setHeader('Access-Control-Expose-Headers', 'x-original-size, x-new-size, x-time-taken');
  next();
});

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//RLEcomp
app.post('/rle-compress', upload.single('myFile'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded!' });

  const inputPath = `./uploads/${req.file.filename}`;
  const original = fs.readFileSync(inputPath);

  console.log("[RLE Compress] Original content:", original);

  let compressed;
  let timeTaken;
  try {
    const start = Date.now();
    compressed = compressRLE(original);
    const end = Date.now();
    timeTaken = `${end - start}ms`;
  } catch(err) {
    console.error('[RLE Compress] Error:', err.message);
    return res.status(500).json({ error: 'Compression failed' });
  }

  const outputFileName = `rle-compressed-${Date.now()}.txt`;
  const outputPath = `./outputs/${outputFileName}`;
  fs.writeFileSync(outputPath, compressed);

  const originalSize = original.length;
  const compressedSize = compressed.length;
  const compressionRatio = ((compressedSize / originalSize) * 100).toFixed(2);

  console.log(`[RLE Compress] Done. Original: ${originalSize}, Compressed: ${compressedSize}, Ratio: ${compressionRatio}%`);

  res.set({
    'Content-Type': 'application/octet-stream',
    'Content-Disposition': `attachment; filename="${outputFileName}"`,
    'x-original-size': originalSize.toString(),
    'x-new-size': compressedSize.toString(),
    'x-time-taken': timeTaken
  });
  res.send(typeof compressed === 'string' ? Buffer.from(compressed, 'utf-8') : compressed);

});  

// RLEDecomp
app.post('/rle-decompress', upload.single('myFile'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded!' });

  const inputPath = `./uploads/${req.file.filename}`;
  const compressed = fs.readFileSync(inputPath, 'utf8');

  console.log("[RLE Decompress] Input:", compressed);

  let decompressed;
  let timeTaken;
  try {
    const start = Date.now();
    decompressed = decompressRLE(compressed);
    const end = Date.now();
    timeTaken = `${end - start}ms`;
  } catch {
    return res.status(500).json({ error: 'Decompression failed' });
  }

  const outputFileName = `rle-decompressed-${Date.now()}.txt`;
  const outputPath = `./outputs/${outputFileName}`;
  fs.writeFileSync(outputPath, decompressed);

  const compressedSize = compressed.length;
  const decompressedSize = decompressed.length;
  const decompressionRatio = ((decompressedSize / compressedSize) * 100).toFixed(2);

  console.log(`[RLE Decompress] Done. Compressed: ${compressedSize}, Decompressed: ${decompressedSize}, Ratio: ${decompressionRatio}%`);

  res.set({
    'Content-Type': 'application/octet-stream',
    'Content-Disposition': `attachment; filename="${outputFileName}"`,
    'x-original-size': decompressedSize.toString(),
    'x-new-size': compressedSize.toString(),
    'x-time-taken': timeTaken
  });

  res.send(Buffer.from(decompressed));
});


// ✅ HuffmanComp
app.post('/huffman-compress', upload.single('myFile'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded!' });

  const inputPath = `./uploads/${req.file.filename}`;
  const original = fs.readFileSync(inputPath);

  console.log("[Huffman Compress] Original size:", original.length);

  let compressed;
  let timeTaken;
  try {
    const start = Date.now();
    compressed = compressHuffman(original);
    const end = Date.now();
    timeTaken = `${end - start}ms`;
  } catch {
    return res.status(500).json({ error: 'Compression failed' });
  }

  const outputFileName = `huffman-compressed-${Date.now()}.huff`;
  const outputPath = `./outputs/${outputFileName}`;
  fs.writeFileSync(outputPath, compressed);

  const originalSize = original.length;
  const compressedSize = compressed.length;
  const compressionRatio = ((compressedSize / originalSize) * 100).toFixed(2);

  console.log("Sending response...");
  console.log(`[Huffman Compress] Done. Original: ${originalSize}, Compressed: ${compressedSize}, Ratio: ${compressionRatio}%`);

  res.set({
    'Content-Type': 'application/octet-stream',
    'Content-Disposition': `attachment; filename="${outputFileName}"`,
    'x-original-size': originalSize.toString(),
    'x-new-size': compressedSize.toString(),
    'x-time-taken': timeTaken
  });

  res.send(compressed);
});

// HuffmanDecomp
app.post('/huffman-decompress', upload.single('myFile'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded!' });

  const inputPath = `./uploads/${req.file.filename}`;
  const compressed = fs.readFileSync(inputPath);

  console.log("[Huffman Decompress] Compressed size:", compressed.length);

  let decompressed;
  let timeTaken;
  try {
    const start = Date.now();
    decompressed = decompressHuffman(compressed);
    const end = Date.now();
    timeTaken = `${end - start}ms`;
  } catch {
    return res.status(500).json({ error: 'Decompression failed' });
  }

  const outputFileName = `huffman-decompressed-${Date.now()}.txt`;
  const outputPath = `./outputs/${outputFileName}`;
  fs.writeFileSync(outputPath, decompressed);

  const decompressedSize = decompressed.length;
  const compressedSize = compressed.length;
  const decompressionRatio = ((decompressedSize / compressedSize) * 100).toFixed(2);

  console.log(`[Huffman Decompress] Done. Compressed: ${compressedSize}, Decompressed: ${decompressedSize}, Ratio: ${decompressionRatio}%`);

  res.set({
    'Content-Type': 'application/octet-stream',
    'Content-Disposition': `attachment; filename="${outputFileName}"`,
    'x-original-size': compressed.length.toString(),
    'x-new-size': decompressed.length.toString(),
    'x-time-taken': timeTaken
  });
  res.send(decompressed);
});

// Health Check or Landing Page
app.get('/', (req, res) => {
  res.send('Data Compression & Decompression API is running...yayyy...');
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`hogya start....Server running at http://localhost:${PORT}`);
});
