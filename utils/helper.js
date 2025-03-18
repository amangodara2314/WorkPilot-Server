const { v4: uuidv4 } = require("uuid");

function generateInviteCode() {
  return uuidv4().replace(/-/g, "").slice(0, 6);
}

module.exports = { generateInviteCode };
