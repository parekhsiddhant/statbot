"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class APIResponse {
    successResponse = function (res, msg) {
        const data = {
            success: true,
            message: msg,
        };
        return res.status(200).json(data);
    };
    successResponseWithData = function (res, msg, data) {
        const resData = {
            success: true,
            message: msg,
            data: data,
        };
        return res.status(200).json(resData);
    };
    errorResponse = function (res, msg) {
        const data = {
            success: false,
            message: msg,
        };
        return res.status(500).json(data);
    };
    notFoundResponse = function (res, msg) {
        const data = {
            success: false,
            message: msg,
        };
        return res.status(404).json(data);
    };
    validationErrorWithData = function (res, msg, data) {
        const resData = {
            success: false,
            message: msg,
            data: data,
        };
        return res.status(400).json(resData);
    };
    unauthorizedResponse = function (res, msg) {
        const data = {
            success: false,
            message: msg,
        };
        return res.status(401).json(data);
    };
    forbiddenResponse = function (res, msg) {
        const data = {
            success: false,
            message: msg,
        };
        return res.status(403).json(data);
    };
}
exports.default = new APIResponse();
