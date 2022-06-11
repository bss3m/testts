import { FastifyReply, FastifyRequest } from 'fastify';

export const testFunction = async (request : FastifyRequest, reply : FastifyReply) => {
    console.log('test');
    reply.send({test: 'test'});
}