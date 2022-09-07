const { register, login, getUser } = require("../controllers/usersController");

const router = require("express").Router();

router.post("/register", register);
router.post("/login", login);
router.get("/getUser/:id", getUser);

module.exports = router;
