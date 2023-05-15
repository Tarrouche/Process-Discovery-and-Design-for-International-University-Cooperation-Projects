const multer = require('multer');
const fs = require('fs');
const path = require('path');

const imageHeader = '89504e47'; // PNG header
const jpegHeader = 'ffd8ffe0'; // JPEG header
const jpgHeader = 'ffd8ffe1'; // JPEG header
const pdfHeader = '25504446'; //PDF header
const rtfHeader = '7B5C727466'; //RTF header

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = './uploads';

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const fileName = `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, fileName);
    }
});

const upload = multer({
    storage
});

async function checkHeader(file, allowedHeaders) {
    const extension = path.extname(file.originalname);

    if (extension === '.pdf' && allowedHeaders.pdfHeader !== undefined) { // Check the extension
        const bytesToRead = allowedHeaders.pdfHeader.length / 2;
        const fd = fs.openSync(file.path, 'r');
        const buffer = Buffer.alloc(bytesToRead);
        fs.readSync(fd, buffer, 0, bytesToRead, 0);
        fs.closeSync(fd);

        // Check if the file header matches
        const fileHeader = buffer.toString('hex');
        if (allowedHeaders.pdfHeader === fileHeader)
            return true;
    } else if (extension === '.rtf' && allowedHeaders.rtfHeader !== undefined) {
        const bytesToRead = allowedHeaders.rtfHeader.length / 2;
        const fd = fs.openSync(file.path, 'r');
        const buffer = Buffer.alloc(bytesToRead);
        fs.readSync(fd, buffer, 0, bytesToRead, 0);
        fs.closeSync(fd);

        // Check if the file header matches
        const fileHeader = buffer.toString('hex');
        if (allowedHeaders.rtfHeader === fileHeader)
            return true;
    }
    await fs.promises.unlink(file.path);
    return false;

}

async function filterFilesByHeader(files, allowedHeaders) {
    const validFiles = [];

    for (const file of files) {
        if (await checkHeader(file, allowedHeaders)) {
            validFiles.push(file);
        }
    }

    return validFiles;
};

module.exports = { upload, pdfHeader, rtfHeader, filterFilesByHeader, checkHeader };
