const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyparser = require('body-parser');
const http = require('http');
const utils = require('./utils/path');
const cors = require('cors');
const fileUpload = require('./routes/fileupload');
const morgan = require('morgan');
const app = express();
const server = http.createServer(app);
const socketIo = require('socket.io');
const admin = require('./routes/admin');
const shop = require('./routes/shop');
const user = require('./routes/users');
const login = require('./routes/login');
const organization = require('./routes/organization');
const menus = require('./routes/menus');
const menuItems = require('./routes/menuItem');
const products = require('./routes/products');
const content = require('./routes/content');
const posts = require('./routes/posts');
const restaurant = require('./routes/restaurant');
const client = require('./routes/client');
const campaign = require('./routes/campaign');
const queueScreen = require('./routes/queueScreen');
const queue = require('./routes/queue');
const bill = require('./routes/billing');
const dummmyProducts = require('./routes/dummyProducts');
const employee = require('./routes/employee');
const department = require('./routes/department');
const bankUser = require('./routes/bankuser');

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} ${res.statusCode}`);
    next();
});
app.use(express.static(path.join(__dirname, 'api', 'public')));
const io = socketIo(server, {
    cors: {
        origin: "*", methods: ["GET", "POST"], pingInterval: 10000, pingTimeout: 5000000
    }
});

app.use(cors());
app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());
app.use('/users', user);
app.use('/admin', admin);
app.use('/org', organization);
app.use('/menus', menus);
app.use('/login', login);
app.use('/menuItem', menuItems);
app.use('/upload', fileUpload);
app.use('/products', products);
app.use('/content', content);
app.use('/posts', posts);
app.use('/restaurant', restaurant);
app.use('/client', client);
app.use('/campaign', campaign);
app.use('/queueScreen', queueScreen);
app.use('/queue', queue);
app.use('/dummmyProducts', dummmyProducts);
app.use('/bill', bill);
app.use('/employee', employee);
app.use('/department', department);
app.use('/bankUser', bankUser);
// app.use('/', shop);


mongoose.connect(process.env.MONGO_DB_URL_CONNECT, {
    useNewUrlParser: true, useUnifiedTopology: true
}).then(async (response) => {
    console.log('Connected')
}).catch(err => console.log('Error'));

app.use(morgan('dev'));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

const bookingNamespace = io.of('/booking');
bookingNamespace.on('connection', (socket) => {
    const rooms = socket.adapter.rooms;
    socket.on('join-room', (roomName) => {
        const room = rooms.get(roomName);
        if (!room) {
            socket.join(roomName);
        }
        socket.join(roomName);
        bookingNamespace.in(roomName).emit('message', 'Success');
    });

    socket.on('disconnect', () => {
        console.log('User Disconnected');
    });
});
// app.listen(8001);

module.exports = {server};
