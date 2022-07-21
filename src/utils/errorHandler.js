
class ErrorHandler extends Error {
    constructor(massage, statusCode = 500) {
        super(massage);
        this.massage = massage;
        this.statusCode = statusCode;

        Error.captureStackTrace(this, this.constructor);
    }

}


export default ErrorHandler;