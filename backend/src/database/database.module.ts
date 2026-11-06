import { Global, Injectable, Module, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { Mailer } from '../common/mailer';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() { super({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) }); }
  async onModuleDestroy() { await this.$disconnect(); }
}
@Global()
@Module({ providers: [PrismaService, Mailer], exports: [PrismaService, Mailer] })
export class DbModule {}
