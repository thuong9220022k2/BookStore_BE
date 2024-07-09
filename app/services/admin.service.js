const { ObjectId } = require("mongodb");
const bcrypt = require('bcryptjs');

class AdminService {
    constructor(client) {
        this.Admin = client.db().collection("admin");
    }

    extractAdminData(payload) {
        const admin = {
            username: payload.username,
            password: bcrypt.hashSync(payload.password, 8),
            name: payload.name,
            phone: payload.phone,
            address: payload.address,
            role: payload.role,
        }
        Object.keys(admin).forEach(
            (key) => admin[key] === undefined && delete admin[key]
        );
        return admin;
    }

    async signUp(payload) {
        const admin = this.extractAdminData(payload);
        return await this.Admin.insertOne(admin);
    }

    async findByUsername(username) {
        return await this.Admin.findOne({ username: username });
    }

    async find(filter) {
        const cursor = await this.Admin.find(filter);
        return await cursor.toArray();
    }

    async signIn(payload) {
        const admin = await this.findByUsername(payload.username);
        if (!admin)
            return admin;
        const passwordIsValid = bcrypt.compareSync(payload.password, admin.password);
        if (passwordIsValid)
            return admin;
        return passwordIsValid;
    }

    async update(id, payload) {
        console.log(id)
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };

        const update = {
            isLocked: payload.isLocked,
        };

        const result = await this.Admin.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );

        return result;
    }

    async addToken(id, token) {
        const result = await this.Admin.updateOne(
            { _id: new ObjectId(id) },
            { $set: { token: token } }
        );
        return result.modifiedCount > 0;
    }

    async deleteToken(id, token) {
        const result = await this.Admin.updateOne(
            { _id: new ObjectId(id), token: token },
            { $unset: { token: 1 } }
        );
        return result.modifiedCount > 0;
    }
}

module.exports = AdminService;