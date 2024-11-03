class ApiResponse {
    static sendResponse(res, status, isSuccessful, result) {
        res.status(status).json({
            status,
            isSuccessful,
            result,
        });
    }
}

module.exports = ApiResponse;