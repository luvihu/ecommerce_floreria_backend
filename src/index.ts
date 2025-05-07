import app from './server';
import "reflect-metadata";
import { AppDataSource } from './config/database';
const PORT = process.env.PORT;

const startApp = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');
    app.listen(PORT, () => {
      console.log('Server is running on port', PORT);
    });
  } catch (error) {
    console.error('Error connecting to the database:', error);
    process.exit(1)
  }
};
startApp();