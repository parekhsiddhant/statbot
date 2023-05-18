exports.successResponse = function (res: any, msg: any) {
  const data = {
    success: true,
    message: msg,
  };
  return res.status(200).json(data);
};

exports.successResponseWithData = function (res: any, msg: any, data: any) {
  const resData = {
    success: true,
    message: msg,
    data: data,
  };
  return res.status(200).json(resData);
};

exports.ErrorResponse = function (res: any, msg: any) {
  const data = {
    success: false,
    message: msg,
  };
  return res.status(500).json(data);
};

exports.notFoundResponse = function (res: any, msg: any) {
  const data = {
    success: false,
    message: msg,
  };
  return res.status(404).json(data);
};

exports.validationErrorWithData = function (res: any, msg: any, data: any) {
  const resData = {
    success: false,
    message: msg,
    data: data,
  };
  return res.status(400).json(resData);
};

exports.unauthorizedResponse = function (res: any, msg: any) {
  const data = {
    success: false,
    message: msg,
  };
  return res.status(401).json(data);
};

exports.forbiddenResponse = function (res: any, msg: any) {
  const data = {
    success: false,
    message: msg,
  };
  return res.status(403).json(data);
};
