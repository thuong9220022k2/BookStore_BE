const jwt = require("jsonwebtoken");
const jwtSecret = "mysecretkey";

const AdminService = require("../services/admin.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

//Đăng ký
exports.signUp = async (req, res, next) => {
  if (!req.body.username)
    return next(new ApiError(400, "Tên đăng nhập không được để trống"));
  if (!req.body.password)
    return next(new ApiError(400, "Mật khẩu không được để trống"));
  if (!req.body.role)
    return next(new ApiError(400, "Chức vụ không được để trống"));
  if (!req.body.name)
    return next(new ApiError(400, "Họ và tên không được để trống"));
  if (!req.body.phone)
    return next(new ApiError(400, "Số điện thoại không được để trống"));
  if (!req.body.address)
    return next(new ApiError(400, "Địa chỉ không được để trống"));

  try {
    const adminService = new AdminService(MongoDB.client);
    const existingAdmin = await adminService.findByUsername(req.body.username);
    if (existingAdmin)
      return next(new ApiError(400, "Tên đăng nhập này đã tồn tại!"));
    const admin = await adminService.signUp(req.body);
    if (admin)
      return res.send({ message: "Đăng ký tài khoản Admin thành công!" });
  } catch (error) {
    return next(new ApiError(500, "An error occurred while signing up"));
  }
};

//Đăng nhập
exports.signIn = async (req, res, next) => {
  if (!req.body.username)
    return next(new ApiError(400, "Tên đăng nhập không được để trống"));
  if (!req.body.password)
    return next(new ApiError(400, "Mật khẩu không được để trống"));
  try {
    const adminService = new AdminService(MongoDB.client);
    const admin = await adminService.signIn(req.body);
    if (!admin)
      return next(new ApiError(401, "Sai tên đăng nhập hoặc mật khẩu"));
    //Mã hoá id bằng jwtSecret thành token trong 24h
    const token = jwt.sign({ id: admin._id }, jwtSecret, {
      expiresIn: 86400, //24h
    });
    //Thêm token vào CSDL
    await adminService.addToken(admin._id, token);

    res.setHeader("Authorization", "Bearer " + token);

    return res.send({
      message: "Đăng nhập vào trang quản trị thành công",
      token: token,
      role: admin.role,
      admin: admin,
    });
  } catch (error) {
    return next(new ApiError(500, "An error occurred while signing in"));
  }
};

//Đăng xuất
exports.signOut = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return next(new ApiError(401, "Unauthorized"));
    const token = authHeader.split(" ")[1];
    const decodedToken = jwt.decode(token);
    const adminService = new AdminService(MongoDB.client);
    //Xoá token
    await adminService.deleteToken(decodedToken.id, token);

    return res.send({ message: "Đăng xuất thành công" });
  } catch (error) {
    return next(new ApiError(500, "An error occurred while signing out"));
  }
};

exports.findAll = async (req, res, next) => {
  let documents = [];

  try {
    const adminService = new AdminService(MongoDB.client);
    const { username } = req.query;
    if (username) documents = await adminService.findByUsername(username);
    else documents = await adminService.find({});
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while retrieving employee")
    );
  }
  return res.send(documents);
};

exports.update = async (req, res, next) => {
  try {
    const adminService = new AdminService(MongoDB.client);
    const admin = await adminService.update(req.params.id, req.body);
    if (!admin) return next(new ApiError(404, "Admin not found"));
    return res.send({ message: "Lock was updated successfully" });
  } catch (error) {
    return next(
      new ApiError(500, `Error updating order with id=${req.params.id}`)
    );
  }
};
