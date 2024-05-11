export interface Error {
    key: string;
    message: string;
    status?: number;
}

export const error = (
    key: string,
    message: string,
    status?: number
): Error => ({
    key,
    message,
    status,
});

export interface SQLError {
    code: string;
    errno: string;
    sqlMessage: string;
    sqlState: string;
    index: string;
    sql: string;
}

export const sqlError = (key: string, errorSQL: SQLError): Error =>
    error(key, errorSQL.sqlMessage);