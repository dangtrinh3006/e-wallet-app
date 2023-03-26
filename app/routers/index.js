module.exports = (app) => {
  require("./auth.route")(app);
  require("./user.route")(app);
  require("./wallet.route")(app);
  require("./admin.route")(app);
};
