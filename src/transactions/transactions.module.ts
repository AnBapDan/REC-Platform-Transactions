import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { AccountService } from './prisma/accounts.service';
import { PrismaService } from './prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports:[ConfigModule.forRoot({
    envFilePath: '/run/secrets/.env',
  })],
  controllers: [TransactionsController],
  providers: [TransactionsService, AccountService, PrismaService]
})
export class TransactionsModule {}
