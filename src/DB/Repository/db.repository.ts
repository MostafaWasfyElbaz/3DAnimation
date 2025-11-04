import {
  CreateOptions,
  DeleteResult,
  FilterQuery,
  FlattenMaps,
  HydratedDocument,
  Model,
  PipelineStage,
  ProjectionType,
  QueryOptions,
  Types,
  UpdateQuery,
  UpdateResult,
} from "mongoose";

export default abstract class DBRepository<T> {
  constructor(protected readonly model: Model<T>) {}
  findOne = async ({
    filter,
    projection,
    options,
  }: {
    filter: FilterQuery<T>;
    projection?: ProjectionType<T>;
    options?: QueryOptions<T>;
  }): Promise<
    FlattenMaps<HydratedDocument<T>> | HydratedDocument<T> | null
  > => {
    const query = this.model.findOne(filter, projection, options);
    if (options?.lean) {
      query.lean();
    }
    const doc = await query.exec();
    return doc;
  };

  findById = async ({
    id,
    projection,
    options,
  }: {
    id: Types.ObjectId | string;
    projection?: ProjectionType<T>;
    options?: QueryOptions<T>;
  }): Promise<
    FlattenMaps<HydratedDocument<T>> | HydratedDocument<T> | null
  > => {
    const query = this.model.findById(id, projection, options);
    if (options?.lean) {
      query.lean();
    }
    const doc = await query.exec();
    return doc;
  };

  find = async ({
    filter,
    projection,
    options,
  }: {
    filter: FilterQuery<T>;
    projection?: ProjectionType<T>;
    options?: QueryOptions<T>;
  }): Promise<
    FlattenMaps<HydratedDocument<T>>[] | HydratedDocument<T>[] | null
  > => {
    const query = this.model.find(filter, projection, options);
    if (options?.lean) {
      query.lean();
    }
    const doc = await query.exec();
    return doc;
  };

  create = async ({
    data,
    options,
  }: {
    data: Partial<HydratedDocument<T>>[];
    options?: CreateOptions;
  }): Promise<T[]> => {
    return this.model.create(data, options);
  };

  updateMany = async ({
    filter,
    options,
    data,
  }: {
    filter: FilterQuery<T>;
    options?: Record<string, any>;
    data: Partial<HydratedDocument<T>>;
  }): Promise<UpdateResult> => {
    const result = await this.model.updateMany(filter, data, options);
    return result;
  };

  updateOne = async ({
    filter,
    options,
    data,
  }: {
    filter: FilterQuery<T>;
    options?: Record<string, any>;
    data: UpdateQuery<T>;
  }): Promise<UpdateResult> => {
    const result = await this.model.updateOne(filter, data, options);
    return result;
  };

  aggregate = async ({
    pipeline,
    options,
  }: {
    pipeline: PipelineStage[];
    options?: Record<string, any>;
  }): Promise<
    FlattenMaps<HydratedDocument<T>>[] | HydratedDocument<T>[] | null
  > => {
    const doc = this.model.aggregate(pipeline, options);
    return doc;
  };

  deleteOne = async ({
    filter,
    options,
  }: {
    filter: FilterQuery<T>;
    options?: Record<string, any>;
  }): Promise<DeleteResult> => {
    const result = await this.model.deleteOne(filter, options);
    return result;
  };

  deleteMany = async ({
    filter,
    options,
  }: {
    filter: FilterQuery<T>;
    options?: Record<string, any>;
  }): Promise<DeleteResult> => {
    const result = await this.model.deleteMany(filter, options);
    return result;
  };
}
