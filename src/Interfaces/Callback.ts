
export interface metadata {
    activeConnections : number,
    idleConnections : number,
    totalConnections : number,
    sqlRaw : string,
    timeExecuteinSecond : string
}
export interface Callback {
    status? : boolean,
    code? : 200 | 404 | 500 | 505 | 301,
    msg? : string,
    metadata? : metadata
}

export interface CallbackRead extends Callback {
    data : Array<Object>
}

export interface CallbackCreate extends Callback {
    data : Array<Object>
}

export interface CallbackError extends Callback {
    error? : {
        errNo? : number,
        errCode? : string,
        errMsg? : string
    }
}