"use strict";
const {User, QLUser} = require("../models/users.model");
const {check, validationResult} = require('express-validator')
const path = require('path');
const moment = require('moment')
const {QLHistory} = require("../models/history.model");

//
const bcrypt = require('bcrypt');
const saltRounds = 5;


class AuthController {
    getForgotPassword(req, res) {
        res.render("forgot-password");
    }

    postSendOTP(req, res) {
        QLUser.getByEmail(req.body.email, (err, result) => {

            if (err) {
                let alert = [];
                alert.push({msg: 'Email không tồn tại'});
                return res.render('forgot-password', {
                    alert
                })
            } else {
                const otp = Math.floor(100000 + Math.random() * 900000);
                let currentUser = result;
                QLUser.sendOTP(result.id, otp, (err, result) => {
                    var content = '';
                    content += `
                        <div style="padding: 10px; background-color: #003375">
                        <h2 style="margin: 5px;"> Ví điện tử 2022</h2>
                            <div style="padding: 10px; background-color: white;">
                                <h3>Lấy lại mật khẩu</h3>
                                <p >Mã OTP của bạn là : <strong>${otp}</strong></p>
                            </div>
                        </div> `;
                    QLUser.sendMail(currentUser.email, 'Mã OTP Khôi phục mật khẩu', content);

                    let msg = [];
                    msg.push({msg: 'Gửi mã Thành công!'});
                    console.log(msg);
                    res.render('recover-password', {
                        id: result.id,
                        msg,
                        parentSettingBar: 'active open',
                    })
                    return;
                });

            }
        });

    }

    postRecoverPassword(req, res) {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            // return res.status(422).jsonp(errors.array())
            const alert = errors.array()
            return res.render('recover-password', {
                alert,
                id: req.body.id
            })
        } else {
            QLUser.getById(req.body.id, (err, result) => {
                if (err) {
                    res.redirect("/404");
                } else {
                    var duration = moment.duration(moment().diff(result.otp_time_send));
                    if (duration.asSeconds() <= 60) {
                        QLUser.recoverPassword(req.body.id, req.body.password, req.body.otp, (err, result) => {
                            if (err) {
                                let alert = [];
                                alert.push({msg: 'Mã OTP Không đúng'});
                                return res.render('recover-password', {
                                    alert,
                                    id: req.body.id
                                })
                            } else {
                                req.session.destroy();
                                let msg = [];
                                msg.push({msg: 'Thành công! Vui lòng đăng nhập với mật khẩu mới.'});
                                return res.render('login', {
                                    msg,
                                    id: req.body.id
                                })
                            }
                        });
                    } else {
                        let alert = [];
                        alert.push({msg: 'Mã OTP Hết hạn ( quá 1 phút ) '});
                        return res.render('recover-password', {
                            alert,
                            id: req.body.id
                        })
                    }

                }
            });

        }

    }
    getLogin(req, res) {
        res.render("login");
    }
    
    postLogin(req, res) {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            // return res.status(422).jsonp(errors.array())
            const alert = errors.array()
            return res.render('login', {
                alert
            })
        }
        if (req.body.user_name.includes("@")){
            QLUser.getByEmail(req.body.user_name, (err, result) => {
                if (err){
                    let alert = [];
                        alert.push({msg: 'Địa chỉ email không tồn tại. Vui lòng kiểm tra lại!'});
                        return res.render('login', {
                            alert
                        })
                }
                req.body.user_name = result.user_name;
                QLUser.getByUsername(req.body.user_name, (err, result) => {
                    if (err) {
                        let alert = [];
                        alert.push({msg: 'Tên tài khoản không tồn tại. Vui lòng kiểm tra lại!'});
                        return res.render('login', {
                            alert
                        })
                    } else {
                        const abnormal_access = result.abnormal_access;
                        var duration = moment.duration(moment().diff(result.last_time_login));
                        console.log(moment(), 'second', duration.asSeconds())
                        if (result.abnormal_access === 2) {
                            let alert = [];
                            alert.push({msg: 'Tài khoản đã bị khóa do nhập sai mật khẩu nhiều lần, vui lòng liên hệ quản trị viên để được hỗ trợ'});
                            return res.render('login', {
                                alert
                            })
                        } else if (result.abnormal_access === 1 && duration.asSeconds() <= 60) {
                            console.log(result.last_time_login);
                            let alert = [];
                            alert.push({msg: 'Tài khoản hiện đang bị tạm khóa, vui lòng thử lại sau 1 phút'});
                            return res.render('login', {
                                alert
                            })
                        } else {
                            QLUser.login(req.body.user_name, req.body.password, (err, result) => {
                                if (err) {
                                    let alert = [];
                                    alert.push({msg: 'Mật khẩu không chính xác. Vui lòng kiểm tra lại!'});
                                    if (req.body.user_name != 'admin') {
                                        if (abnormal_access === 0) {
                                            QLUser.updateLastTimeLogin(req.body.user_name, (err, result) => {
                                            });
                                        }
                                        QLUser.updateLoginFailed(req.body.user_name, (err, result) => {
                                        });
                                        QLUser.getByUsername(req.body.user_name, (err, result) => {
                                            if (err) {
                                                res.redirect('/500');
                                            } else {
                                                if (result.login_failed === 3) {
                                                    if (result.abnormal_access === 1) {
                                                        QLUser.updateLastTimeLogin(req.body.user_name, (err, result) => {
                                                        });
                                                    }
                                                    QLUser.updateAbnormalAccess(req.body.user_name, (err, result) => {
                                                    });
                                                }
        
                                            }
                                        });
                                    }
        
                                    return res.render('login', {
                                        alert
                                    })
                                } else {
                                    if (result.active == 1) {
                                        req.session.userId = String(result.id);
                                        req.session.user = result;
                                        req.session.user_name = result.user_name;
                                        req.session.full_name = result.full_name;
                                        req.session.status = result.status;
                                        console.log(result);
                                        QLUser.reset(req.body.user_name, (err, result) => {
                                        });
                                        if (result.status == 1 || result.status == 3) {
                                            res.redirect('/profile')
                                        } else if (result.status == 2) {
                                            res.redirect('/')
                                        } else {
                                            res.redirect('/change-password')
                                        }
        
                                    } else {
                                        let alert = [];
                                        alert.push({msg: 'Tài khoản này đã bị vô hiệu hóa, vui lòng liên hệ tổng đài 18001008'});
                                        return res.render('login', {
                                            alert
                                        })
                                    }
        
                                }
                            });
                        }
        
                    }
                });
            });
        } else {
            QLUser.getByUsername(req.body.user_name, (err, result) => {
                if (err) {
                    let alert = [];
                    alert.push({msg: 'Tên tài khoản không tồn tại. Vui lòng kiểm tra lại!'});
                    return res.render('login', {
                        alert
                    })
                } else {
                    const abnormal_access = result.abnormal_access;
                    var duration = moment.duration(moment().diff(result.last_time_login));
                    console.log(moment(), 'second', duration.asSeconds())
                    if (result.abnormal_access === 2) {
                        let alert = [];
                        alert.push({msg: 'Tài khoản đã bị khóa do nhập sai mật khẩu nhiều lần, vui lòng liên hệ quản trị viên để được hỗ trợ'});
                        return res.render('login', {
                            alert
                        })
                    } else if (result.abnormal_access === 1 && duration.asSeconds() <= 60) {
                        console.log(result.last_time_login);
                        let alert = [];
                        alert.push({msg: 'Tài khoản hiện đang bị tạm khóa, vui lòng thử lại sau 1 phút'});
                        return res.render('login', {
                            alert
                        })
                    } else {
                        QLUser.login(req.body.user_name, req.body.password, (err, result) => {
                            if (err) {
                                let alert = [];
                                alert.push({msg: 'Mật khẩu không chính xác. Vui lòng kiểm tra lại!'});
                                if (req.body.user_name != 'admin') {
                                    if (abnormal_access === 0) {
                                        QLUser.updateLastTimeLogin(req.body.user_name, (err, result) => {
                                        });
                                    }
                                    QLUser.updateLoginFailed(req.body.user_name, (err, result) => {
                                    });
                                    QLUser.getByUsername(req.body.user_name, (err, result) => {
                                        if (err) {
                                            res.redirect('/500');
                                        } else {
                                            if (result.login_failed === 3) {
                                                if (result.abnormal_access === 1) {
                                                    QLUser.updateLastTimeLogin(req.body.user_name, (err, result) => {
                                                    });
                                                }
                                                QLUser.updateAbnormalAccess(req.body.user_name, (err, result) => {
                                                });
                                            }
    
                                        }
                                    });
                                }
    
                                return res.render('login', {
                                    alert
                                })
                            } else {
                                if (result.active == 1) {
                                    req.session.userId = String(result.id);
                                    req.session.user = result;
                                    req.session.user_name = result.user_name;
                                    req.session.full_name = result.full_name;
                                    req.session.status = result.status;
                                    console.log(result);
                                    QLUser.reset(req.body.user_name, (err, result) => {
                                    });
                                    if (result.status == 1 || result.status == 3) {
                                        res.redirect('/profile')
                                    } else if (result.status == 2) {
                                        res.redirect('/')
                                    } else {
                                        res.redirect('/change-password')
                                    }
    
                                } else {
                                    let alert = [];
                                    alert.push({msg: 'Tài khoản này đã bị vô hiệu hóa, vui lòng liên hệ tổng đài 18001008'});
                                    return res.render('login', {
                                        alert
                                    })
                                }
    
                            }
                        });
                    }
    
                }
            });
        }
        

    }

    getSignup(req, res) {
        res.render("signup");
    }


    postSignup(req, res) {
        console.log(req.body);
        const password = Math.random().toString(36).substring(2, 8);
        const hash = bcrypt.hashSync(password, saltRounds);

        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            // return res.status(422).jsonp(errors.array())
            const alert = errors.array()
            res.render('signup', {
                alert
            })
        } else {
            // const imagePath = path.join(__dirname, '/public/images');
            let fileNameAbove = '';
            let fileNameBehind = '';
            if (req.files.image1 && req.files.image1.length > 0) {
                fileNameAbove = req.files.image1[0].filename;
                console.log(req.files.image1[0]);
            }
            if (req.files.image2 && req.files.image2.length > 0) {
                fileNameBehind = req.files.image2[0].filename;
                // fileNameBehind = fileUpload.save(req.files.image2[0].buffer);
                console.log(req.files.image2[0]);
            }
            let user = {
                ...req.body,
                above_image: fileNameAbove,
                behind_image: fileNameBehind,
                user_name: Math.floor(1000000000 + Math.random() * 9000000000),
                password: hash,
                status: 0,
                role: 'USER',
                active: 1
            };
            QLUser.insert(new User(user), (err, result) => {
                if (err) {
                    console.log('Lỗi');
                } else {
                    console.log(result);
                    var content = '';
                    content += `
                        <div style="padding: 10px; background-color: #003375">
                        <h2 style="margin: 5px;"> Ví điện tử 2022</h2>
                            <div style="padding: 10px; background-color: white;">
                                <h3>Chức mừng bạn đã đăng ký tài khoản ví điện tử thành công</h3>
                                <h4 style="color: black">Username: <strong>${user.user_name}</strong></h4>
                                <span style="color: black">Password: <strong>${password}</strong></span>
                            </div>
                        </div> `;
                    QLUser.sendMail(user.email, 'Đăng ký tài khoản thành công', content);
                    // res.redirect('/login')
                    let msg = [];
                msg.push({msg: 'Thành công!'});
                console.log(msg);
                res.render('login', {
                    msg,
                    parentSettingBar: 'active open',
                })
                return;
                }
            });

        }
        // res.render("signup");
    }

    getChangePassword(req, res) {
        res.locals.user = req.session.user;
        res.render("change-password", {
            parentSettingBar: 'active open',
            activeChangePassword: 'active'
        });
    }

    getLogout(req, res) {
        req.session.destroy();
        res.redirect('/login');
    }

    getProfile(req, res) {
        res.locals.user = req.session.user;
        res.locals.success = req.query.success;
        QLUser.getById(res.locals.user.id, (err, result) => {
            if (err) {
                if (err.kind === "not_found") {
                    res.redirect("/404");
                } else {
                    res.redirect("/500");
                }
            } else {
                res.render("user/profile", {
                    parentSettingBar: 'active open',
                    activeProfile: 'active',
                    user: result
                });
                // res.render("user/detail", {
                //     userDetail: result,
                //     activeUser: 'active',
                // });
            }
        });

    }

    postChangePassword(req, res) {
        res.locals.user = req.session.user;
        const errors = validationResult(req)
        const id = req.session.userId;
        let status = req.session.status == 0 ? 1 : req.session.status;
        if (!errors.isEmpty()) {
            // return res.status(422).jsonp(errors.array())
            const alert = errors.array()
            res.render('change-password', {
                alert,
                parentSettingBar: 'active open',
                activeChangePassword: 'active'
            })
            return;
        }
        if (req.session.status != 0) {
            if(!bcrypt.compareSync(req.body.oldPassword, req.session.user.password)) {
                let alert = [];
                alert.push({msg: 'Mật khẩu cũ không đúng'});
                res.render('change-password', {
                    alert,
                    parentSettingBar: 'active open',
                    activeChangePassword: 'active'
                })
                return;
            }
        }

        QLUser.changePassword(id, req.body.password, status, (err, result) => {
            if (err) {
                let alert = [];
                alert.push({msg: 'Lỗi hệ thống'});
                console.log(alert);
                res.render('change-password', {
                    alert,
                    parentSettingBar: 'active open',
                    activeChangePassword: 'active'
                })
                return;
            } else {
                // req.session.userId = String(result.id);
                // req.session.user_name = result.user_name;
                // req.session.status = result.status;
                // console.log(result);
                res.locals.user = req.session.user;
                res.locals.user.status = status

                req.session.user.password = bcrypt.hashSync(req.body.password, saltRounds);
                if (req.session.status == 0){
                    req.session.status = status;
                    let msg = [];
                    msg.push({msg: 'Thành công!'});
                    console.log(msg);
                    res.render('user/profile', {
                        msg,
                        parentSettingBar: 'active open',
                        activeChangePassword: 'active',
                })
                return;
                }
                req.session.status = status;
                
                let msg = [];
                msg.push({msg: 'Thành công!'});
                console.log(msg);
                res.render('change-password', {
                    msg,
                    parentSettingBar: 'active open',
                    activeChangePassword: 'active',
                })
                return;
            }
        });
    }

    getUsers(req, res) {
        res.locals.user = req.session.user;

        const tenUser = req.query.tenUser;
        QLUser.getAllNotConfirm(tenUser, (err, data) => {
            if (err) {
                res.redirect("/500");
            } else {
                res.render("user/index", {
                    activeUser: 'active',
                    users: data
                });
            }
        });
        // res.locals.activeUser = 'active';

    }

    getUserDetail(req, res) {
        res.locals.user = req.session.user;

        QLUser.getById(req.params.id, (err, result) => {
            if (err) {
                if (err.kind === "not_found") {
                    res.redirect("/404");
                } else {
                    res.redirect("/500");
                }
            } else {
                const userDetail = result;
                QLHistory.getAllCurrentMonth(req.params.id, (err, result) => {
                    // let histories = null;
                    // histories = result;
                    res.render("user/detail", {
                        userDetail: userDetail,
                        // user: userDetail,
                        histories: result
                        // activeUser: 'active',
                    });

                    // res.render("wallet/history-transaction", {
                    //     activeHistory: 'active',
                    //     user: userDetail,
                    //
                    // });
                });

            }
        });

        // res.locals.activeUser = 'active';

    }
}

module.exports = new AuthController();
