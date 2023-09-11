"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forbiddenResponse = exports.unauthorizedResponse = exports.validationErrorWithData = exports.notFoundResponse = exports.ErrorResponse = exports.successResponseWithData = exports.successResponse = void 0;
const successResponse = function (res, msg) {
    const data = {
        success: true,
        message: msg,
    };
    return res.status(200).json(data);
};
exports.successResponse = successResponse;
const successResponseWithData = function (res, msg, data) {
    const resData = {
        success: true,
        message: msg,
        data: data,
    };
    return res.status(200).json(resData);
};
exports.successResponseWithData = successResponseWithData;
const ErrorResponse = function (res, msg) {
    const data = {
        success: false,
        message: msg,
    };
    return res.status(500).json(data);
};
exports.ErrorResponse = ErrorResponse;
const notFoundResponse = function (res, msg) {
    const data = {
        success: false,
        message: msg,
    };
    return res.status(404).json(data);
};
exports.notFoundResponse = notFoundResponse;
const validationErrorWithData = function (res, msg, data) {
    const resData = {
        success: false,
        message: msg,
        data: data,
    };
    return res.status(400).json(resData);
};
exports.validationErrorWithData = validationErrorWithData;
const unauthorizedResponse = function (res, msg) {
    const data = {
        success: false,
        message: msg,
    };
    return res.status(401).json(data);
};
exports.unauthorizedResponse = unauthorizedResponse;
const forbiddenResponse = function (res, msg) {
    const data = {
        success: false,
        message: msg,
    };
    return res.status(403).json(data);
};
exports.forbiddenResponse = forbiddenResponse;
