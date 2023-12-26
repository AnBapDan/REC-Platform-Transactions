
import { Injectable } from '@nestjs/common';
import { Accounts, Prisma } from '@prisma/client';
import { PrismaService } from 'src/transactions/prisma/prisma.service';

@Injectable()
export class AccountService {
  constructor(private prisma: PrismaService) {}

  async account(
    accountsWhereUniqueInput: Prisma.AccountsWhereUniqueInput,
  ): Promise<Accounts | null> {
    return this.prisma.accounts.findUnique({
      where: accountsWhereUniqueInput,
    });
  }

  async accounts(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.AccountsWhereUniqueInput;
    where?: Prisma.AccountsWhereInput;
    orderBy?: Prisma.AccountsOrderByWithRelationInput;
  }): Promise<Accounts[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.accounts.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createAccounts(data: Prisma.AccountsCreateInput): Promise<Accounts> {
    return this.prisma.accounts.create({
      data,
    });
  }

  async updateAccounts(params: {
    where: Prisma.AccountsWhereUniqueInput;
    data: Prisma.AccountsUpdateInput;
  }): Promise<Accounts> {
    const { where, data } = params;
    return this.prisma.accounts.update({
      data,
      where,
    });
  }

  // async deleteAccounts(where: Prisma.AccountsWhereUniqueInput): Promise<Accounts> {
  //   return this.prisma.accounts.delete({
  //     where,
  //   });
  // }
}