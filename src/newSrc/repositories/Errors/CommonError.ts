interface ObjectLiteral {
    [key: string]: any;
}

export class IllegalArgument extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export class EntityNotExists extends Error {
    constructor(condition?: ObjectLiteral, message?: string) {
        super(message);
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