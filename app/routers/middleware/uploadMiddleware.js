// uploadMiddleware.js

const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        //files khi upload xong sẽ nằm trong thư mục "uploads" này
        cb(null, 'app/public/assets/images')
    },
    filename: function (req, file, cb) {
        // tạo tên file = thời gian hiện tại nối với số ngẫu nhiên => tên file chắc chắn không bị trùng
        const filename = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, filename + '-' + file.originalname)
    }
})

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 4 * 1024 * 1024,
    }
});

module.exports = upload
