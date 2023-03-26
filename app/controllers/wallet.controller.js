"use strict";
const {QLUser} = require("../models/users.model");
const {QLWallet} = require("../models/wallets.model");
const {History, QLHistory} = require("../models/history.model");
const {check, validationResult} = require('express-validator')
const moment = require('moment')

class WalletController {
    index(req, res) {
        res.locals.user = req.session.user;
        res.locals.success = req.query.success;
        QLUser.getById(req.session.user.id, (err, result) => {
            res.render("index", {
                activeDashboard: 'active',
                user: result
            });
        })

    }

    getDeposit(req, res) {
        res.locals.user = req.session.user;
        QLUser.getById(req.session.user.id, (err, result) => {
            // console.log(123456, req.session.user);
            res.render("wallet/deposit", {
                activeDeposit: 'active',
                user: result
            });
        })

    }

    postDeposit(req, res) {
        res.locals.user = req.session.user;
        // console.log(123456, req.session.user);
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            // return res.status(422).jsonp(errors.array())
            const alert = errors.array()
            return res.render('wallet/deposit', {
                alert,
                activeDeposit: 'active'
            })
        } else {
            QLWallet.getByCardNumber(req.body.card_number, (err, result) => {
                if (err) {
                    let alert = [];
                    alert.push({msg: 'Thẻ này không được hỗ trợ'});
                    return res.render('wallet/deposit', {
                        alert,
                        activeDeposit: 'active'
                    })
                }
                const cardId = result.id;
                {
                    let alert = [];
                    let success = [];
                    if (req.body.cvv_number != result.cvv_number) {
                        alert.push({msg: 'Mã CVV không đúng'});
                        return res.render('wallet/deposit', {
                            alert,
                            activeDeposit: 'active',
                            success,
                        })
                    } else if (req.body.expired_date != result.expired_date) {
                        alert.push({msg: 'Ngày hết hạn không đúng'});
                        // moment(req.body.expired_date, 'DD/MM/YYYY').isAfter(result.expired_date)
                        return res.render('wallet/deposit', {
                            alert,
                            activeDeposit: 'active',
                            success,
                        })
                    } else {
                        if (req.body.card_number === '333333') {
                            alert.push({msg: 'Thẻ hết tiền'});
                            return res.render('wallet/deposit', {
                                alert,
                                activeDeposit: 'active',
                                success,
                            })
                        } else if (req.body.card_number === '222222' && req.body.balance > 1000000) {
                            alert.push({msg: 'Chỉ được nạp tối đa 1.000.000'});
                            return res.render('wallet/deposit', {
                                alert,
                                activeDeposit: 'active',
                                success,
                            })
                        } else {
                            QLUser.deposits(req.session.user.id, req.body.balance, (err, result) => {
                                if (err) {
                                    alert.push({msg: 'Nạp tiền thất bại'});
                                } else {
                                    success.push({msg: 'Nạp tiền thành công'});
                                    const history = {
                                        user_id: req.session.user.id,
                                        from_user: req.session.user.id,
                                        to_user: req.session.user.id,
                                        type: 1,
                                        quantity: req.body.balance,
                                        card_id: cardId,
                                        status: 2,
                                        note: 'Nạp ' + req.body.balance.toLocaleString('en-US') + ' vào tài khoản',
                                        fee: 0,
                                        isReceiverPayFee: 0
                                    };
                                    QLHistory.insertHistory(new History(history), (err, result) => {
                                    })
                                    res.redirect('/?success=true')
                                }
                            });
                        }


                    }


                    // var date = moment(req.body.expired_date).format('DD/MM/YYYY');

                }
            });
        }
    }

    getWithdraw(req, res) {
        res.locals.user = req.session.user;
        // console.log(123456, req.session.user);
        QLUser.getById(req.session.user.id, (err, result) => {
            res.render("wallet/withdraw", {
                activeWithdraw: 'active',
                user: result
            });
        })

    }

    postWithdraw(req, res) {
        res.locals.user = req.session.user;
        // console.log(123456, req.session.user);
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            // return res.status(422).jsonp(errors.array())
            const alert = errors.array()
            return res.render('wallet/withdraw', {
                alert,
                activeWithdraw: 'active'
            })
        } else {

            let totalWithDraw = 0;

            QLHistory.totalWithdrawToday(req.session.user.id, (err, result) => {
                if (!err) {
                    totalWithDraw = result;
                }
            });
            QLUser.getById(req.session.user.id, (err, result) => {
                if (err) {
                    res.redirect('/500');
                } else {
                    let currentUser = result;
                    res.locals.user = currentUser;
                    QLWallet.getByCardNumber(req.body.card_number, (err, result) => {
                        const cardId = result.id;
                        if (err) {
                            let alert = [];
                            alert.push({msg: 'Thông tin thẻ không hợp lệ'});
                            return res.render('wallet/withdraw', {
                                alert,
                                activeWithdraw: 'active'
                            })
                        } else {
                            let alert = [];
                            console.log('11111');
                            if (req.body.card_number === '333333' || req.body.card_number === '222222') {
                                
                                alert.push({msg: 'Thẻ này không được hỗ trợ để rút tiền'});
                                return res.render('wallet/withdraw', {
                                    alert,
                                    activeWithdraw: 'active',
                                })
                            } else if (req.body.expired_date != result.expired_date) {
                                alert.push({msg: 'Ngày hết hạn không đúng'});
                                // moment(req.body.expired_date, 'DD/MM/YYYY').isAfter(result.expired_date)
                                return res.render('wallet/withdraw', {
                                    alert,
                                    activeWithdraw: 'active',
                                })
                            } else if (req.body.cvv_number != result.cvv_number) {
                                alert.push({msg: 'Mã CVV không đúng'});
                                return res.render('wallet/withdraw', {
                                    alert,
                                    activeWithdraw: 'active',
                                })
                            } else if (req.body.balance > currentUser.balance) {
                                alert.push({msg: 'Tài khoản không đủ tiền'});
                                return res.render('wallet/withdraw', {
                                    alert,
                                    activeWithdraw: 'active',
                                })
                            } else if (totalWithDraw >= 2) {
                                alert.push({msg: 'Mỗi ngày chỉ được rút tiền tối đa 2 lần'});
                                return res.render('wallet/withdraw', {
                                    alert,
                                    activeWithdraw: 'active',
                                })
                            } else {

                                console.log('222222');
                                const balance = Number.parseFloat(req.body.balance) + Number.parseFloat((req.body.balance * 5 / 100));
                                // success.push({msg: 'Nạp tiền thành công'});
                                const history = {
                                    user_id: req.session.user.id,
                                    from_user: req.session.user.id,
                                    to_user: req.session.user.id,
                                    type: 2,
                                    quantity: req.body.balance,
                                    card_id: cardId,
                                    status: req.body.balance > 5000000 ? 0 : 2,
                                    note: req.body.note,
                                    fee: 5,
                                    isReceiverPayFee: req.body.isReceiverPayFee ? 1 : 0
                                };
                                QLHistory.insertHistory(new History(history), (err, result) => {
                                })
                                if (req.body.balance <= 5000000) {
                                    QLUser.withdraw(req.session.user.id, balance, (err, result) => {

                                    });
                                }
                                res.redirect('/?success=true')

                            }


                            // var date = moment(req.body.expired_date).format('DD/MM/YYYY');

                        }
                    });
                }


            });

        }
    }

    getTransfer(req, res) {
        res.locals.user = req.session.user;
        QLUser.getById(req.session.user.id, (err, result) => {
            // console.log(123456, req.session.user);
            res.render("wallet/transfer", {
                activeTransfer: 'active',
                user: result
            });
        })

    }

    postTransfer(req, res) {
        res.locals.user = req.session.user;
        res.locals.phone_number = req.body.phone_number;
        res.locals.note = req.body.note;
        res.locals.balance = req.body.balance;
        res.locals.isReceiverPayFee = req.body.isReceiverPayFee;

        // console.log(123456, req.session.user);
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            // return res.status(422).jsonp(errors.array())
            const alert = errors.array()
            return res.render('wallet/transfer', {
                alert,
                activeTransfer: 'active'
            })
        } else {
            QLUser.getById(req.session.user.id, (err, result) => {
                // console.log(123456, req.session.user);
                res.locals.user = result;
                if (req.body.balance > res.locals.user.balance) {
                    let alert = [];
                    alert.push({msg: 'Tài khoản không đủ tiền'});
                    return res.render('wallet/transfer', {
                        alert,
                        activeTransfer: 'active',
                    })
                } else {

                    let alert = [];
                    console.log('isReceiverPayFee', req.body.isReceiverPayFee);
                    const otp = Math.floor(100000 + Math.random() * 900000);
                    QLUser.sendOTPTransfer(req.session.user.id, otp, (err, result) => {
                        if (err) {
                            res.redirect('/500');
                        } else {
                            var content = '';
                            content += `
                            <div style="padding: 10px; background-color: #003375">
                                <h2 style="margin: 5px;"> Ví điện tử 2022</h2>
                                <div style="padding: 10px; background-color: white;">
                                    <h3>Xác nhận Chuyển tiền</h3>
                                    <h4 style="color: black">Mã OTP của bạn là: <strong>${otp}</strong></h4>
                                </div>
                            </div> `;
                            QLUser.sendMail(res.locals.user.email, 'OTP Chuyển tiền', content);

                        }
                    });
                    return res.render('wallet/transfer-otp', {
                        alert,
                        activeTransfer: 'active',

                    })
                }
            })

        }

    }

    postTransferOTP(req, res) {
        res.locals.user = req.session.user;
        res.locals.phone_number = req.body.phone_number;
        res.locals.note = req.body.note;
        res.locals.balance = req.body.balance;
        res.locals.isReceiverPayFee = req.body.isReceiverPayFee;

        let alert = [];
        QLUser.getById(req.session.user.id, (err, result) => {
            // console.log(123456, req.session.user);
            res.locals.user = result;
        })
        // console.log(123456, req.session.user);
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            // return res.status(422).jsonp(errors.array())
            const alert = errors.array()
            return res.render('wallet/transfer-otp', {
                alert,
                activeTransfer: 'active'
            })
        } else {
            QLUser.getById(req.session.user.id, (err, result) => {
                let duration = moment.duration(moment().diff(result.otp_transfer_time)).asSeconds();
                console.log(duration);
                let currentUser = result;
                if (duration > 60) {
                    alert.push({msg: 'Mã OTP Hết hạn ( quá 1 phút ) '});
                    return res.render('wallet/transfer-otp', {
                        alert,
                        activeTransfer: 'active',
                    })
                } else if (result.otp_transfer !== req.body.otp_transfer) {
                    alert.push({msg: 'Mã OTP Không đúng '});
                    return res.render('wallet/transfer-otp', {
                        alert,
                        activeTransfer: 'active',
                    })
                } else {
                    let to_user_id = 0;
                    let fee = 0;
                    let fromBalance = 0;
                    let toBalance = 0;

                    QLUser.getByPhoneNumber(req.body.phone_number, (err, result) => {
                        const toUser = result;
                        if (req.body.isReceiverPayFee) {
                            fromBalance = Number.parseFloat(req.body.balance);
                            toBalance = Number.parseFloat(req.body.balance) - Number.parseFloat((req.body.balance * 5 / 100));
                        } else {
                            fromBalance = Number.parseFloat(req.body.balance) + Number.parseFloat((req.body.balance * 5 / 100));
                            toBalance = Number.parseFloat(req.body.balance);
                        }

                        // success.push({msg: 'Nạp tiền thành công'});
                        const history = {
                            user_id: req.session.user.id,
                            from_user: req.session.user.id,
                            to_user: result.id,
                            type: 3,
                            quantity: req.body.balance,
                            card_id: 1,
                            status: req.body.balance > 5000000 ? 0 : 2,
                            note: req.body.note,
                            fee: 5,
                            isReceiverPayFee: req.body.isReceiverPayFee ? 1 : 0
                        };
                        QLHistory.insertHistory(new History(history), (err, result) => {
                        })
                        if (req.body.balance <= 5000000) {
                            QLUser.transfer(req.session.user.id, fromBalance, (err, result) => {
                            });

                            QLUser.transferReceive(result.id, toBalance, (err, result) => {
                                var content = '';
                                content += `
                                <div style="padding: 10px; background-color: #003375">
                                    <h2 style="margin: 5px;"> Ví điện tử 2022</h2>
                                    <div style="padding: 10px; background-color: white;">
                                        <p>Bạn đã nhận được <strong>${toBalance.toLocaleString('en-US')}</strong> từ Số điện thoại <strong>${currentUser.phone_number} (${currentUser.full_name})</strong>,
                                         Số dư tài khoản của bạn là : <strong>${(Number.parseFloat(toUser.balance) + toBalance).toLocaleString('en-US') }</strong> </p>
                                    </div>
                                </div> `;
                                QLUser.sendMail(toUser.email, 'Biến động số dư', content);
                            });
                        }
                        res.redirect('/?success=true')
                    });

                }

            });


        }
    }

    getBuyCard(req, res) {
        res.locals.user = req.session.user;
        QLWallet.getTelecomCompany((err, result) => {
            res.locals.telecoms = result;
        });
        QLUser.getById(req.session.user.id, (err, result) => {
            // console.log(123456, req.session.user);
            res.render("wallet/buy-card", {
                activeCard: 'active',
                user: result
            });
        })

    }

    postBuyCard(req, res) {
        res.locals.user = req.session.user;

        QLUser.getById(req.session.user.id, (err, result) => {
            // console.log(123456, req.session.user);
            res.locals.user = result;
        })
        QLWallet.getTelecomCompany((err, result) => {
            let telecoms = result;
            // console.log(123456, req.session.user);
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                // return res.status(422).jsonp(errors.array())
                const alert = errors.array()
                return res.render('wallet/buy-card', {
                    alert,
                    activeCard: 'active',
                    telecoms: result
                })
            } else {
                if ((req.body.name1 && req.body.price1)
                    || (req.body.name2 && req.body.price2)
                    || (req.body.name3 && req.body.price3)
                    || (req.body.name4 && req.body.price4)
                    || (req.body.name5 && req.body.price5)
                ) {
                    let listBuyCard = [];
                    let balance = 0;
                    let name1 = '';
                    let price1 = 0;
                    let name2 = '';
                    let price2 = 0;
                    let name3 = '';
                    let price3 = 0;
                    let name4 = '';
                    let price4 = 0;
                    let name5 = '';
                    let price5 = 0;
                    let code1 = '';
                    let code2 = '';
                    let code3 = '';
                    let code4 = '';
                    let code5 = '';
                    if (req.body.name1 && req.body.price1) {
                        name1 = req.body.name1;
                        price1 = Number.parseInt(req.body.price1);
                        balance += Number.parseInt(req.body.price1);
                        code1 = name1 + Math.floor(10000 + Math.random() * 90000);
                        listBuyCard.push({
                            name: name1,
                            price: price1,
                            code: code1
                        })
                    }
                    if (req.body.name2 && req.body.price2) {
                        name2 = req.body.name2;
                        price2 = Number.parseInt(req.body.price2);
                        balance += Number.parseInt(req.body.price2);
                        code2 = name2 + Math.floor(10000 + Math.random() * 90000);
                        listBuyCard.push({
                            name: name2,
                            price: price2,
                            code: code2
                        })
                    }
                    if (req.body.name3 && req.body.price3) {
                        name3 = req.body.name3;
                        price3 = Number.parseInt(req.body.price3);
                        balance += Number.parseInt(req.body.price3);
                        code3 = name3 + Math.floor(10000 + Math.random() * 90000);
                        listBuyCard.push({
                            name: name3,
                            price: price3,
                            code: code3
                        })
                    }
                    if (req.body.name4 && req.body.price4) {
                        name4 = req.body.name4;
                        price4 = Number.parseInt(req.body.price4);
                        balance += Number.parseInt(req.body.price4);
                        code4 = name4 + Math.floor(10000 + Math.random() * 90000);
                        listBuyCard.push({
                            name: name4,
                            price: price4,
                            code: code4
                        })
                    }
                    if (req.body.name5 && req.body.price5) {
                        name5 = req.body.name5;
                        price5 = Number.parseInt(req.body.price5);
                        balance += Number.parseInt(req.body.price5);
                        code5 = name5 + Math.floor(10000 + Math.random() * 90000);
                        listBuyCard.push({
                            name: name5,
                            price: price5,
                            code: code5
                        })
                    }
                    console.log(req.body);
                    // success.push({msg: 'Nạp tiền thành công'});
                    const history = {
                        user_id: req.session.user.id,
                        from_user: req.session.user.id,
                        to_user: req.session.user.id,
                        type: 4,
                        quantity: balance,
                        card_id: 1,
                        status: 2,
                        note: 'Nạp tiền điện thoại',
                        fee: 0,
                        isReceiverPayFee: 0,
                        name1: name1,
                        price1: price1,
                        code1: code1,

                        name2: name2,
                        price2: price2,
                        code2: code2,

                        name3: name3,
                        price3: price3,
                        code3: code3,

                        name4: name4,
                        price4: price4,
                        code4: code4,

                        name5: name5,
                        price5: price5,
                        code5: code5,
                    };
                    QLUser.getById(req.session.user.id, (err, result) => {
                        if (balance > result.balance) {
                            let alert = [];
                            alert.push({msg: 'Tài khoản không đủ tiền'});
                            return res.render('wallet/buy-card', {
                                alert,
                                activeCard: 'active',
                                telecoms: telecoms
                            })
                        } else {
                            QLHistory.insertHistory(new History(history), (err, result) => {
                            })
                            QLUser.withdraw(req.session.user.id, balance, (err, result) => {

                            });
                            QLUser.getById(req.session.user.id, (err, result) => {
                                return res.render('wallet/list-buy-card', {
                                    activeCard: 'active',
                                    telecoms: telecoms,
                                    listBuyCard,
                                    user: result
                                })
                            });

                        }


                    })

                    // let alert = [];
                    // console.log('isReceiverPayFee', req.body.isReceiverPayFee);
                    // const otp = Math.floor(100000 + Math.random() * 900000);
                    // QLUser.sendOTPTransfer(req.session.user.id, otp, (err, result) => {
                    //
                    // });
                    // return res.render('wallet/transfer-otp', {
                    //     alert,
                    //     activeTransfer: 'active',
                    //
                    // })


                } else {
                    let alert = [];
                    alert.push({msg: 'Bạn phải chọn ít nhất 1 nhà mạng'});
                    return res.render('wallet/buy-card', {
                        alert,
                        activeCard: 'active',
                        telecoms: telecoms
                    })
                }
            }
        });
    }

    getHistory(req, res) {
        res.locals.user = req.session.user;

        QLUser.getById(req.session.user.id, (err, result) => {
            let user = null;
            user = result;
            // console.log(123456, req.session.user);
            QLHistory.getAll(req.session.user.id, (err, result) => {
                let histories = null;
                histories = result;
                res.render("wallet/history-transaction", {
                    activeHistory: 'active',
                    user: user,
                    histories
                });
            });

        })

    }

    getHistoryDetail(req, res) {
        res.locals.user = req.session.user;

        QLUser.getById(req.session.user.id, (err, result) => {
            let user = result;
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
                                res.render("wallet/history-detail", {
                                    activeHistory: 'active',
                                    user: user,
                                    item: item
                                });
                            });
                        });
                    });


                }

            });

        })

    }
}

module.exports = new WalletController();
