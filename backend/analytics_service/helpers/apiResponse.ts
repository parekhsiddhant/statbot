class APIResponse {
  successResponse = function (res: any, msg: any) {
    const data = {
      success: true,
      message: msg,
    };
    return res.status(200).json(data);
  };

  successResponseWithData = function (res: any, msg: any, data: any) {
    const resData = {
      success: true,
      message: msg,
      data: data,
    };
    return res.status(200).json(resData);
  };

  errorResponse = function (res: any, msg: any) {
    const data = {
      success: false,
      message: msg,
    };
    return res.status(500).json(data);
  };

  notFoundResponse = function (res: any, msg: any) {
    const data = {
      success: false,
      message: msg,
    };
    return res.status(404).json(data);
  };

  validationErrorWithData = function (res: any, msg: any, data: any) {
    const resData = {
      success: false,
      message: msg,
      data: data,
    };
    return res.status(400).json(resData);
  };

  unauthorizedResponse = function (res: any, msg: any) {
    const data = {
      success: false,
      message: msg,
    };
    return res.status(401).json(data);
  };

  forbiddenResponse = function (res: any, msg: any) {
    const data = {
      success: false,
      message: msg,
    };
    return res.status(403).json(data);
  };
}

export default new APIResponse();
