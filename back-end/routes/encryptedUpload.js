const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');


const imageHeader = '89504e47'; // PNG header
const jpegHeader = 'ffd8ffe0'; // JPEG header
const jpgHeader = 'ffd8ffe1'; // JPEG header
const pdfHeader = '25504446'; //PDF header
const rtfHeader = '7B5C727466'; //RTF header

function generateKey(password, salt, iterations) {
    return crypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256');
}

function encryptFile(filePath, key) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    const input = fs.createReadStream(filePath);
    const output = fs.createWriteStream(filePath + '.enc');
    output.write(iv);

    input.pipe(cipher).pipe(output);

    output.on('finish', () => {
        input.close();
        output.close();
        fs.unlinkSync(filePath);
    });
}

function decryptFile(filePath, key) {
    const input = fs.createReadStream(filePath);
    const output = fs.createWriteStream(filePath.replace('.enc', ''));

    let iv;
    input.once('readable', () => {
        iv = input.read(16);
        const cipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        input.pipe(cipher).pipe(output);
    });

    return new Promise((resolve, reject) => {
        output.on('finish', resolve);
        output.on('error', reject);
    });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = './user_uploads';

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

module.exports = { upload, pdfHeader, rtfHeader, filterFilesByHeader, checkHeader, generateKey, encryptFile, decryptFile };
