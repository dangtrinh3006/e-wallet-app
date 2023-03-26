"use strict";
const sql = require("./db");
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const saltRounds = 5;

class User {
    constructor(user) {
        this.phone_number = user?.phone_number;
        this.email = user?.email;
        this.full_name = user?.full_name;
        this.date_of_birth = user?.date_of_birth;
        this.address = user?.address;
        this.above_image = user?.above_image;
        this.behind_image = user?.behind_image;
        this.user_name = user?.user_name;
        this.password = user?.password;
        this.status = user?.status;
        this.role = user?.role;
        this.active = user?.active;
    }
}

class QLUser {

    static insert(user, callback) {
        sql.query("INSERT INTO users SET ?", user, (err, res) => {
            if (err) {
                console.log("err", err);
                callback(err, null);
                return;
            }
            console.log("inserted:", {id: res.insertId});
            callback(null, {
                id: res.insertId,
                ...user,
            });
        });
    }

    static getById(id, callback) {
        sql.query(`SELECT * FROM users WHERE id = ${id}`, (err, res) => {
            if (err) {
                console.log("err", err);
                callback(err, null);
                return;
            }
            if (res.length) {
                console.log("found: ", res[0]);
                callback(null, res[0]);
                return;
            }
            // not found with the id
            callback({kind: "not_found"}, null);
        });
    }

    static getById2(id) {
        sql.query(`SELECT * FROM users WHERE id = ${id}`, (err, res) => {
            if (err) {
                console.log("err", err);
                return {};
            }
            if (res.length) {
                console.log("found UserId: ", res[0]);
                // callback(null, res[0]);
                return res[0];
            }
            // not found with the id
            // callback({kind: "not_found"}, null);
        });
    }

    static getByPhoneNumber(phone_number, callback) {
        sql.query(`SELECT * FROM users WHERE phone_number = ${phone_number}`, (err, res) => {
            if (err) {
                console.log("err", err);
                callback(err, null);
                return;
            }
            if (res.length) {
                console.log("getByPhoneNumber() found: ", res[0]);
                callback(null, res[0]);
                return;
            }
            // not found with the id
            callback({kind: "not_found"}, null);
        });
    }

    static getByUsername(username, callback) {
        
        sql.query(`SELECT * FROM users WHERE user_name = '${username}' `, (err, res) => {
            if (err) {
                console.log("err", err);
                callback(err, null);
                return;
            }
            if (res.length) {
                console.log("found: ", res[0]);
                callback(null, res[0]);
                return;
            }
            // not found with the id
            callback({kind: "not_found"}, null);
        });
    }

    static getByEmail(email, callback) {
        sql.query(`SELECT * FROM users WHERE email = '${email}' `, (err, res) => {
            if (err) {
                console.log("err", err);
                callback(err, null);
                return;
            }
            if (res.length) {
                console.log("found: ", res[0]);
                callback(null, res[0]);
                return;
            }
            // not found with the id
            callback({kind: "not_found"}, null);
        });
    }

    static sendOTP(id, otp, callback) {
        sql.query(`UPDATE users SET otp = '${otp}', otp_time_send=CURRENT_TIMESTAMP WHERE id = '${id}' `,
            (err, res) => {
                if (err) {
                    console.log("error: ", err);
                    callback(null, err);
                    return;
                }
                if (res.affectedRows == 0) {
                    // not found  with the id
                    callback({kind: "not_found"}, null);
                    return;
                }
                console.log("Send OTP Success : ", {id: id, otp});
                callback(null, {id: id});
            }
        );
    }

    static sendOTPTransfer(id, otp, callback) {
        sql.query(`UPDATE users SET otp_transfer = '${otp}', otp_transfer_time=CURRENT_TIMESTAMP WHERE id = '${id}' `,
            (err, res) => {
                if (err) {
                    console.log("error: ", err);
                    callback(null, err);
                    return;
                }
                if (res.affectedRows == 0) {
                    // not found  with the id
                    callback({kind: "not_found"}, null);
                    return;
                }
                console.log("Send OTP Transfer Success : ", {id: id});
                callback(null, {id: id});
            }
        );
    }

    static recoverPassword(id, password, otp, callback) {
        const salt = bcrypt.genSaltSync(saltRounds);
        const hash = bcrypt.hashSync(password, salt);
        sql.query(`UPDATE users SET password = '${hash}' WHERE id = '${id}' AND otp ='${otp}' `,
            (err, res) => {
                if (err) {
                    console.log("error: ", err);
                    callback(null, err);
                    return;
                }
                if (res.affectedRows == 0) {
                    // not found  with the id
                    callback({kind: "not_found"}, null);
                    return;
                }
                console.log("Send OTP Success : ", {id: id});
                callback(null, {id: id});
            }
        );
    }

    static login(username, passwordInput, callback) {
        sql.query(`SELECT * FROM users WHERE user_name = '${username}'`, (err, res) => {
            if (bcrypt.compareSync(passwordInput, res[0].password)){
                if (err) {
                    console.log("err", err);
                    callback(err, null);
                    return;
                }
                if (res.length) {
                    console.log("found: ", res[0]);
                    callback(null, res[0]);
                    return;
                }  
            }
            // not found with the id
            callback({kind: "not_found"}, null);
        });
    }

    static updateLoginFailed(user_name, callback) {
        sql.query(
            `UPDATE users SET login_failed = login_failed + 1 WHERE user_name = '${user_name}' `,
            (err, res) => {
                if (err) {
                    console.log("error: ", err);
                    callback(null, err);
                    return;
                }
                if (res.affectedRows == 0) {
                    // not found  with the id
                    callback({kind: "not_found"}, null);
                    return;
                }
                console.log("updateLoginFailed success : ", {user_name: user_name});
                callback(null, {user_name: user_name});
            }
        );
    }

    static updateLastTimeLogin(user_name, callback) {
        sql.query(
            `UPDATE users SET last_time_login = CURRENT_TIMESTAMP WHERE user_name = '${user_name}' `,
            (err, res) => {
                if (err) {
                    console.log("error: ", err);
                    callback(null, err);
                    return;
                }
                if (res.affectedRows == 0) {
                    // not found  with the id
                    callback({kind: "not_found"}, null);
                    return;
                }
                console.log("updateLastTimeLogin success : ", {user_name: user_name});
                callback(null, {user_name: user_name});
            }
        );
    }

    static reset(user_name, callback) {
        sql.query(
            `UPDATE users SET login_failed = 0, abnormal_access = 0,last_time_login = CURRENT_TIMESTAMP WHERE user_name = '${user_name}' `,
            (err, res) => {
                if (err) {
                    console.log("error: ", err);
                    callback(null, err);
                    return;
                }
                if (res.affectedRows == 0) {
                    // not found  with the id
                    callback({kind: "not_found"}, null);
                    return;
                }
                console.log("reset success : ", {user_name: user_name});
                callback(null, {user_name: user_name});
            }
        );
    }

    static updateAbnormalAccess(user_name, callback) {
        sql.query(
            `UPDATE users SET abnormal_access = abnormal_access + 1, login_failed = 0 WHERE user_name = '${user_name}' `,
            (err, res) => {
                if (err) {
                    console.log("error: ", err);
                    callback(null, err);
                    return;
                }
                if (res.affectedRows == 0) {
                    // not found  with the id
                    callback({kind: "not_found"}, null);
                    return;
                }
                console.log("updateAbnormalAccess Success: ", {user_name: user_name});
                callback(null, {user_name: user_name});
            }
        );
    }

    static changePassword(id, password, status, callback) {
        const salt = bcrypt.genSaltSync(saltRounds);
        const hash = bcrypt.hashSync(password, salt);
        sql.query(
            
            `UPDATE users SET password = '${hash}', status = ${status} WHERE id = ${id}`,
            (err, res) => {
                if (err) {
                    console.log("error: ", err);
                    callback(null, err);
                    return;
                }
                if (res.affectedRows == 0) {
                    // not found  with the id
                    callback({kind: "not_found"}, null);
                    return;
                }
                console.log("changePassword Success : ", {id: id, password});
                callback(null, {id: id, password});
            }
        );
    }

    static lock(id, callback) {
        sql.query(
            `UPDATE users SET active = 0 WHERE id = ${id}`,
            (err, res) => {
                if (err) {
                    console.log("error: ", err);
                    callback(null, err);
                    return;
                }
                if (res.affectedRows == 0) {
                    // not found  with the id
                    callback({kind: "not_found"}, null);
                    return;
                }
                console.log("Lock tài khoản thành công : ", {id: id});
                callback(null, {id: id});
            }
        );
    }

    static unlock(id, callback) {
        sql.query(
            `UPDATE users SET login_failed =0, abnormal_access = 0 WHERE id = ${id}`,
            (err, res) => {
                if (err) {
                    console.log("error: ", err);
                    callback(null, err);
                    return;
                }
                if (res.affectedRows == 0) {
                    // not found  with the id
                    callback({kind: "not_found"}, null);
                    return;
                }
                console.log("UnLock tài khoản thành công : ", {id: id});
                callback(null, {id: id});
            }
        );
    }

    static sendConfirm(id, aboveImage, behindImage, callback) {
        sql.query(
            `UPDATE users SET above_image = '${aboveImage}', behind_image = '${behindImage}', status = 1 WHERE id = ${id}`,
            (err, res) => {
                if (err) {
                    console.log("error: ", err);
                    callback(null, err);
                    return;
                }
                if (res.affectedRows == 0) {
                    // not found  with the id
                    callback({kind: "not_found"}, null);
                    return;
                }
                console.log("sendConfirm() Success : ", {id: id});
                callback(null, {id: id});
            }
        );
    }

    static reject(id, callback) {
        sql.query(
            `UPDATE users SET status = 3 WHERE id = ${id}`,
            (err, res) => {
                if (err) {
                    console.log("error: ", err);
                    callback(null, err);
                    return;
                }
                if (res.affectedRows == 0) {
                    // not found  with the id
                    callback({kind: "not_found"}, null);
                    return;
                }
                console.log("Yêu cầu bổ sung thông tin : ", {id: id});
                callback(null, {id: id});
            }
        );
    }

    static confirm(id, callback) {
        sql.query(
            `UPDATE users SET status = 2 WHERE id = ${id}`,
            (err, res) => {
                if (err) {
                    console.log("error: ", err);
                    callback(null, err);
                    return;
                }
                if (res.affectedRows == 0) {
                    // not found  with the id
                    callback({kind: "not_found"}, null);
                    return;
                }
                console.log("Xác minh tài khoản thành công : ", {id: id});
                callback(null, {id: id});
            }
        );
    }

    static deposits(id, balance, callback) {
        sql.query(
            `UPDATE users SET balance = balance + ${balance} WHERE id = ${id}`,
            (err, res) => {
                if (err) {
                    console.log("error: ", err);
                    callback(null, err);
                    return;
                }
                if (res.affectedRows == 0) {
                    // not found  with the id
                    callback({kind: "not_found"}, null);
                    return;
                }
                console.log("nạp tiền vào tài khoản thành công : ", {id: id});
                callback(null, {id: id});
            }
        );


    }

    static withdraw(id, balance, callback) {
        sql.query(
            `UPDATE users SET balance = balance - ${balance} WHERE id = ${id}`,
            (err, res) => {
                if (err) {
                    console.log("error: ", err);
                    callback(null, err);
                    return;
                }
                if (res.affectedRows == 0) {
                    // not found  with the id
                    callback({kind: "not_found"}, null);
                    return;
                }
                console.log("Rút tiền thành công : ", {id: id});
                callback(null, {id: id});
            }
        );


    }

    static transfer(id, fromBalance, callback) {
        sql.query(
            `UPDATE users SET balance = balance - ${fromBalance} WHERE id = ${id}`,
            (err, res) => {
                if (err) {
                    console.log("error: ", err);
                    callback(null, err);
                    return;
                }
                if (res.affectedRows == 0) {
                    // not found  with the id
                    callback({kind: "not_found"}, null);
                    return;
                }
                console.log("transfer(Send) Success  : ", {id: id});
                callback(null, {id: id});
            }
        );


    }

    static transferReceive(to_user_id, toBalance, callback) {

        sql.query(
            `UPDATE users SET balance = balance + ${toBalance} WHERE id = ${to_user_id}`,
            (err, res) => {
                if (err) {
                    console.log("error: ", err);
                    callback(null, err);
                    return;
                }
                if (res.affectedRows == 0) {
                    // not found  with the id
                    callback({kind: "not_found"}, null);
                    return;
                }
                console.log("transfer(Receive) Success : ", {id: to_user_id, ...res});
                callback(null, {id: to_user_id});
            }
        );

    }

    static getAllNotConfirm(tenUser, callback) {
        let query = "SELECT * FROM users";
        if (tenUser) {
            query += ` WHERE full_name LIKE '%${tenUser}%'`;
        } // nếu có truyền vào tên băng đĩa thì sẽ tìm kiếm theo tên
        query += ` WHERE user_name <> 'admin' AND status <> 2 AND active = 1 ORDER BY id desc `;
        sql.query(query, (err, res) => {
            if (err) {
                console.log("error: ", err);
                callback(null, err);
                return;
            }
            console.log("users: ", res);
            callback(null, res);
        });
    }

    static getAllUserConfirm(tenUser, callback) {
        let query = "SELECT * FROM users";
        if (tenUser) {
            query += ` WHERE full_name LIKE '%${tenUser}%'`;
        } // nếu có truyền vào tên băng đĩa thì sẽ tìm kiếm theo tên
        query += ` WHERE user_name <> 'admin' AND status = 2 AND active = 1 ORDER BY id desc `;
        sql.query(query, (err, res) => {
            if (err) {
                console.log("error: ", err);
                callback(null, err);
                return;
            }
            console.log("users: ", res);
            callback(null, res);
        });
    }

    static getAllUserDeactive(tenUser, callback) {
        let query = "SELECT * FROM users";
        if (tenUser) {
            query += ` WHERE full_name LIKE '%${tenUser}%'`;
        } // nếu có truyền vào tên băng đĩa thì sẽ tìm kiếm theo tên
        query += ` WHERE user_name <> 'admin' AND active = 0 ORDER BY id desc `;
        sql.query(query, (err, res) => {
            if (err) {
                console.log("error: ", err);
                callback(null, err);
                return;
            }
            console.log("users: ", res);
            callback(null, res);
        });
    }

    static getAllUserLock(tenUser, callback) {
        let query = "SELECT * FROM users";
        query += ` WHERE user_name <> 'admin' AND abnormal_access = 2 `;
        sql.query(query, (err, res) => {
            if (err) {
                console.log("error: ", err);
                callback(null, err);
                return;
            }
            console.log("users: ", res);
            callback(null, res);
        });
    }

    static update(id, bangDia, callback) {
        sql.query(
            "UPDATE bangdia SET ? WHERE id = ?",
            [bangDia, id],
            (err, res) => {
                if (err) {
                    console.log("error: ", err);
                    callback(null, err);
                    return;
                }
                if (res.affectedRows == 0) {
                    // not found  with the id
                    callback({kind: "not_found"}, null);
                    return;
                }
                console.log("updated : ", {id: id, ...bangDia});
                callback(null, {id: id, ...bangDia});
            }
        );
    }

    static delete(id, callback) {
        sql.query("DELETE FROM bangdia WHERE id = ?", id, (err, res) => {
            if (err) {
                console.log("error: ", err);
                callback(null, err);
                return;
            }
            if (res.affectedRows == 0) {
                // not found with the id
                callback({kind: "not_found"}, null);
                return;
            }
            console.log("deleted with id: ", id);
            callback(null, res);
        });
    }

    static sendMail(toEmail, subject, body) {
        //Tiến hành gửi mail, nếu có gì đó bạn có thể xử lý trước khi gửi mail
        var transporter = nodemailer.createTransport({
            host: process.env.DB_MAIL_HOST,
            port: process.env.DB_MAIL_PORT,
            secure: false,
            auth: {
                user: process.env.DB_MAIL_USERNAME,
                pass: process.env.DB_MAIL_PASSWORD
            }
        });

        var mainOptions = { // thiết lập đối tượng, nội dung gửi mail
            from: 'noreply@wallet.info',
            to: toEmail,
            subject: subject,
            text: 'Your text is here', //Sử dụng html để dễ edit hơn
            html: body //Nội dung html đã tạo
        }
        transporter.sendMail(mainOptions, function (err, info) {
            if (err) {
                console.log(err);
            } else {
                console.log('Send mail success: ' + info.response);
            }
        });
    }
}

module.exports = {User, QLUser};
