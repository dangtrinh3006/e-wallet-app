const router = require("express").Router();
const UserController = require("../controllers/user.controller");
const authGuard = require("./guards/auth.guard");
const upload = require("./middleware/uploadMiddleware");
module.exports = (app) => {
    router.get("/lock/:id", authGuard.isAdminAuth, UserController.lock);
    router.get("/confirm/:id", authGuard.isAdminAuth, UserController.confirm);
    router.get("/reject/:id", authGuard.isAdminAuth, UserController.reject);
    router.get("/locks", authGuard.isAdminAuth, UserController.getUsersLock);
    router.get("/unlock/:id", authGuard.isAdminAuth, UserController.unlock);
    router.get("/getInfo/:phone_number", UserController.getInfoByPhoneNumber);
    router.post("/sendConfirm/:id", authGuard.isConfirm,
        upload.fields([{
            name: 'image1', maxCount: 1
        }, {
            name: 'image2', maxCount: 1
        }])
        , UserController.sendConfirm);
    router.get("/confirm", authGuard.isAdminAuth, UserController.getUsersConfirm);
    router.get("/deactive", authGuard.isAdminAuth, UserController.getUsersDeactive);
    app.use("/users", router);
};
