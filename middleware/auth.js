const jwt = require('jsonwebtoken');
const { secret } = require('../config');

module.exports = (secret) => (req, resp, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return next();
  }

  const [type, token] = authorization.split(' ');

  if (type.toLowerCase() !== 'bearer') {
    return next();
  }

  jwt.verify(token, secret, (err, decodedToken) => {
    if (err) {
      return resp.status(403).send('Acesso proibido');
    }

    // TODO: Verificar identidad del usuario usando `decodeToken.uid`
  });
};

module.exports.isAuthenticated = (req) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return false; // Usuário não forneceu token de autenticação
  }

  const [type, token] = authorization.split(' ');

  if (type.toLowerCase() !== 'bearer') {
    return false; // Tipo de autenticação inválido
  }

  try {
    jwt.verify(token, secret); // Verificar se o token é válido
    return true; // O token é válido, o usuário está autenticado
  } catch (error) {
    return false; // O token é inválido ou expirou
  }
};


module.exports.isAdmin = (req) => (
  req.user && req.user.role && req.user.role.admin
);

module.exports.requireAuth = (req, resp, next) => (
  (!module.exports.isAuthenticated(req))
    ? resp.status(401).send('Autenticação necessária')
    : next()
);

module.exports.requireAdmin = (req, resp, next) => (
  (!module.exports.isAuthenticated(req))
    ? resp.status(401).send('Autenticação necessária')
    : (!module.exports.isAdmin(req))
      ? resp.status(403).send('Acesso proibido')
      : next()
);
