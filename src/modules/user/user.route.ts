import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import * as userController from './user.controller'

const userRoutes = async (api: FastifyInstance) => {

    api.route({
        method: 'GET',
        url:  '/test',
        schema: {
            response: {
                200: {
                  type: 'object',
                  properties: {
                    test: { type: 'string' },
                  }
                }
            }
        },
        handler: userController.testFunction
    });
}

export default userRoutes;