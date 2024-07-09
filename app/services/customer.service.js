const { ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");

class CustomerService {
  constructor(client) {
    this.Customer = client.db().collection("customers");
  }
  extractCustomerData(payload) {
    const customer = {
      email: payload.email,
      password: bcrypt.hashSync(payload.password, 8),
      name: payload.name,
      phone: payload.phone,
      birthday: payload.birth,
      gender: parseInt(payload.gender),
      address: payload.address,
      cart: payload.cart || [],
    };
    Object.keys(customer).forEach(
      (key) => customer[key] === undefined && delete customer[key]
    );
    return customer;
  }

  async signUp(payload) {
    const customer = this.extractCustomerData(payload);
    return await this.Customer.insertOne(customer);
  }

  async signIn(payload) {
    const customer = await this.findByEmail(payload.email);
    if (!customer) return customer;
    const passwordIsValid = bcrypt.compareSync(
      payload.password,
      customer.password
    );
    if (passwordIsValid) return customer;
    return passwordIsValid;
  }

  async addToken(id, token) {
    const result = await this.Customer.updateOne(
      { _id: new ObjectId(id) },
      { $set: { token: token } }
    );
    return result.modifiedCount > 0;
  }

  async deleteToken(id, token) {
    const result = await this.Customer.updateOne(
      { _id: new ObjectId(id), token: token },
      { $unset: { token: 1 } }
    );
    return result.modifiedCount > 0;
  }

  async findByEmail(email) {
    return await this.Customer.findOne({ email: email });
  }

  async findById(id) {
    return await this.Customer.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async findByName(name) {
    return await this.find({
      name: { $regex: new RegExp(name), $options: "i" },
    });
  }

  async find(filter) {
    const cursor = await this.Customer.find(filter);
    return await cursor.toArray();
  }

  async changePassword(userId, newPassword) {
    try {
      const user = await this.Customer.findOne({
        _id: ObjectId.isValid(userId) ? new ObjectId(userId) : null,
      });

      if (!user) {
        throw new Error("Người dùng không tồn tại");
      }
      const hashPassword = bcrypt.hashSync(newPassword, 10);
      const result = await this.Customer.findOneAndUpdate(
        { _id: user._id },
        { $set: { password: hashPassword } },
        { returnDocument: "after" }
      );
      return result;
    } catch (error) {
      throw new Error("Không thể thay đổi mật khẩu: " + error.message);
    }
  }

  async update(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };

    const update = {
      name: payload.name,
      phone: payload.phone,
      address: payload.address,
    };

    const result = await this.Customer.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );

    return result;
  }

  /************* Customer Cart ***********/
  async extractCartData(payload) {
    const cart = {
      product_id: payload._id,
      name: payload.name,
      description: payload.description,
      image: payload.image,
      price: parseInt(payload.price),
      quantity_sale: parseInt(payload.quantity_sale),
      category_id: payload.category_id,
      subtotal: payload.quantity_sale * payload.price,
    };

    Object.keys(cart).forEach(
      (key) => cart[key] === undefined && delete cart[key]
    );
    return cart;
  }

  async addToCart(customerId, payload) {
    const cart = await this.extractCartData(payload);
    const existingProduct = await this.Customer.findOne({
      _id: new ObjectId(customerId),
      "cart.product_id": payload._id,
    });
    if (existingProduct) {
      const existingCartItem = existingProduct.cart.find(
        (item) => item.product_id === payload._id
      );
      const newQuantity = existingCartItem.quantity_sale + cart.quantity_sale;
      const newSubtotal = newQuantity * existingCartItem.price;

      const result = await this.Customer.updateOne(
        { _id: new ObjectId(customerId), "cart.product_id": payload._id },
        {
          $set: {
            "cart.$.quantity_sale": newQuantity,
            "cart.$.subtotal": newSubtotal,
          },
        }
      );
      return result.modifiedCount > 0;
    } else {
      const result = await this.Customer.updateOne(
        { _id: new ObjectId(customerId) },
        { $push: { cart: cart } }
      );
      return result.modifiedCount > 0;
    }
  }

  async updateProductQuantityFromCart(customerId, product_id, quantity_sale) {
    const product = await this.Customer.findOne({
      _id: new ObjectId(customerId),
      "cart.product_id": product_id,
    });

    const subtotal = product.cart[0].price * quantity;

    const result = await this.Customer.updateOne(
      { _id: new ObjectId(customerId), "cart.product_id": product_id },
      {
        $set: {
          "cart.$.quantity_sale": quantity_sale,
          "cart.$.subtotal": subtotal,
        },
      }
    );
    return result.modifiedCount > 0;
  }

  async deleteProductFromCart(customerId, product_id) {
    const result = await this.Customer.updateOne(
      { _id: new ObjectId(customerId) },
      { $pull: { cart: { product_id } } }
    );
    return result.modifiedCount > 0;
  }

  async deleteAllProductsFromCart(customerId) {
    const result = await this.Customer.updateOne(
      { _id: new ObjectId(customerId) },
      { $set: { cart: [] } }
    );

    console.log(result.modifiedCount);
    return result.modifiedCount > 0;
  }

}

module.exports = CustomerService;
