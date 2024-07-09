const express = require("express");
const categories = require("../controllers/category.controller");

const router = express.Router(); 

router.route("/")
    .get(categories.findAll)
    .post(categories.create);

router.route("/:id")
    .get(categories.findOne)
    .patch(categories.update)
    .delete(categories.delete);

module.exports = router;