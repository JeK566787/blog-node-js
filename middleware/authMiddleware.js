const jwt = require("jsonwebtoken");
const { secret } = require("../helpers/config");

const verifyRefreshToken = (refreshToken) => {
  try {
    const decodedData = jwt.verify(refreshToken, secret);
    return decodedData;
  } catch (e) {
    return null;
  }
};

module.exports = function (req, res, next) {
  if (req.method === "OPTIONS") {
    next();
  }
  try {
    const token = req.cookies.token;
    const refreshToken = req.cookies.refreshToken;

    // if (!token || !refreshToken) {
    //   // Если не найдены и access token, и refresh token, то закрываем доступ
    //   return res.status(401).json({ message: "Unauthorized@@" });
    // }

    // Проверяем access token
    jwt.verify(token, secret, (err, decodedToken) => {
      if (err) {
        // Если access token недействителен или истек, проверяем refresh token
        const decodedRefreshToken = verifyRefreshToken(refreshToken);
        if (!decodedRefreshToken) {
          // Если refresh token недействителен или истек, то закрываем доступ
          return res.redirect("/enter");
          // return res.status(401).json({ message: "Unauthorized!!!" });
        }

        // Генерируем новый access token на основе данных из refresh token
        const newToken = jwt.sign(
          {
            id: decodedRefreshToken.userId,
            roles: decodedRefreshToken.roles,
          },
          secret,
          { expiresIn: "24h" }
        );

        // Устанавливаем новый access token в куки
        res.cookie("token", newToken, { maxAge: 86400, httpOnly: true });

        // Пропускаем запрос дальше
        next();
      } else {
        // Если access token валидный, пропускаем запрос дальше
        req.user = decodedToken;
        next();
      }
    });
  } catch (e) {
    console.log(e);
    return res.status(403).json({ message: "User wasn't logged in" });
  }
};
