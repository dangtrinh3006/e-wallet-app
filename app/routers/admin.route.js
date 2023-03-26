const router = require("express").Router();
const UserController = require("../controllers/user.controller");
const AdminController = require("../controllers/admin.controller");
const authGuard = require("./guards/auth.guard");
const upload = require("./middleware/uploadMiddleware");
module.exports = (app) => {
    router.get("/transaction-waiting", authGuard.isAdminAuth, AdminController.getWatingConfirm);
    router.get("/transaction-waiting/:id", authGuard.isAdminAuth, AdminController.getWatingConfirmDetail);
    router.get("/transaction-waiting/confirm/:id", authGuard.isAdminAuth, AdminController.confirm);
    router.get("/transaction-waiting/cancel/:id", authGuard.isAdminAuth, AdminController.cancel);

    app.use("/admins", router);
};
