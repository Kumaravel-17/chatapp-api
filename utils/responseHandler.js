const responseHandler = (res, statusCode, success, message, data=null) => {
if (!res) {
  console.error('Response object is required');
  return;  
}

    res.status(statusCode).json({
        status: statusCode >= 200 && statusCode < 300 ? 'success' : 'error',
        success,
        message,
        data
    });
}

module.exports = responseHandler;