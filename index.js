require("dotenv/config");
const express = require("express");
const session = require("express-session");
const authGuard = require("./app/routers/guards/auth.guard");
const methodOverride = require("method-override");
const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.set("views", "app/views");
app.use(
    session({
        secret: "this is my secret secret to hash express sessions ......",
        saveUninitialized: false,
        user: {}
    })
);
app.use(express.static("app/public"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method", {methods: ["POST", "GET"]}));
app.use(
    methodOverride(function (req, res) {
        if (req.body && typeof req.body === "object" && "_method" in req.body) {
            var method = req.body._method;
            delete req.body._method;
            return method;
        }
    })
);



app.get("/500", (req, res) => {
    res.render("err");
});
app.get("/404", (req, res) => {
    res.render("404");
});

app.get("/permission-denied", (req, res) => {
    res.render("permission-denied");
});

require("./app/routers")(app);
app.get('*', function(req, res) {
    res.render("404");
  });
  
app.listen(port, () => {
    console.log(`Truy cập localhost:${port} để sử dụng trang web.`);
});
