// basic route
// =======================
// load all socket controller ================
// =======================

const config = require('../../config.js');
const CONST = require('../../CONST/SOCKET_CONST.js');
var index = function (socket) {
  // console.log(socket)
  socket.emit(CONST.NAMESPACE.LOGIN, { message: 'welcome to socket server' }); //when socket connect
  socket.on(CONST.NAMESPACE.LOGIN, require('./login.js')(socket));
  socket.on(CONST.NAMESPACE.DISCONNECT, require('./disconnect.js')(socket));
  socket.on(CONST.NAMESPACE.ADMIN, require('./admin.js')(socket));
};

module.exports = index;
