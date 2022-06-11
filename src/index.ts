import 'dotenv/config';

import fastify from 'fastify';
import userRoutes from './modules/user/user.route';
import swaggerConfig from './swagger.config.json'; // Cannot use this since that's a fastify bug
import fastifySwagger from '@fastify/swagger';
import { FastifyRequest, FastifyReply } from 'fastify';

/*
*   Logging level
*/
const api = fastify({ logger: { level: 'warn' } });

/*
*   Plugins setup
*/
console.log(swaggerConfig);
api.register(fastifySwagger, swaggerConfig)
//   mode: 'dynamic',
//   exposeRoute: true,
//   uiConfig: {},
//   routePrefix: '/doc',
//   swagger: {
//     info: {
//         title: "OATREA",
//         description: "Undefined yet",
//         version: "0.1.0"
//     },
//     host: 'localhost',
//     schemes: ['https'],
//     consumes: ['application/json'],
//     produces: ['application/json']
//   }
// });

/*
*   Security Headers
*/
api.addHook('preHandler', (_request: FastifyRequest, reply: FastifyReply, done) => {
  reply.header('X-Frame-Options', 'deny')
  reply.header('X-Content-Type-Options', 'nosniff');
  reply.header('X-XSS-Protection', '1; mode=block');
  reply.header('Strict-Transport-Security', 'max-age=31536000');
  reply.header('Content-Security-Policy', 'default-src: \'self\';')
  reply.header('Permissions-Policy', 'battery=(), camera=(), geolocation=(), microphone=()')
  done();
})

/*
*   Routing
*/
api.register(userRoutes, { prefix: "user" });

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
              status: { type: 'string' },
              timestamp: { type: 'number' }
            }
          }
        }
      },
      handler: (_request: FastifyRequest, reply: FastifyReply) => {
        reply.send({ 
          status: 'alive',
           timestamp: new Date().valueOf() 
        });
      }
  });
})

/*
*   Run the API
*/
const port: (number | undefined) = parseInt(process.env.PORT || '') || 1337; 

api.listen({ port: port, host: '0.0.0.0'},
  (err: (Error | null), address: string) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    console.log('API started (' + address + ')')
})