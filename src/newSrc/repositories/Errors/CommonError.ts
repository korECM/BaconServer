import {BaseError} from "make-error-cause";

interface ObjectLiteral {
    [key: string]: any;
}

export class CustomError extends BaseError {
    constructor(cause?: Error | null, message?: string) {
        super(message || "", cause || undefined);
    }
}

export class IllegalArgument extends CustomError {
}

export class EntityNotExists extends CustomError {
    constructor(condition?: ObjectLiteral, message?: string) {
        super(null, message);
        if (condition) {
            const keys = Object.keys(condition);
            let customMessage = "";
            for (const key of keys) {
                customMessage += `${key}(${condition[key]}), `;
            }
            const lastIndex = customMessage.lastIndexOf(',');
            this.message = customMessage.slice(0, lastIndex) + "에 해당하는 개체가 존재하지 않습니다";
        }
    }
}

export class UndefinedError extends CustomError {
}