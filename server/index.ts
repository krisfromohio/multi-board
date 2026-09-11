import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { migrateDatabase, openDatabase } from './db.js';

const host = '127.0.0.1';
const port = Number(process.env.PORT ?? 4173);
const db = openDatabase();
migrateDatabase(db);

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL ?? 'info',
    redact: ['req.headers.authorization', 'req.headers.cookie'],
  },
});

app.addHook('onSend', async (_request, reply, payload) => {
  reply.header('X-Content-Type-Options', 'nosniff');
  reply.header('Referrer-Policy', 'no-referrer');
  reply.header('Content-Security-Policy', "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'");
  return payload;
});

app.get('/api/health', async () => ({
  status: 'ok',
  node: process.version,
  persistence: 'node:sqlite',
}));

const webRoot = resolve('dist');
if (existsSync(webRoot)) {
  await app.register(fastifyStatic, {
    root: webRoot,
    wildcard: false,
  });

  app.setNotFoundHandler((request, reply) => {
    if (request.url.startsWith('/api/')) {
      return reply.code(404).send({ error: 'Not found' });
    }
    return reply.sendFile('index.html');
  });
}

await app.listen({ host, port });
