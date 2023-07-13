const Router = require("express");
const router = new Router();
const controller = require("../controllers/auth-controller.js");
const { check } = require("express-validator");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const createPath = require("../helpers/create-path");

router.post(
  "/auth/registration",
  [
    check("username", "User's name can't be empty").notEmpty(),
    check("password", "Password has to be more 4 or less 10 symbols").isLength({
      min: 4,
      max: 10,
    }),
  ],
  controller.registration
);
router.post("/login", controller.login);
router.get("/users", roleMiddleware(["ADMIN"]), controller.getUsers);

router.get("/registration", (req, res) => {
  const title = "Registration";
  res.render(createPath("registration"), { title });
});
router.get("/login", (req, res) => {
  const title = "login";
  res.render(createPath("login"), { title });
});

module.exports = router;
