const CategoryService = require("../services/category.service");
const ProductService = require("../services/product.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

//Thêm danh mục
exports.create = async (req, res, next) => {
    if (!req.body?.name)
        return next(new ApiError(400, "Tên danh mục không được để trống"));

    try {
        const categoryService = new CategoryService(MongoDB.client);
        const document = await categoryService.create(req.body);
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while creating the category")
        );
    }
};

//Lấy toàn bộ danh mục
exports.findAll = async (req, res, next) => {
    let documents = [];
    try {
        const categoryService = new CategoryService(MongoDB.client);
        const { name } = req.query;
        if (name)
            documents = await categoryService.findByName(name);
        else
            documents = await categoryService.find({});
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while retrieving categories")
        );
    }
    return res.send(documents);
};

//Tìm kiếm danh mục theo id
exports.findOne = async (req, res, next) => {
    try {
        const categoryService = new CategoryService(MongoDB.client);
        const document = await categoryService.findById(req.params.id);
        if (!document)
            return next(new ApiError(404, "Category not found"));
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(500, `Error retrieving category with id=${req.params.id}`)
        );
    }
};

//Cập nhật danh mục
exports.update = async (req, res, next) => {
    if (Object.keys(req.body).length === 0)
        return next(new ApiError(400, "Data to update can not be empty"));

    try {
        const categoryService = new CategoryService(MongoDB.client);
        const document = await categoryService.update(req.params.id, req.body);
        if (!document)
            return next(new ApiError(404, "Category not found"));
        return res.send({ message: "Category was updated successfully" });
    } catch (error) {
        return next(
            new ApiError(500, `Error updating category with id=${req.params.id}`)
        );
    }
};

//Xóa danh mục ràng buộc sản phẩm
exports.delete = async (req, res, next) => {
    try {
        const categoryService = new CategoryService(MongoDB.client);
        const productService = new ProductService(MongoDB.client);
        // console.log(1);
        const findProductByCategoryId = await productService.findProductByCategoryId(req.params.id);

        if (findProductByCategoryId.length > 0) {
            return res.send({ message: "Category cannot be deleted" });
        } else {
            const document = await categoryService.delete(req.params.id);
            if (!document) {
                return next(new ApiError(404, "Category not found"));
            }
            return res.send({ message: "Category was deleted successfully" });
        }
    } catch (error) {
        return next(new ApiError(500, `Could not delete category with id=${req.params.id}`));
    }
};
