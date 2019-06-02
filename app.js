// =======================
// get the packages we need ============
// =======================
var express = require('express');
var app = express();

var server = require('http').createServer();
global.io = require('socket.io')(server, {
    'transports': ['websocket', 'polling']
});

// app.use(express.static('/Users/phungthelam/Documents/Angular/CBDG/CBDG/dist'));

var config = require('./config'); // get our config file

var api = require('./controllers/api/index.js');

const EXPRESSPORT = process.env.PORT | config.EXPRESS_PORT;
const SOCKETIOPRT = process.env.PORT | config.SOCKET_PORT;

//global varible go here
global.hshSocketUser = {};
global.hshUserSocket = {};
global.hshIdSocket = {};
global.hshUserTimeout = {};

global.userCount = 0;
global.userCurrentPlay = {};
// =======================
// configuration =========
// =======================
var configs = require('./helpers/config.js')
var fullsetup = configs.setup(app);

fullsetup.then(() => {
        // API ROUTES -------------------
        // get an instance of the router for api routes
        var apiRoutes = express.Router();

        apiRoutes.use('/', api);

        // apply the routes to our application with the prefix /api
        app.use('/api', apiRoutes);

        // =======================
        // start the server ======
        // =======================
        app.listen(EXPRESSPORT, function(err) {
            console.log('server express listen socketio on ', EXPRESSPORT);
        });

        server.listen(SOCKETIOPRT, function(err) {

            if (err) throw err;
            console.log('server socket io listen socketio on ', SOCKETIOPRT);


            global.io.on('connection', require('./controllers/socket/index.js'));

        });
    })
    .catch((err) => {
        console.log('Error when starting app');
    });