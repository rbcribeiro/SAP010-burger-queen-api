let globalToken = null;

function setGlobalToken(token) {
  globalToken = token;
}

function getGlobalToken() {
  return globalToken;
}

module.exports = {
  setGlobalToken,
  getGlobalToken,
};
