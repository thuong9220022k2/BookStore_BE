const express = require("express");
const products = require("../controllers/product.controller");
const multer = require("multer");

const router = express.Router();

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, "uploads/");
//     },
//     filename: function (req, file, cb) {
//         cb(null, file.originalname);
//     },
// });

// const upload = multer({ storage: storage });

const storage = new multer.memoryStorage();
const upload = multer({
    storage,
});

router.route("/")
    .get(products.findAll)
    .post(upload.single("image"), products.create)
    .delete(products.deleteAll);

router.route("/new").get(products.findNew)

router.route("/:id")
    .get(products.findOne)
    .patch(upload.single("image"), products.update)
    .delete(products.delete);

router
    .route("/review/:id")
    .get(products.getReviewProduct)
    .post(products.addReviewProduct)

router.route("/category/:id").get(products.findByCategory);
module.exports = router;
