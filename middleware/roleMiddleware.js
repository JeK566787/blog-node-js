const jwt = require("jsonwebtoken");
const { secret } = require("../helpers/config");

const generateAccessToken = (id, roles) => {
  const payload = {
    id,
    roles,
  };
  return jwt.sign(payload, secret, { expiresIn: "24h" });
};

const verifyRefreshToken = (refreshToken) => {
  try {
    const decodedData = jwt.verify(refreshToken, secret);
    const { id, roles } = decodedData;
    const accessToken = generateAccessToken(id, roles);
    return accessToken;
  } catch (e) {
    return null;
  }
};

module.exports = function (roles) {
  return function (req, res, next) {
    if (req.method === "OPTIONS") {
      next();
    }

    try {
      const token = req.cookies.token;
      const refreshToken = req.cookies.refreshToken;

      if (token) {
        jwt.verify(token, secret, (err, decodedToken) => {
          if (err) {
            // return res.status(403).json({ message: "Invalid token" });
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

            // const userRoles = decodedToken ? decodedToken.roles : [];

            const userRoles = decodedToken && decodedToken.roles;

            console.log("User Roles:", userRoles);

            if (!userRoles) {
              return res
                .status(403)
                .json({ message: "Invalid token: missing user roles" });
            }

            let hasRole = false;
            userRoles.forEach((role) => {
              if (roles.includes(role)) {
                hasRole = true;
              }
            });

            if (!hasRole) {
              return res
                .status(403)
                .json({ message: "You don't have access!" });
            }

            next();
          }
        });
      } else if (refreshToken) {
        const newAccessToken = verifyRefreshToken(refreshToken);
        if (!newAccessToken) {
          return res.status(403).json({ message: "Invalid refresh token" });
        }

        res.cookie("token", newAccessToken, { maxAge: 86400, httpOnly: true });
        next();
      } else {
        return res.status(403).json({ message: "User wasn't logged in!" });
      }
    } catch (e) {
      console.log(e);
      return res.status(403).json({ message: "User wasn't logged in!" });
    }
  };
};
// ===================================================================
// module.exports = function (roles) {
//   return function (req, res, next) {
//     if (req.method === "OPTIONS") {
//       next();
//     }

//     try {
//       const token = req.cookies.token;
//       const refreshToken = req.cookies.refreshToken;

//       if (!token && refreshToken) {
//         const newAccessToken = verifyRefreshToken(refreshToken);
//         if (!newAccessToken) {
//           return res.status(403).json({ message: "Invalid refresh token" });
//         }

//         res.cookie("token", newAccessToken, { maxAge: 86400, httpOnly: true });
//       }

//       if (token) {
//         const decodedToken = jwt.verify(token, secret);
//         const userRoles = decodedToken ? decodedToken.roles : [];

//         let hasRole = false;
//         userRoles.forEach((role) => {
//           if (roles.includes(role)) {
//             hasRole = true;
//           }
//         });

//         if (!hasRole) {
//           return res.status(403).json({ message: "You don't have access!" });
//         }
//       }

//       next();
//     } catch (e) {
//       console.log(e);
//       return res.status(403).json({ message: "User wasn't logged in!!" });
//     }
//   };
// };
// =====================================================================
// const jwt = require("jsonwebtoken");
// const { secret } = require("../helpers/config");

// const generateAccessToken = (id, roles) => {
//   const payload = {
//     id,
//     roles,
//   };
//   return jwt.sign(payload, secret, { expiresIn: "24h" });
// };

// const verifyRefreshToken = (refreshToken) => {
//   try {
//     const decodedData = jwt.verify(refreshToken, secret);
//     const { id, roles } = decodedData;
//     const accessToken = generateAccessToken({ id, roles });
//     return accessToken;
//   } catch (e) {
//     return null;
//   }
// };

// module.exports = function (roles) {
//   return function (req, res, next) {
//     if (req.method === "OPTIONS") {
//       next();
//     }

//     try {
//       // const token = req.headers.authorization.split(" ")[1];
//       const token = req.cookies.token;
//       const refreshToken = req.cookies.refreshToken;

//       // if (!token) {
//       //   return res.status(403).json({ message: "User wasn't logged in" });
//       // }

//       if (!token) {
//         const newToken = verifyRefreshToken(refreshToken);
//         if (!newToken) {
//           return res.status(403).json({ message: "Invalid refresh token" });
//         }
//         res.cookie("token", newToken);
//       }

//       const { roles: userRoles } = jwt.verify(token, secret);
//       let hasRole = false;
//       userRoles.forEach((role) => {
//         if (roles.includes(role)) {
//           hasRole = true;
//         }
//       });
//       if (!hasRole) {
//         return res.status(403).json({ message: "You don't have access!" });
//       }

//       next();
//     } catch (e) {
//       console.log(e);
//       return res.status(403).json({ message: "User wasn't logged in!!!!" });
//     }
//   };
// };
