const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const uploadsDir = path.join(__dirname, '../../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Upload file to local storage
exports.uploadFile = async (file) => {
  try {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = path.join(uploadsDir, fileName);

    // Write file to uploads directory
    await fs.promises.writeFile(filePath, file.buffer);

    // Return the relative path that can be used to access the file
    return `/uploads/${fileName}`;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
};

// Delete file from local storage
exports.deleteFile = async (filePath) => {
  try {
    const fullPath = path.join(__dirname, '../..', filePath);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
}; 