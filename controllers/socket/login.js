const config = require('../../config.js');
const CONST = require('../../CONST/SOCKET_CONST.js');
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const User = require('../../models/user.js');


module.exports = function (socket) {
    return function (data) {
        switch (data.command) {
            case CONST.RECEIVE.LOGIN.AUTH:
                var token = data.token;

                if (token) {
                    // verifies secret and checks exp
                    jwt.verify(token, config.secret, function (err, decoded) {
                        if (err) {
                            socket.emit(CONST.NAMESPACE.AUTH, {
                                code: config.CODE_ERR_WITH_MESS,
                                message: 'Error: ' + err
                            });
                            socket.disconnect('unauthorized');
                        } else {

                            User.findOne({
                                _id: decoded._id,
                                timePassChange: decoded.secret
                            }, function (err, user) {
                                if (err) throw err;
                                if (!user) {
                                    socket.emit(CONST.NAMESPACE.AUTH, 
                                    {
                                        command: CONST.RETURN.AUTH.LOGIN,
                                        code: config.CODE_ERR_WITH_MESS,
                                        message: 'Authentication failed.'
                                    });
                                    return;
                                } else if (user.isLocked) {
                                    socket.emit(CONST.NAMESPACE.AUTH, {
                                        command: CONST.RETURN.AUTH.LOGIN,
                                        code: config.CODE_ERR_WITH_MESS,
                                        message: 'User is locked'
                                    });
                                    socket.disconnect('unauthorized');
                                    return;
                                } else if (user) {

                                    if(global.hshUserSocket.hasOwnProperty(user.id))
                                    {
                                                                            socket.emit(CONST.NAMESPACE.AUTH, {
                                        command: CONST.RETURN.AUTH.LOGIN,
                                        code: config.CODE_ERR_WITH_MESS,
                                        message: 'User is online already'
                                    });
                                    socket.disconnect('unauthorized');
                                    return;
                                    }

                                    socket.emit(CONST.NAMESPACE.AUTH, {
                                        command: CONST.RETURN.AUTH.LOGIN,
                                        code: config.CODE_OK_WITH_MESS,
                                        user: {
                                            _id: user._id,
                                            name: user.name,
                                            phone: user.phone,
                                            studentId: user.studentId,
                                            role: user.role.name
                                        }
                                    });

                                    //room for various role
                                    if(config.ROLE_ADMIN == user.role.name)
                                    {
                                        socket.join(CONST.ROOMS.ADMIN);
                                    }
                                    else if(config.ROLE_VIEWER == user.role.name)
                                    {
                                        socket.join(CONST.ROOMS.VIEWER);
                                    }
                                    else
                                    {
                                        socket.join(CONST.ROOMS.USER);
                                    }

                                    

                                  if (user.role.name == 'user') {
                                        socket.broadcast.emit(CONST.NAMESPACE.AUTH,{
                                            command: CONST.RETURN.AUTH.USER_GO_ONLINE,
                                            user:{
                                                _id: user._id,
                                                name:user.name,
                                                studentId: user.studentId,
                                                role: user.role.name
                                            }
                                        });

                                        global.userCount ++;
                                        console.log(global.userCount + ' user online ');
                                    }
                                    user.isOnline = true;
                                    console.log(user.name+', '+user.studentId+' is online');
                                    
                                    global.hshSocketUser[socket.id] = user._id;
                                    global.hshUserSocket[user._id] = socket.id;
                                    global.hshIdSocket[socket.id] = socket;
                                    
                                    user.save(function(err){
                                        if(err){
                                            console.log(err);
                                            return;
                                        }

                                    })

                                }
                            }).populate('role');

                        }
                    });
                } else {

                    // if there is no token
                    // return an error
                    socket.emit({
                        code: config.CODE_ERR_WITH_MESS,
                        message: 'token must exist'
                    });
                    socket.disconnect('unauthorized');
                }


            default:
                break;
        }
    }
}