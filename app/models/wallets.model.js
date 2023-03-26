"use strict";
const sql = require("./db");

class Wallet {
    constructor(wallet) {

    }
}

class QLWallet {

    static getByCardNumber(cardNumber, callback) {
        sql.query(`SELECT * FROM cards WHERE card_number = '${cardNumber}' `, (err, res) => {
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

    static getTelecomCompany(callback) {
        sql.query(`SELECT * FROM telecom_company `, (err, res) => {
            if (err) {
                console.log("err", err);
                callback(err, null);
                return;
            }
            if (res.length) {
                console.log("getTelecomCompany: ", res);
                callback(null, res);
                return;
            }
            // not found with the id
            callback({kind: "not_found"}, null);
        });
    }
}

module.exports = {Wallet, QLWallet};
