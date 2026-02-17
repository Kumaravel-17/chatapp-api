const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/dbconnect');
const bodyParser = require('body-parser');


dotenv.config();
const port = process.env.PORT || 8000;

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
    origin: 'http://localhost:8000',
    credentials: true,
}));

//routes
const authRoute = require('./routes/authRoute');
app.use('/api/auth', authRoute);



connectDB();
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
