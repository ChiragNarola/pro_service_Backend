import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class GenericRepo<
  T,
  Delegate extends {
    findMany: any;
    findFirst: any;
    create: any;
    update: any;
    updateMany: any;
    delete: any;
  },
  WhereInput = any,
  WhereUniqueInput = any,
  Select = any,
  Include = any,
  CreateInput = any,
  UpdateInput = any,
  UpdateManyInput = any,
  OrderByInput = any
> {
  private model: Delegate;

  constructor(model: Delegate) {
    this.model = model;
  }

  async findAll(
    filter: WhereInput = {} as WhereInput,
    orderBy?: OrderByInput
  ): Promise<T[]> {
    return this.model.findMany({ where: filter, orderBy });
  }

  async findMany(
    filter: WhereInput = {} as WhereInput,
    select?: Select
  ): Promise<T[]> {
    return this.model.findMany({ where: filter, select });
  }

  async findFirst<K extends object = {}>(
    filter: WhereInput,
    include?: Include
  ): Promise<(T & K) | null> {
    return this.model.findFirst({
      where: filter,
      include,
    });
  }

  async findSelectedOne<K extends object = {}>(
    filter: WhereInput,
    select: Select
  ): Promise<(T & K) | null> {
    return this.model.findFirst({
      where: filter,
      select,
    });
  }

  async create(data: CreateInput): Promise<T> {
    return this.model.create({ data });
  }

  async update(
    where: WhereUniqueInput,
    data: UpdateInput
  ): Promise<T> {
    return this.model.update({ where, data });
  }

  async updateMany(
    where: WhereInput,
    data: UpdateManyInput
  ): Promise<{ count: number }> {
    return this.model.updateMany({ where, data });
  }

  async delete(where: WhereUniqueInput): Promise<T> {
    return this.model.delete({ where });
  }
}
