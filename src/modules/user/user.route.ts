import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import * as userController from './user.controller'

const userRoutes = async (api: FastifyInstance) => {

    api.route({
        method: 'GET',
        url:  '/test',
        schema: {},
        handler: userController.testFunction
    });
}

export default userRoutes;