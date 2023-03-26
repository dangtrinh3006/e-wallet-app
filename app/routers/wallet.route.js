const router = require("express").Router();
const WalletController = require("../controllers/wallet.controller");
const authGuard = require("./guards/auth.guard");
const upload = require("./middleware/uploadMiddleware");
const {check} = require('express-validator')
const db = require("../models/db");
module.exports = (app) => {
    router.get("/",authGuard.isFirstLogin, authGuard.isOnlyAuth, WalletController.index);
    router.get("/deposit", authGuard.isAuth, WalletController.getDeposit);
    router.post("/deposit", authGuard.isAuth,
        check("card_number").notEmpty().withMessage("Số thẻ bắt buộc nhập").isLength({
            min: 6,
            max: 6
        }).withMessage('Số thẻ phải là 6 chứ số'),
        check("balance").notEmpty().withMessage("Số tiền bắt buộc nhập"),
        check("expired_date").notEmpty().withMessage("Ngày hết hạn bắt buộc nhập"),
        check("cvv_number").notEmpty().withMessage("Mã CVV bắt buộc nhập"),
        WalletController.postDeposit);
    router.get("/withdraw", authGuard.isAuth, WalletController.getWithdraw);
    router.post("/withdraw", authGuard.isAuth,
        check("card_number").notEmpty().withMessage("Số thẻ bắt buộc nhập").isLength({
            min: 6,
            max: 6
        }).withMessage('Số thẻ phải là 6 chứ số'),
        check("balance").notEmpty().withMessage("Số tiền bắt buộc nhập").custom((value, {req}) => {
            return new Promise((resolve, reject) => {
                console.log(req.body)
                if (req.body.balance % 50000 !== 0) {
                    reject(new Error('Số tiền phải là bội số của 50,000 đồng'));
                }

                resolve(true)
            });
        }),
        check("expired_date").notEmpty().withMessage("Ngày hết hạn bắt buộc nhập"),
        check("cvv_number").notEmpty().withMessage("Mã CVV bắt buộc nhập"),
        WalletController.postWithdraw);
    router.get("/transfer", authGuard.isAuth, WalletController.getTransfer);
    router.post("/transfer", authGuard.isAuth,
        check("phone_number").notEmpty().withMessage("Số điện thoại bắt buộc nhập").custom((value, {req}) => {
            return new Promise((resolve, reject) => {
                console.log(req.body)
                db.query(`SELECT * FROM users WHERE phone_number = ?`, req.body.phone_number, (err, res) => {
                    if (err) {
                        reject(new Error('Server Error'));
                    }
                    console.log(res);
                    if (req.body.phone_number == req.session.user.phone_number){
                        reject(new Error('Số điện thoại là của tài khoản này!'))
                    }
                    if (res.length == 0) {
                        reject(new Error('Số điện thoại không đúng'))
                    }

                    resolve(true)

                });
            });
        }),
        check("balance").notEmpty().withMessage("Số tiền bắt buộc nhập"),
        WalletController.postTransfer);
    router.post("/transfer-otp", authGuard.isAuth,
        check("otp_transfer").notEmpty().withMessage("Mã OTP Không được để trống"),
        WalletController.postTransferOTP);
    router.get("/buy-card", authGuard.isAuth, WalletController.getBuyCard);
    router.post("/buy-card", authGuard.isAuth,
        WalletController.postBuyCard);
    router.get("/history", authGuard.isAuth, WalletController.getHistory);
    router.get("/history/detail/:id", authGuard.isAuth, WalletController.getHistoryDetail);
    app.use("", router);
};
