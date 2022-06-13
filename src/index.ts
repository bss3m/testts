import 'dotenv/config';

import fastify from 'fastify';
import userRoutes from './modules/user/user.route';
import fastifySwagger from '@fastify/swagger';
//import swaggerConfig from './swagger.config.json';

import { Sequelize } from 'sequelize';
import { FastifyRequest, FastifyReply } from 'fastify';

/*
*   Logging level
*/
const api = fastify({ 
  logger: { level: 'warn' } 
});

/*
*   Database configuration
*/
const db_ip: (string | undefined) = process.env.DB_IP || '';
const db_name: (string | undefined) = process.env.DB_NAME || '';
const db_user: (string | undefined) = process.env.DB_USER || '';
const db_pass: (string | undefined) = process.env.DB_PASS || '';

const sequelize = new Sequelize(db_name, db_user, db_pass, {
  host: db_ip,
  dialect: 'mysql'
});

/*
*   Plugins setup
*/
//console.log(swaggerConfig);
api.register(fastifySwagger, {
  mode: 'dynamic',
  exposeRoute: true,
  uiConfig: {},
  routePrefix: '/swagger',
  swagger: {
    info: {
      title: "OATREA",
      description: "Undefined yet",
      version: "0.1.0"
    },
    host: 'localhost',
    schemes: ['https'],
    consumes: ['application/json'],
    produces: ['application/json']
  }
});

/*
*   Security Headers
*/
api.addHook('preHandler', (_request: FastifyRequest, reply: FastifyReply, done) => {
  reply.header('X-Frame-Options', 'deny');
  reply.header('X-Content-Type-Options', 'nosniff');
  reply.header('X-XSS-Protection', '1; mode=block');
  reply.header('Strict-Transport-Security', 'max-age=31536000');
  reply.header('Content-Security-Policy', 'default-src: \'self\';');
  reply.header('Permissions-Policy', 'battery=(), camera=(), geolocation=(), microphone=()');
  done();
})

/*
*   Routing
*/
api.register(userRoutes, { prefix: 'user' });

// Basic health check
api.register(async () => {
  api.route({
    method: 'GET',
    url:  '/health',
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            api_status: { type: 'string' },
            db_status: { type: 'string' },
            timestamp: { type: 'number' }
          }
        }
      }
    },
    handler: (_request: FastifyRequest, reply: FastifyReply) => {
      sequelize.query('SELECT 1+1 AS result')
      .then(() => {
        reply.send({ 
          api_status: 'alive',
          db_status: 'alive',
          timestamp: new Date().valueOf() 
        });
      })
      .catch(err => {
        console.error(err);
        reply.send({ 
          status: 'alive',
          db_status: 'dead',
          timestamp: new Date().valueOf() 
        });
      })
    }
  });
})

/*
*   Run the API (if database is available)
*/
sequelize.authenticate().then(() => {
  
  const port: (number | undefined) = parseInt(process.env.PORT || '') || 1337; 
  
  api.listen({ port: port, host: '0.0.0.0'},
  (err: (Error | null), address: string) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    else { 
      console.log('API started (' + address + ')') 
    }
  })
  
  api.decorate('sequelize', sequelize);
  api.addHook('onClose', (fastifyInstance, done) => {
    sequelize
    .close()
    .then(() => {
      done();
    })
  });
  
}).catch(err => {
  console.error('Unable to connect to the database :', err);
  console.log('Cancelling API launch.');
});