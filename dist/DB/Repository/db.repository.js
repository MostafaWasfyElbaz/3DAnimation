"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DBRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    findOne = async ({ filter, projection, options, }) => {
        const query = this.model.findOne(filter, projection, options);
        if (options?.lean) {
            query.lean();
        }
        const doc = await query.exec();
        return doc;
    };
    create = async ({ data, options, }) => {
        return this.model.create(data, options);
    };
    findById = async ({ id, projection, options, }) => {
        const doc = this.model.findById(id, projection, options);
        if (options?.lean) {
            doc.lean();
        }
        return doc;
    };
    find = async ({ filter, projection, options, }) => {
        const doc = this.model.find(filter, projection, options);
        if (options?.lean) {
            doc.lean();
        }
        return doc;
    };
    deleteMany = async ({ filter, options, }) => {
        const result = await this.model.deleteMany(filter, options);
        return result;
    };
    updateMany = async ({ filter, options, data, }) => {
        const result = await this.model.updateMany(filter, data, options);
        return result;
    };
    updateOne = async ({ filter, options, data, }) => {
        const result = await this.model.updateOne(filter, data, options);
        return result;
    };
    aggregate = async ({ pipeline, options, }) => {
        const doc = this.model.aggregate(pipeline, options);
        return doc;
    };
}
exports.default = DBRepository;
