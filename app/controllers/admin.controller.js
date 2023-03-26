"use strict";
const {QLHistory} = require("../models/history.model");
const {User, QLUser} = require("../models/users.model");

class AdminController {
    getWatingConfirm(req, res) {
        res.locals.user = req.session.user;

        // console.log(123456, req.session.user);
        QLHistory.getAllTransactionWaitingConfirm((err, result) => {
            let histories = null;
            histories = result;
            res.render("admin/waiting-confirm", {
                activeWaitingConfirm: 'active',
                // user: user,
                histories
            });
        });
    }

    getWatingConfirmDetail(req, res) {
        res.locals.user = req.session.user;

        QLUser.getById(req.session.user.id, (err, result) => {
            // let user = result;
            // console.log(123456, req.session.user);
            QLHistory.getById(req.params.id, (err, result) => {
                let history = result;
                if (err) {
                    res.redirect('/404');
                } else {
                    QLUser.getById(history.user_id, (err, result) => {
                        const userData = result;

                        QLUser.getById(history.from_user, (err, result) => {
                            const fromUserData = result
                            QLUser.getById(history.to_user, (err, result) => {
                                const toUserData = result;
                                const item = {
                                    userData: userData,
                                    fromUserData: fromUserData,
                                    toUserData: toUserData,
                                    ...history

                                }
                                console.log(result);
                                res.render("admin/waiting-confirm-detail", {
                                    activeWaitingConfirm: 'active',
                                    // user: user,
                                    item: item
                                });
                            });
                        });
                    });


                }

            });

        })

    }

    confirm(req, res) {
        // console.log(123456, req.session.user);
        QLHistory.getById(req.params.id, (err, result) => {
            const transactionDetail = result;
            let history = result;
            if (transactionDetail.type === 3) {
                let fromBalance = 0;
                let toBalance = 0;
                if (transactionDetail.isReceiverPayFee) {
                    fromBalance = Number.parseFloat(transactionDetail.quantity);
                    toBalance = Number.parseFloat(transactionDetail.quantity) - Number.parseFloat((transactionDetail.quantity * 5 / 100));
                } else {
                    fromBalance = Number.parseFloat(transactionDetail.quantity) + Number.parseFloat((transactionDetail.quantity * 5 / 100));
                    toBalance = Number.parseFloat(transactionDetail.quantity);
                }
                QLUser.getById(history.from_user, (err, result) => {
                    if (err) {
                        res.redirect('/500');
                    } else {
                        if (fromBalance > Number.parseFloat(result.quantity)) {
                            let alert = [];
                            alert.push({msg: 'Tài khoản không đủ tiền'});
                            QLUser.getById(history.user_id, (err, result) => {
                                const userData = result;

                                QLUser.getById(history.from_user, (err, result) => {
                                    const fromUserData = result
                                    QLUser.getById(history.to_user, (err, result) => {
                                        const toUserData = result;
                                        const item = {
                                            userData: userData,
                                            fromUserData: fromUserData,
                                            toUserData: toUserData,
                                            ...history

                                        }
                                        console.log(result);
                                        res.render("admin/waiting-confirm-detail", {
                                            activeWaitingConfirm: 'active',
                                            // user: user,
                                            item: item,
                                            alert
                                        });
                                    });
                                });
                            });
                        } else {
                            QLUser.transfer(transactionDetail.from_user, fromBalance, (err, result) => {
                                if (err) {
                                    res.redirect('/500');
                                } else {
                                    QLUser.transferReceive(transactionDetail.to_user, toBalance, (err, result) => {
                                        if (err) {
                                            res.redirect('/500');
                                        } else {
                                            QLHistory.confirm(transactionDetail.id, (err, result) => {
                                                if (err) {
                                                    res.redirect('/500');
                                                } else {

                                                    res.redirect('/admins/transaction-waiting');
                                                }
                                            });

                                        }
                                    });
                                }

                            });
                        }
                    }
                });


            } else if (transactionDetail.type === 2) {
                const balance = Number.parseFloat(transactionDetail.quantity) + Number.parseFloat((transactionDetail.quantity * 5 / 100));
                QLUser.getById(history.from_user, (err, result) => {
                    if (err) {
                        res.redirect('/500');
                    } else {
                        if (balance > Number.parseFloat(result.quantity)) {
                            let alert = [];
                            alert.push({msg: 'Tài khoản không đủ tiền'});
                            QLUser.getById(history.user_id, (err, result) => {
                                const userData = result;

                                QLUser.getById(history.from_user, (err, result) => {
                                    const fromUserData = result
                                    QLUser.getById(history.to_user, (err, result) => {
                                        const toUserData = result;
                                        const item = {
                                            userData: userData,
                                            fromUserData: fromUserData,
                                            toUserData: toUserData,
                                            ...history

                                        }
                                        console.log(result);
                                        res.render("admin/waiting-confirm-detail", {
                                            activeWaitingConfirm: 'active',
                                            // user: user,
                                            item: item,
                                            alert
                                        });
                                    });
                                });
                            });
                        } else {
                            QLUser.withdraw(transactionDetail.from_user, balance, (err, result) => {
                                if (err) {
                                    res.redirect('/500');
                                } else {
                                    QLHistory.confirm(transactionDetail.id, (err, result) => {
                                        if (err) {
                                            res.redirect('/500');
                                        } else {

                                            res.redirect('/admins/transaction-waiting');
                                        }
                                    });
                                }

                            });
                        }

                    }

                });

            }


        });


    }

    cancel(req, res) {
        res.locals.user = req.session.user;

        // console.log(123456, req.session.user);
        QLHistory.cancel(req.params.id, (err, result) => {
            res.redirect('/admins/transaction-waiting');
        });

    }

}

module.exports = new AdminController();
