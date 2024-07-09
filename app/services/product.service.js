const { ObjectId } = require("mongodb");

class ProductService {
  constructor(client) {
    this.Product = client.db().collection("products");
  }

  extractProductData(payload) {
    // Chuyển string thành ObjectId
    payload.category_id = new ObjectId(payload.category_id);
    const product = {
      title: payload.title,
      description: payload.description,
      price: parseInt(payload.price),
      image: payload.image !== undefined ? payload.image : undefined,
      quantity: parseInt(payload.quantity),
      //   ratings: 0, 
      reviews: [],
      quantity_sale: payload.quantity_sale ? payload.quantity_sale : 0,
      quantity_remain:
        parseInt(payload.quantity) - (payload.quantity_sale || 0),
      author: payload.author,
      publisher: payload.publisher,
      category_id: payload.category_id,
    };
    Object.keys(product).forEach(
      (key) => product[key] === undefined && delete product[key]
    );
    return product;
  }

  async create(payload) {
    console.log("payload", payload)
    const product = this.extractProductData(payload);
    product.created_at = new Date().toLocaleString();
    product.updated_at = new Date().toLocaleString();
    return await this.Product.insertOne(product);
  }

  async find(filter) {
    const cursor = await this.Product.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "category_id",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          price: 1,
          image: 1,
          quantity: 1,
          quantity_sale: 1,
          quantity_remain: 1,
          author: 1,
          publisher: 1,
          category: 1,
          created_at: 1,
          updated_at: 1,
        },
      },
      {
        $match: filter,
      },
    ]);
    return await cursor.toArray();
  }

  async findNew(filter = {}) {
    const cursor = await this.Product.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "category_id",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          price: 1,
          image: 1,
          quantity: 1,
          quantity_sale: 1,
          quantity_remain: 1,
          author: 1,
          publisher: 1,
          category: 1, // Lấy tên của category
          created_at: 1,
          updated_at: 1,
        },
      },
      {
        $match: filter,
      },
      {
        $sort: { created_at: -1 },
      },
      {
        $limit: 10,
      },
    ]);
    return await cursor.toArray();
  }

  async findById(id) {
    return await this.Product.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async update(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };

    const update = {
      name: payload.name,
      description: payload.description,
      price: payload.price,
      // image: payload.image,
      quantity: parseInt(payload.quantity),
      quantity_remain: parseInt(payload.quantity),
      category_id: new ObjectId(payload.category_id), // Chuyển đổi category_id sang ObjectId
      updated_at: new Date().toLocaleString(),
    };
    if (payload.image) {
      update.image = payload.image
    }
    const result = await this.Product.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );

    return result;
  }

  async delete(id) {
    const result = await this.Product.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result;
  }

  async deleteAll() {
    const result = await this.Product.deleteMany({});
    return result.deletedCount;
  }

  async findProductByCategoryId(categoryId) {
    const filter = {
      category_id: new ObjectId(categoryId),
    };
    const cursor = await this.Product.find(filter);
    return await cursor.toArray();
  }

  async getReviewProduct(product_id) {
    const product = await this.Product.findOne({
      _id: ObjectId.isValid(product_id) ? new ObjectId(product_id) : null,
    });
    console.log("product review", product.reviews)
    return product.reviews;
  }

  async addReviewProduct(product_id, payload) {
    console.log("product_id", product_id)
    const product = await this.Product.findOne({
      _id: ObjectId.isValid(product_id) ? new ObjectId(product_id) : null,
    });
    if (!product.reviews) {
      console.log("da chay den day")
      product.reviews = [];
    }
    product.reviews.push(payload)
    await this.Product.updateOne({ _id: new ObjectId(product_id) }, { $set: { reviews: product.reviews } })
    return product
  }

}

module.exports = ProductService;
