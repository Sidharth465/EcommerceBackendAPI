import app from './app';
import config from './configs/index';
import { sequelize } from './configs/database';
import { initModels } from './models';

async function start() {
  try {
    await sequelize.authenticate();
    initModels(sequelize);
    await sequelize.sync({ force: false, alter: false });
    // eslint-disable-next-line no-console
    console.log(`Database connected (${config.nodeEnv})`);
    app.listen(config.port, () => {
      // eslint-disable-next-line no-console
      console.log(`Server listening on port ${config.port} (${config.nodeEnv})`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to connect to the database:', error);
    process.exit(1);
  }
}

start();

process.on('unhandledRejection', (reason) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  // eslint-disable-next-line no-console
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
