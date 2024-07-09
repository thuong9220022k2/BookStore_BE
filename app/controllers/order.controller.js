const jwt = require("jsonwebtoken");

const OrderService = require("../services/order.service");

const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

//Đặt hàng 
exports.addToOrder = async (req, res, next) => {
    try {
        console.log(req.body);
        const orderService = new OrderService(MongoDB.client);
        const document = await orderService.addToOrder(req.body);
        console.log("document", document)
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while creating the order")
        );
    }
};

//Lấy tất cả đơn hàng
exports.findAllOrders = async (req, res, next) => {
    let documents = [];
    try {
        const orderService = new OrderService(MongoDB.client);
        const { name } = req.query;
        if (name)
            documents = await orderService.findByName(name);
        else
            documents = await orderService.find({});
        console.log(documents)
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while retrieving orders")
        );
    }
    return res.send(documents);
};

//Tìm kiếm để lấy đơn hàng theo id đơn hàng
exports.findOne = async (req, res, next) => {
    try {
        const orderService = new OrderService(MongoDB.client);
        const document = await orderService.findById(req.params.id);
        if (!document)
            return next(new ApiError(404, "Order not found"));
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(500, `Error retrieving order with id=${req.params.id}`)
        );
    }
};

//Tìm kiếm để lấy đơn hàng của khách hàng
exports.findUserOrders = async (req, res, next) => {
    try {
        const orderService = new OrderService(MongoDB.client);
        const document = await orderService.findUserOrders(req.params.id);
        if (!document)
            return next(new ApiError(404, "UserOrder not found"));
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(500, `Error retrieving order with id=${req.params.id}`)
        );
    }
};

//Duyệt đơn hàng (ADMIN)
exports.updateOrderStatus = async (req, res, next) => {
    try {
        const orderService = new OrderService(MongoDB.client);
        const order = await orderService.updateOrderStatus(req.params.id, req.body);
        if (!order)
            return next(new ApiError(404, "Order not found"));
        return res.send({ message: "OrderStatus was updated successfully" });
    } catch (error) {
        return next(
            new ApiError(500, `Error updating order with id=${req.params.id}`)
        );
    }
};

