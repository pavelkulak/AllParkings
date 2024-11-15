const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '../img/parking');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
} 