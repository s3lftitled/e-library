const multer = require("multer")
const path = require("path")

const uploadMultiple = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100000000 }, 
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb)
  }
}).array("files", 12)

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100000000 }, 
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
}).single("file") 

// Check file Type
function checkFileType(file, cb) {
  // Allowed file types
  const fileTypes = /jpeg|jpg|png|gif|pdf/
  // Check extension
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase())
  // Check mime type
  const mimeType = fileTypes.test(file.mimetype)

  if (mimeType && extName) {
    return cb(null, true)
  } else {
    cb("Error: Images and PDFs only!")
  }
}

module.exports = { uploadMultiple, upload }