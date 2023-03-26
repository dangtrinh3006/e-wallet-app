"use strict";
const {User, QLUser} = require("../models/users.model");

class UserController {
    confirm(req, res) {
        res.locals.user = req.session.user;
        res.locals.activeUser = 'active';

        QLUser.confirm(req.params.id, (err, data) => {
            if (err) {
                res.redirect("/500");
            } else {
                res.redirect("/users");
            }
        });
    }

    lock(req, res) {
        res.locals.user = req.session.user;
        res.locals.activeUser = 'active';

        QLUser.lock(req.params.id, (err, data) => {
            if (err) {
                res.redirect("/500");
            } else {
                res.redirect("/users");
            }
        });
    }

    unlock(req, res) {
        res.locals.user = req.session.user;
        // res.locals.activeUser = 'active';

        QLUser.unlock(req.params.id, (err, data) => {
            if (err) {
                res.redirect("/500");
            } else {
                res.redirect("/users/locks");
            }
        });
    }

    getInfoByPhoneNumber(req, res) {
        res.locals.user = req.session.user;
        // res.locals.activeUser = 'active';

        QLUser.getByPhoneNumber(req.params.phone_number, (err, data) => {
            if (err) {
                res.redirect("/500");
            } else {
                res.send(data);
            }
        });
    }

    sendConfirm(req, res) {
        res.locals.user = req.session.user;
        let alert = [];
        // res.locals.activeUser = 'active';
        let fileNameAbove = '';
        let fileNameBehind = '';
        if (req.files.image1 && req.files.image1.length > 0) {
            fileNameAbove = req.files.image1[0].filename;
            console.log(req.files.image1[0]);
        } else {
            alert.push({msg: 'Bạn chưa upload ảnh CCCD (Mặt trước )'});
        }
        if (req.files.image2 && req.files.image2.length > 0) {
            fileNameBehind = req.files.image2[0].filename;
            // fileNameBehind = fileUpload.save(req.files.image2[0].buffer);
            console.log(req.files.image2[0]);
        } else {
            alert.push({msg: 'Bạn chưa upload ảnh CCCD (Mặt sau )'});
        }
        if (fileNameAbove && fileNameBehind) {
            QLUser.sendConfirm(req.params.id, fileNameAbove, fileNameBehind, (err, data) => {
                if (err) {
                    res.redirect("/500");
                } else {
                    res.redirect("/profile?success=true");
                }
            });
        } else {
            res.render("user/profile", {
                parentSettingBar: 'active open',
                activeProfile: 'active',
                alert
            });
        }

    }

    reject(req, res) {
        res.locals.user = req.session.user;
        res.locals.activeUser = 'active';

        QLUser.reject(req.params.id, (err, data) => {
            if (err) {
                res.redirect("/500");
            } else {
                res.redirect("/users");
            }
        });
    }

    getUsersLock(req, res) {
        res.locals.user = req.session.user;

        const tenUser = req.query.tenUser;
        QLUser.getAllUserLock(tenUser, (err, data) => {
            if (err) {
                res.redirect("/500");
            } else {
                res.render("user/lock", {
                    activeUserLock: 'active',
                    users: data
                });
            }
        });
        // res.locals.activeUser = 'active';

    }

    getUsersConfirm(req, res) {
        res.locals.user = req.session.user;

        const tenUser = req.query.tenUser;
        QLUser.getAllUserConfirm(tenUser, (err, data) => {
            if (err) {
                res.redirect("/500");
            } else {
                res.render("user/index", {
                    activeUser2: 'active',
                    users: data
                });
            }
        });
        // res.locals.activeUser = 'active';

    }

    getUsersDeactive(req, res) {
        res.locals.user = req.session.user;

        const tenUser = req.query.tenUser;
        QLUser.getAllUserDeactive(tenUser, (err, data) => {
            if (err) {
                res.redirect("/500");
            } else {
                res.render("user/index", {
                    activeUserDeactive: 'active',
                    users: data
                });
            }
        });
        // res.locals.activeUser = 'active';

    }
}

module.exports = new UserController();
