# FileShrink

**FileShrink** is a full-stack web portal for compressing and decompressing files using two classic algorithms — **Huffman Coding** and **Run-Length Encoding (RLE)**. It supports `.txt`, `.pdf`, and image files, providing a fast and intuitive experience with real-time stats and downloads.

---

## Tech Stack

- **Frontend:** React, Bootstrap, Chart.js
- **Backend:** Node.js, Express.js, Multer
- **Deployment:** Vercel (Frontend) & Render (Backend)

---

## Features

- Upload and process:
  - `.txt` files
  - `.pdf` files
  - Image files (e.g. `.png`, `.jpg`)
- Choose between:
  - **Huffman Compression / Decompression**
  - **RLE Compression / Decompression**
- File download after processing
- Live statistics:
  - Original vs. New size
  - Time taken
  - Compression ratio
- Chart.js bar graph visualization
- Smooth and responsive UI

---

## My Workflow

1. **Backend**:
   - Implemented Huffman and RLE from scratch
   - Managed file uploads with `multer`
   - Designed REST APIs to handle both compression and decompression
   - Returned custom headers with processing stats

2. **Frontend**:
   - Built a functional and elegant UI with React and Bootstrap
   - Integrated Axios for API communication
   - Handled blob-based file downloads
   - Used Chart.js to visualize before/after file sizes

3. **Cross-Format Handling**:
   - Extended file type support beyond `.txt` to include `.pdf` and image formats
   - Ensured safe binary handling across algorithms

4. **Deployment**:
   - Hosted frontend on **Vercel**
   - Deployed backend with **Railway**
   - Resolved CORS issues and ensured smooth integration

---

## Challenges I Faced

- **Binary Data Handling**: Managing encoding/decoding of non-text formats like images and PDFs required careful buffer usage.
- **Chart.js React Integration**: Faced version mismatches and React 19 compatibility issues, which were fixed through dependency debugging.
- **Streamlined UX**: Ensuring the UI remained responsive and informative during file processing took iterations and feedback-based polishing.
- **Error Handling**: Refined backend try-catch logic to capture edge cases and file format issues without crashing the app.

---

## 🌐 Live Demo

-use can visit the site:https://file-shrink-data-compression-decomp-seven.vercel.app/

---

## Future Improvements

- Drag-and-drop support
- Compression level adjustment (for lossy image compression)
- User login and file history
- Mobile-first UI tweaks

