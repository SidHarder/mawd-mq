import dotenv from 'dotenv'
import jayson from 'jayson';

import distributionRouter from './distribution_router.js';

dotenv.config();

const apiMethodMap = {
  submitDistribution: distributionRouter.submitJob
}

const server = jayson.server(apiMethodMap);

await server.http().listen(process.env.APP_PORT);
console.log(`*********** Server is listening on port: ${process.env.APP_PORT}`);

