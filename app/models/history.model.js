"use strict";
const sql = require("./db");

class History {
    constructor(history) {
        this.user_id = history?.user_id;
        this.from_user = history?.from_user;
        this.to_user = history?.to_user;
        this.type = history?.type;
        this.quantity = history?.quantity;
        this.card_id = history?.card_id;
        this.status = history?.status;
        this.note = history?.note;
        this.fee = history?.fee;
        this.isReceiverPayFee = history?.isReceiverPayFee;
        this.name1 = history?.name1;
        this.price1 = history?.price1;

        this.name2 = history?.name2;
        this.price2 = history?.price2;

        this.name3 = history?.name3;
        this.price3 = history?.price3;

        this.name4 = history?.name4;
        this.price4 = history?.price4;

        this.name5 = history?.name5;
        this.price5 = history?.price5;
        this.code1 = history?.code1;
        this.code2 = history?.code2;
        this.code3 = history?.code3;
        this.code4 = history?.code4;
        this.code5 = history?.code5;
    }
}

class QLHistory {

    static insertHistory(history, callback) {
        sql.query("INSERT INTO history SET ?", history, (err, res) => {
            if (err) {
                console.log("err", err);
                callback(err, null);
                return;
            }
            console.log("inserted History:", {id: res.insertId, ...res});
            callback(null, {
                id: res.insertId,
                ...history,
            });
        });
    }

    static getAll(userId, callback) {
        let query = `SELECT * FROM  history WHERE user_id = ${userId} OR to_user = ${userId} ORDER BY id desc `;

        sql.query(query, (err, res) => {
            if (err) {
                console.log("error: ", err);
                callback(null, err);
                return;
            }
            console.log("totalWithDraw: ", res);
            callback(null, res);
        });
    }

    static confirm(id, callback) {
        sql.query(`UPDATE history SET status = 2 WHERE id = '${id}' `,
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
                console.log("Xác nhận giao dịch thành công : ", {id: id});
                callback(null, {id: id});
            }
        );
    }

    static confirm(id, callback) {
        sql.query(`UPDATE history SET status = 2 WHERE id = '${id}' `,
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
                console.log("Xác nhận giao dịch thành công : ", {id: id});
                callback(null, {id: id});
            }
        );
    }

    static cancel(id,callback) {
        sql.query(`UPDATE history SET status = 1 WHERE id = '${id}' `,
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
                console.log("Xác nhận giao dịch thành công : ", {id: id});
                callback(null, {id: id});
            }
        );
    }

    static getAllTransactionWaitingConfirm(callback) {
        let query = `SELECT * FROM  history WHERE status = 0 ORDER BY id desc `;

        sql.query(query, (err, res) => {
            if (err) {
                console.log("error: ", err);
                callback(null, err);
                return;
            }
            console.log("Transaction Waiting Confirm: ", res);
            callback(null, res);
        });
    }

    static getAllCurrentMonth(userId, callback) {
        let query = `SELECT * FROM  history WHERE (user_id = ${userId} OR to_user = ${userId}) AND (MONTH(created_date) = MONTH(CURDATE()) AND YEAR(created_date) = YEAR(CURDATE()) ) ORDER BY id desc `;

        sql.query(query, (err, res) => {
            if (err) {
                console.log("error: ", err);
                callback(null, err);
                return;
            }
            console.log("totalWithDraw: ", res);
            callback(null, res);
        });
    }

    static getById(id, callback) {
        let query = `SELECT * FROM  history WHERE id = ${id} `;

        sql.query(query, (err, res) => {
            if (err) {
                console.log("error: ", err);
                callback(null, err);
                return;
            }
            console.log("History Detail : ", res[0]);
            callback(null, res[0]);
        });
    }


    static totalWithdrawToday(userId, callback) {
        let query = `SELECT * FROM  history WHERE Date(created_date) = CURDATE() AND user_id = ${userId} AND type = 2 `;
        // sql.query(`SELECT * FROM users WHERE id = ${id}`, (err, res) => {
        //     if (err) {
        //         console.log("err", err);
        //         callback(err, null);
        //         return;
        //     }
        //     if (res.length) {
        //         console.log("found: ", res[0]);
        //         callback(null, res[0]);
        //         return;
        //     }
        //     // not found with the id
        //     callback({kind: "not_found"}, null);
        // });
        sql.query(query, (err, res) => {
            if (err) {
                console.log("error: ", err);
                callback(null, err);
                return;
            }
            console.log("totalWithDraw: ", res);
            callback(null, res.length);
        });
    }
}

module.exports = {History, QLHistory};
