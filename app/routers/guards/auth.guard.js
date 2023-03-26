exports.isOnlyAuth = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.redirect("/login");
    }
};

exports.isAuth = (req, res, next) => {
    if (req.session.userId) {
        // console.log(req.originalUrl);
        if (req.originalUrl != '/change-password' && req.session.status == 0) {
            res.redirect('/change-password')
        } else {
            if(req.session.status == 1 || req.session.status == 3) {
                res.redirect('/permission-denied')
            } else {
                next();
            }

        }

    } else {
        res.redirect("/login");
    }
};
exports.isConfirm = (req, res, next) => {
    if (req.session.userId) {
        // console.log(req.originalUrl);
        if (req.originalUrl != '/change-password' && req.session.status == 0) {
            res.redirect('/change-password')
        } else {
            if(req.session.status !== 3) {
                res.redirect('/permission-denied')
            } else {
                next();
            }

        }

    } else {
        res.redirect("/login");
    }
};

exports.isFirstLogin = (req, res, next) => {
    if (req.session.userId) {
        console.log(req.originalUrl);
        if (req.session.status == 0) {
            res.redirect('/change-password')
        } else {
            next();
        }


    } else {
        res.redirect("/login");
    }
};

exports.isAdminAuth = (req, res, next) => {
    if (req.session.userId) {
        // console.log(req.originalUrl);
        if (req.originalUrl != '/change-password' && req.session.status == 0) {
            res.redirect('/change-password')
        } else {
            if (req.session.user.role == 'ADMIN') {
                next();
            } else {
                res.redirect("/permission-denied");
            }

        }


    } else {
        res.redirect("/login");
    }
};

exports.notAuth = (req, res, next) => {
    if (!req.session.userId) next();
    else res.redirect("/");
};
