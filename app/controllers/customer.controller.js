const jwt = require("jsonwebtoken");
const jwtSecret = "mysecretkey";
const bcrypt = require("bcryptjs");
// const request = require('request');
const moment = require('moment');
const CustomerService = require("../services/customer.service");
// const MomoService = require("../services/momo.service")

// import dateFormat from 'dateformat';
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

//Đăng ký
exports.signUp = async (req, res, next) => {
  if (!req.body.email) return next(new ApiError(400, "Email are required"));
  if (!req.body.password)
    return next(new ApiError(400, "Password are required"));
  if (!req.body.name) return next(new ApiError(400, "Name are required"));
  if (!req.body.phone) return next(new ApiError(400, "Phone are required"));
  if (!req.body.birth) return next(new ApiError(400, "Birth are required"));
  if (!req.body.gender) return next(new ApiError(400, "Gender are required"));
  if (!req.body.address) return next(new ApiError(400, "Address are required"));
  try {
    const customerService = new CustomerService(MongoDB.client);
    const existingCustomer = await customerService.findByEmail(req.body.email);
    if (existingCustomer)
      return next(new ApiError(400, "Email is already taken"));
    const customer = await customerService.signUp(req.body);
    if (customer) return res.send({ message: "Signup successfully" });
  } catch (error) {
    return next(new ApiError(500, "An error occurred while signing up"));
  }
};

//Đăng nhập
exports.signIn = async (req, res, next) => {
  if (!req.body.email) return next(new ApiError(400, "Email are required"));
  if (!req.body.password)
    return next(new ApiError(400, "Password are required"));

  try {
    const customerService = new CustomerService(MongoDB.client);
    const customer = await customerService.signIn(req.body);
    if (!customer) return next(new ApiError(401, "Invalid email or password"));
    //Mã hoá id bằng jwtSecret thành token trong 24h
    const token = jwt.sign({ id: customer._id }, jwtSecret, {
      expiresIn: 86400, //24h
    });
    //Thêm token vào CSDL
    await customerService.addToken(customer._id, token);
    res.setHeader("Authorization", "Bearer " + token);
    return res.send({
      message: "Signin successfully",
      token: token,
      customer: customer,
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
    const customerService = new CustomerService(MongoDB.client);
    //Xoá token
    await customerService.deleteToken(decodedToken.id, token);

    return res.send({ message: "Signout successfully" });
  } catch (error) {
    return next(new ApiError(500, "An error occurred while signing out"));
  }
};

//
exports.findAll = async (req, res, next) => {
  let documents = [];

  try {
    const customerService = new CustomerService(MongoDB.client);
    const { email } = req.query;
    if (email) documents = await customerService.findByEmail(email);
    else documents = await customerService.find({});
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while retrieving customers")
    );
  }
  return res.send(documents);
};

exports.findAllCarts = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next(new ApiError(401, "Unauthorized"));
    }
    const token = authHeader.split(" ")[1];
    const decodedToken = jwt.decode(token);

    const customerService = new CustomerService(MongoDB.client);
    const document = await customerService.findById(decodedToken.id);
    if (!document) return next(new ApiError(404, "Customer not found"));
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, `Error retrieving customer with id=${req.params.id}`)
    );
  }
};

exports.findId = async (req, res, next) => {
  try {
    const customerService = new CustomerService(MongoDB.client);
    const document = await customerService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy tài khoản"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, `Error retrieving user with email = ${req.params.id}`)
    );
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    if (!req.body?.currentPassword) {
      return next(new ApiError(400, "Vui lòng nhập mật khẩu hiện tại."));
    }
    if (!req.body?.newPassword) {
      return next(new ApiError(400, "Mật khẩu mới không được để trống."));
    }

    const userId = req.params.id;
    const currentPassword = req.body.currentPassword;
    const customerService = new CustomerService(MongoDB.client);
    const user = await customerService.findById(userId);

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      return next(new ApiError(400, "Mật khẩu hiện tại không đúng."));
    }
    const newPassword = req.body.newPassword;
    const updatedUser = await customerService.changePassword(userId, newPassword);
    if (!updatedUser) {
      return next(new ApiError(500, "Không thể thay đổi mật khẩu."));
    }
    return res.send("Mật khẩu đã được thay đổi thành công.");
  } catch (error) {
    return next(
      new ApiError(
        500,
        "An error occurred while changing the password: " + error.message
      )
    );
  }
};

exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0)
    return next(new ApiError(400, "Data to update can not be empty"));
  console.log(req.file);
  try {
    const customerService = new CustomerService(MongoDB.client);
    const updatedUser = await customerService.update(req.params.id, {
      ...req.body,
    });
    return res.send({ message: "Customer was updated successfully", data: updatedUser });
  } catch (error) {
    return next(
      new ApiError(500, `Error updating product with id=${req.params.id}`)
    );
  }
};

// ************************ Customer Cart ************************** //

exports.addToCart = async (req, res, next) => {
  try {
    const customerService = new CustomerService(MongoDB.client);

    const authHeader = req.headers.authorization;
    if (!authHeader) return next(new ApiError(401, "Unauthorized"));
    const token = authHeader.split(" ")[1];
    const decodedToken = jwt.decode(token);

    console.log(decodedToken.id);
    console.log(req.body);

    const customer = await customerService.findById(decodedToken.id);

    if (!customer) {
      return next(new ApiError(404, "Customer not found"));
    }

    await customerService.addToCart(decodedToken.id, req.body);
    const user = await customerService.findById(decodedToken.id);
    return res.send({
      message: "Add products to customer successfully",
      user: user,
    });
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while adding products to customer")
    );
  }
};

exports.deleteProductFromCart = async (req, res, next) => {
  try {
    const customerService = new CustomerService(MongoDB.client);
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next(new ApiError(401, "Unauthorized"));
    }
    const token = authHeader.split(" ")[1];
    const decodedToken = jwt.decode(token);
    const customerId = decodedToken.id;
    const customer = await customerService.findById(customerId);
    if (!customer) {
      return next(new ApiError(404, "Customer not found"));
    }
    await customerService.deleteProductFromCart(customerId, req.params.id);
    const user = await customerService.findById(customerId);
    return res.send({
      message: "Product was removed from cart successfully",
      user: user,
    });
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Could not delete product with id=${req.params.id} from cart`
      )
    );
  }
};

exports.deleteAllProductsFromCart = async (req, res, next) => {
  try {
    const customerService = new CustomerService(MongoDB.client);
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next(new ApiError(401, "Unauthorized"));
    }
    const token = authHeader.split(" ")[1];
    const decodedToken = jwt.decode(token);
    const customerId = decodedToken.id;
    const customer = await customerService.findById(customerId);
    if (!customer) {
      return next(new ApiError(404, "Customer not found"));
    }
    await customerService.deleteAllProductsFromCart(decodedToken.id);
    const user = await customerService.findById(customerId);
    return res.send({
      message: "Product was removed from cart successfully",
      user: user,
    });
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Could not delete product with id=${req.body.product_id} from cart`
      )
    );
  }
};

exports.updateProductQuantityFromCart = async (req, res, next) => {
  try {
    const customerService = new CustomerService(MongoDB.client);
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next(new ApiError(401, "Unauthorized"));
    }
    const token = authHeader.split(" ")[1];
    const decodedToken = jwt.decode(token);
    const customerId = decodedToken.id;
    const customer = await customerService.findById(customerId);
    if (!customer) {
      return next(new ApiError(404, "Customer not found"));
    }
    if (!req.body.quantity) {
      return next(new ApiError(400, "Quantity can not be empty"));
    }
    await customerService.updateProductQuantityFromCart(
      decodedToken.id,
      req.params.id,
      req.body.quantity
    );
    return res.send({ message: "Product quantity was updated successfully" });
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Could not update product quantity with id=${req.params.product_id}`
      )
    );
  }
};

// exports.paymentMomo = async (req, res, next) => {
//   try {
//     const momoService = new MomoService('klm05TvNBzhg7h7j', 'at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa', 'MOMOBKUN20180259');
//     const orderInfo = 'pay with MoMo';
//     const amount = '50000';
//     const redirectUrl = 'http://localhost:3001/checkout';
//     const ipnUrl = 'http://localhost:3001/checkout/notify';

//     const requestBody = momoService.createPaymentRequest(orderInfo, amount, redirectUrl, ipnUrl);
//     await momoService.sendPaymentRequest(requestBody)
//       .then(response => {
//         console.log(response);
//         return res.send({ message: "Transition Scucess" })
//       })
//       .catch(error => {
//         console.error(error);
//       });
//   } catch {
//     return next(new ApiError(500, "Error when payment"));
//   }
// }


function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

exports.createPaymentUrl = async (req, res, next) => {

  var ipAddr = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

  const dateFormat = await import('dateformat');

  let tmnCode = 'K4DRIB36';
  let secretKey = 'UQFJKHM6IY23PVBKVQ01N4TMB8J84NUA';
  let vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  let returnUrl = 'http://localhost:3001/order';

  var date = new Date();
  console.log("request", req.body)
  var createDate = dateFormat.default(date, 'yyyymmddHHmmss');
  console.log("createDate", createDate)
  var orderId = dateFormat.default(date, 'HHmmss');
  console.log("orderId", orderId)
  var amount = req.body.amount;
  var bankCode = req.body.bankCode;
  console.log("amount , bankcode", amount, bankCode)
  var locale = 'vn';
  if (locale === null || locale === '') {
    locale = 'vn';
  }
  var currCode = 'VND';
  var vnp_Params = {};
  vnp_Params['vnp_Version'] = '2.1.0';
  vnp_Params['vnp_Command'] = 'pay';
  vnp_Params['vnp_TmnCode'] = tmnCode;
  vnp_Params['vnp_Locale'] = locale;
  vnp_Params['vnp_CurrCode'] = currCode;
  vnp_Params['vnp_TxnRef'] = orderId;
  vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId;;
  vnp_Params['vnp_OrderType'] = 'other';
  vnp_Params['vnp_Amount'] = amount * 100;
  vnp_Params['vnp_ReturnUrl'] = returnUrl;
  vnp_Params['vnp_IpAddr'] = ipAddr;
  vnp_Params['vnp_CreateDate'] = createDate;
  if (bankCode !== null && bankCode !== '') {
    vnp_Params['vnp_BankCode'] = bankCode;
  }

  vnp_Params = sortObject(vnp_Params);
  console.log("vnpay params", vnp_Params)

  var querystring = require('qs');
  var signData = querystring.stringify(vnp_Params, { encode: false });
  var crypto = require("crypto");
  var hmac = crypto.createHmac("sha512", secretKey);
  var signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");
  vnp_Params['vnp_SecureHash'] = signed;
  vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
  console.log("vnpUrl", vnpUrl)
  // res.redirect(vnpUrl)
  return res.send({ url: vnpUrl })
}



exports.getVnpayIpn = async (req, res, next) => {
  let vnp_Params = req.query;
  console.log("vnp_Param", req.query)
  let secureHash = vnp_Params['vnp_SecureHash'];

  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  vnp_Params = sortObject(vnp_Params);

  // let config = require('config');
  // let tmnCode = config.get('vnp_TmnCode');
  // let secretKey = config.get('vnp_HashSecret');
  let tmnCode = 'K4DRIB36';
  let secretKey = 'UQFJKHM6IY23PVBKVQ01N4TMB8J84NUA';

  let querystring = require('qs');
  let signData = querystring.stringify(vnp_Params, { encode: false });
  let crypto = require("crypto");
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");

  if (secureHash === signed) {
    //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua

    res.render('success', { code: vnp_Params['vnp_ResponseCode'] })
  } else {
    res.render('success', { code: '97' })
  }
}

exports.getVnpayReturn = async (req, res, next) => {
  console.log("request", req)
  let vnp_Params = req.query;
  console.log("vnp_Param", req.query)
  let secureHash = vnp_Params['vnp_SecureHash'];

  let orderId = vnp_Params['vnp_TxnRef'];
  let rspCode = vnp_Params['vnp_ResponseCode'];

  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  vnp_Params = sortObject(vnp_Params);
  // let config = require('config');
  // let secretKey = config.get('vnp_HashSecret');
  let secretKey = 'UQFJKHM6IY23PVBKVQ01N4TMB8J84NUA';
  let querystring = require('qs');
  let signData = querystring.stringify(vnp_Params, { encode: false });
  let crypto = require("crypto");
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");

  let paymentStatus = '0'; // Giả sử '0' là trạng thái khởi tạo giao dịch, chưa có IPN. Trạng thái này được lưu khi yêu cầu thanh toán chuyển hướng sang Cổng thanh toán VNPAY tại đầu khởi tạo đơn hàng.
  //let paymentStatus = '1'; // Giả sử '1' là trạng thái thành công bạn cập nhật sau IPN được gọi và trả kết quả về nó
  //let paymentStatus = '2'; // Giả sử '2' là trạng thái thất bại bạn cập nhật sau IPN được gọi và trả kết quả về nó

  let checkOrderId = true; // Mã đơn hàng "giá trị của vnp_TxnRef" VNPAY phản hồi tồn tại trong CSDL của bạn
  let checkAmount = true; // Kiểm tra số tiền "giá trị của vnp_Amout/100" trùng khớp với số tiền của đơn hàng trong CSDL của bạn
  if (secureHash === signed) { //kiểm tra checksum
    if (checkOrderId) {
      if (checkAmount) {
        if (paymentStatus == "0") { //kiểm tra tình trạng giao dịch trước khi cập nhật tình trạng thanh toán
          if (rspCode == "00") {
            //thanh cong
            //paymentStatus = '1'
            // Ở đây cập nhật trạng thái giao dịch thanh toán thành công vào CSDL của bạn
            res.status(200).json({ RspCode: '00', Message: 'Success' })
          }
          else {
            //that bai
            //paymentStatus = '2'
            // Ở đây cập nhật trạng thái giao dịch thanh toán thất bại vào CSDL của bạn
            res.status(200).json({ RspCode: '00', Message: 'Success' })
          }
        }
        else {
          res.status(200).json({ RspCode: '02', Message: 'This order has been updated to the payment status' })
        }
      }
      else {
        res.status(200).json({ RspCode: '04', Message: 'Amount invalid' })
      }
    }
    else {
      res.status(200).json({ RspCode: '01', Message: 'Order not found' })
    }
  }
  else {
    res.status(200).json({ RspCode: '97', Message: 'Checksum failed' })
  }
}


