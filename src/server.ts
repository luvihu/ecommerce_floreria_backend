import express from 'express';
import compression from "compression";
import router from './routes/index';
import errorHandler from './middlewares/errorHandler';
import morgan from 'morgan';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(compression());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(router);
app.use(errorHandler);

export default app;



