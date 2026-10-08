import 'reflect-metadata';
import { Body, Controller, Get, Module, Post, BadRequestException, PipeTransform, Injectable } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Order, PORT, summarize } from './schema.js';

@Injectable()
class ZodPipe implements PipeTransform {
  transform(value: unknown) {
    const r = Order.safeParse(value);
    if (!r.success) throw new BadRequestException(r.error.issues);
    return r.data;
  }
}

@Controller()
class AppController {
  @Get() hello() { return { hello: 'world' }; }
  @Post('orders') create(@Body(new ZodPipe()) body: any) { return summarize(body); }
}

@Module({ controllers: [AppController] })
class AppModule {}

const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), { logger: false });
await app.listen(PORT, '127.0.0.1');
