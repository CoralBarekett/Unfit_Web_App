import express, {Express} from 'express';
const app = express();
import dotenv from 'dotenv';
dotenv.config();
import bodyParser  from 'body-parser';
import mongoose from 'mongoose';
import postsRoutes from './routes/postsRoutes';
import commentsRoutes from './routes/commentsRoutes';
import authRoutes from './routes/authRoutes';


const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to database'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/posts', postsRoutes);
app.use('/comments', commentsRoutes);
app.use('/auth', authRoutes);

const initApp = () => {
    return new Promise<Express>(async (resolve, reject) => {
        if (process.env.DB_CONNECT === undefined) {
            console.error('DB_CONNECT is not defined in .env file');
            reject();
        }else{
        await mongoose.connect(process.env.DB_CONNECT,);
        resolve(app);
        }
    });
};

export default initApp;