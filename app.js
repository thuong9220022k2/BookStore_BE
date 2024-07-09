const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const jwtSecret = 'mysecretkey';

const requireSignIn = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new ApiError(401, 'Unauthorized: Missing or invalid token'));
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, jwtSecret, (err, decoded) => {
        if (err)
            return next(new ApiError(401, 'Unauthorized: Invalid token'));

        req.admin = decoded;
        next();
    });
};

const app = express();

const ApiError = require("./app/api-error");

const adminRouter = require("./app/routes/admin.route");
const customerRouter = require("./app/routes/customer.route");
const categoryRouter = require("./app/routes/category.route");
const productRouter = require("./app/routes/product.route");
const orderRouter = require("./app/routes/order.route");


app.use(cors());
app.use(express.json());
// app.use("/uploads", express.static('uploads'));

app.use("/api/admin", adminRouter);
app.use("/api/customer", customerRouter);
app.use("/api/category", categoryRouter);
app.use("/api/product", productRouter);
app.use("/api/order", requireSignIn, orderRouter);


app.use((req, res, next) => {
    return next(new ApiError(404, "Resource not found"));
});

app.use((err, req, res, next) => {
    return res.status(err.statusCode || 500).json({
        message: err.message || "Internal Server Error",
    });
});

app.get("/", (req, res) => {
    res.json({ message: "Welcome to my app" });
});

module.exports = app;