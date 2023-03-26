const router = require("express").Router();
const AuthController = require("../controllers/auth.controller");
const authGuard = require("./guards/auth.guard");
const upload = require("./middleware/uploadMiddleware");
const {check} = require('express-validator')
const db = require("../models/db");

module.exports = (app) => {
    router.get("/forgot-password", authGuard.notAuth, AuthController.getForgotPassword);
    router.post("/sendOTP", authGuard.notAuth, AuthController.postSendOTP);
    router.post("/recover-password", authGuard.notAuth,
        check("otp").notEmpty().withMessage("Mã OTP bắt buộc nhập"),
        check("password").notEmpty().withMessage("Mật khẩu bắt buộc nhập"),
        check("password").isLength({min:6}).withMessage("Vui lòng nhập mật khẩu từ 6 ký tự!"),
        check("confirmPassword").notEmpty().withMessage("Xác nhận Mật khẩu bắt buộc nhập").custom((value, {req}) => {
            if (value === req.body.password) return true;
            else throw "Xác nhận mật khẩu không đúng";
        }), AuthController.postRecoverPassword);
    router.get("/login", authGuard.notAuth, AuthController.getLogin);
    router.post('/login',
        check("user_name").notEmpty().withMessage("Tên tài khoản bắt buộc nhập"),
        check("password").notEmpty().withMessage("Mật khẩu bắt buộc nhập"),
        check("password").isLength({min:6}).withMessage("Vui lòng nhập mật khẩu từ 6 ký tự!"),
        AuthController.postLogin);
    router.get("/signup", AuthController.getSignup);
    router.post("/signup",
        upload.fields([{
            name: 'image1', maxCount: 1
        }, {
            name: 'image2', maxCount: 1
        }]),
        // upload.single('image1'),
        check("phone_number").notEmpty().withMessage("Số điện thoại bắt buộc nhập").custom((value, {req}) => {
            return new Promise((resolve, reject) => {
                console.log(req.body)
                db.query(`SELECT * FROM users WHERE phone_number = ?`, req.body.phone_number, (err, res) => {
                    if (err) {
                        reject(new Error('Server Error'));
                    }
                    console.log(res);
                    if (res.length > 0) {
                        reject(new Error('Số điện thoại đã tồn tại'))
                    }

                    resolve(true)

                });
            });
        }),
        check("email").notEmpty().withMessage("Email bắt buộc nhập").custom((value, {req}) => {
            return new Promise((resolve, reject) => {
                db.query(`SELECT * FROM users WHERE email = ?`, req.body.email, (err, res) => {
                    if (err) {
                        reject(new Error('Server Error'));
                    }

                    if (res.length > 0) {
                        reject(new Error('E-mail đã tồn tại'))
                    }

                    resolve(true)

                });

            });

        }),check('email').isEmail().withMessage("Định dạng email không hợp lệ"),
        check("full_name").notEmpty().withMessage("Họ và tên bắt buộc nhập"),
        check("date_of_birth").notEmpty().withMessage("Ngày sinh bắt buộc nhập"),
        check("address").notEmpty().withMessage("Địa chỉ bắt buộc nhập"),
        AuthController.postSignup);
    router.get("/change-password", authGuard.isOnlyAuth, AuthController.getChangePassword);
    router.post("/change-password", authGuard.isOnlyAuth,
        check("password").notEmpty().withMessage("Mật khẩu bắt buộc nhập"),
        check("password").isLength({min:6}).withMessage("Vui lòng nhập mật khẩu từ 6 ký tự!"),
        check("confirmPassword").notEmpty().withMessage("Xác nhận Mật khẩu bắt buộc nhập").custom((value, {req}) => {
            if (value === req.body.password) return true;
            else throw "Xác nhận mật khẩu không đúng";
        }),
        AuthController.postChangePassword);
    router.get("/logout", authGuard.isOnlyAuth, AuthController.getLogout);
    router.get("/profile",authGuard.isFirstLogin, authGuard.isOnlyAuth, AuthController.getProfile);
    router.get("/users", authGuard.isAdminAuth, AuthController.getUsers);
    router.get("/users/detail/:id", authGuard.isAdminAuth, AuthController.getUserDetail);
    // app.get("/", authGuard.isAuth, (req, res) => {
    //
    // });
    app.use("", router);
};
