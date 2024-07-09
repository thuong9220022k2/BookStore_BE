const { ObjectId } = require("mongodb");

class CategoryService {
    constructor(client) {
        this.Category = client.db().collection("categories");
    }

    //Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API
    extractCategoryData(payload) {
        const category = {
            name: payload.name,
        };
        // Remove undefined fields
        Object.keys(category).forEach(
            (key) => category[key] === undefined && delete category[key]
        );
        return category;
    }

    async create(payload) {
        const category = this.extractCategoryData(payload);
        category.created_at = new Date().toLocaleString();
        category.updated_at = new Date().toLocaleString();

        return await this.Category.insertOne(category);
    }

    async update(id, payload) {
        console.log(id)
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };

        const update = {
            name: payload.name,
            updated_at: new Date().toLocaleString(),
        };

        const result = await this.Category.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );

        return result;
    }

    async find(filter) {
        const cursor = await this.Category.find(filter);
        return await cursor.toArray();
    }

    async findById(id) {
        return await this.Category.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }

    async delete(id) {
        const result = await this.Category.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result;
    }

    async findByName(name) {
        return await this.find({
            name: { $regex: new RegExp(name), $options: "i" },
        });
    }
}

module.exports = CategoryService;