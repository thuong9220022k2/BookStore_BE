const config = {
    app: {
        port: process.env.PORT || 3000,
    },
    db: {
        uri: process.env.MONGODB_URI || "mongodb+srv://thuong922002:xqWxPgro4yJ00Nzp@cluster0.kmov7py.mongodb.net/BookStore"
    }
};
module.exports = config;