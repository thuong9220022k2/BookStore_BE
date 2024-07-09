const express = require("express");
const admin = require("../controllers/admin.controller");

const router = express.Router(); 

router.route("/signin").post(admin.signIn);
router.route("/signup").post(admin.signUp);
router.route("/signout").post(admin.signOut);
router.route("/employee").get(admin.findAll)  
router.route("/:id").patch(admin.update);
module.exports = router;