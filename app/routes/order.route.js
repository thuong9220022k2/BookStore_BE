const express = require("express");
const order = require("../controllers/order.controller");

const router = express.Router();

router.route("/") 
    .post(order.addToOrder)
    .get(order.findAllOrders)

router.route("/:id")
    .get(order.findOne)
    .patch(order.updateOrderStatus)

router.route("/customer/:id")
    .get(order.findUserOrders)

module.exports = router;