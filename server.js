const {server} = require('./app');
const port = process.env.PORT || 8001;
server.listen(3000, () => {
    console.log(`Server is running on port ${port}`);
});
