const successResponse = function (res: any, msg: any) {
  const data = {
    success: true,
    message: msg,
  };
  return res.status(200).json(data);
};
export { successResponse };

const successResponseWithData = function (res: any, msg: any, data: any) {
  const resData = {
    success: true,
    message: msg,
    data: data,
  };
  return res.status(200).json(resData);
};
export { successResponseWithData };

const ErrorResponse = function (res: any, msg: any) {
  const data = {
    success: false,
    message: msg,
  };
  return res.status(500).json(data);
};
export { ErrorResponse };

const notFoundResponse = function (res: any, msg: any) {
  const data = {
    success: false,
    message: msg,
  };
  return res.status(404).json(data);
};
export { notFoundResponse };

const validationErrorWithData = function (res: any, msg: any, data: any) {
  const resData = {
    success: false,
    message: msg,
    data: data,
  };
  return res.status(400).json(resData);
};
export { validationErrorWithData };

const unauthorizedResponse = function (res: any, msg: any) {
  const data = {
    success: false,
    message: msg,
  };
  return res.status(401).json(data);
};
export { unauthorizedResponse };

const forbiddenResponse = function (res: any, msg: any) {
  const data = {
    success: false,
    message: msg,
  };
  return res.status(403).json(data);
};
export { forbiddenResponse };
