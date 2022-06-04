const multer = require("multer")
const path = require("path")

const imageStorage = multer.diskStorage({
  destination: (req, file, call) => {
    let folder = ""
    
    if (req.baseUrl.includes("users")) {
      folder = "users"
    } else if (req.baseUrl.includes("pets")) {
      folder = "pets"
    }

    call(null, `public/images/${folder}`)
  },
  filename: (req, file, call) => {
    call(null, Date.now() + path.extname(file.originalname))
  }
})

const imageUpload = multer({
  storage: imageStorage,
  fileFilter(req, file, call) {
    if (!file.originalname.match(/\.(png|jpg)$/)) {
      return call(new Error("Por favor, envie apenas jpg ou png"))
    }

    call(undefined, true)
  }
})

module.exports = imageUpload