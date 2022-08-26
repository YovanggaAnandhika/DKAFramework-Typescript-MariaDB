import {Config} from "./Config";
import {Callback, CallbackCreate, CallbackError, CallbackRead} from "./Callback";
import {Connection, Pool, PoolCluster} from "mariadb";


export interface Rules {
    as? : false | string
}

export interface RulesRead extends Rules {
    search? : Array<Object | String> | Object | false | any,
    column? : Array<String> | any,
    limit? : number | false | any,
    orderBy? : {
        column? : Array<string> | any,
        mode? : "ASC" | "DESC" | any
    } | any
}

export interface RulesCreate extends Rules {
    data? : Object | Array<Object | String> | false | any,
}

export class ClassInterfaces {

    constructor(config : Config);

    /**
     *
     * @param TableName the Table Name Format As String
     * @param Rules
     * @constructor
     * @example
     *  <Instance>.Create(`tes`, { Rules }).then(async (res) => { ... });
     *  @return Promise<CallbackCreate | CallbackError>
     */
    Create(TableName : string, Rules : RulesCreate) : Promise<CallbackCreate | CallbackError>;

    /**
     *
     * @param TableName the Table Name Format As String
     * @param Rules
     * @constructor
     * @example
     *  <Instance>.Read(`tes`, { Rules }).then(async (res) => { ... })
     *  @return Promise<CallbackRead | CallbackError>
     */
    Read(TableName : string, Rules : RulesRead) : Promise<CallbackRead | CallbackError>;

    /**
     *
     * @param SQLString the Table Name Format As String
     * @param values
     * @constructor
     * @example
     *  <Instance>.rawQuerySync(`tes`, [ ... ]).then(async (res) => { ... });
     *
     *  @return Promise<CallbackCreate | CallbackRead | CallbackError>
     */
    rawQuerySync (SQLString? : string, values? : any) : Promise<Callback | CallbackCreate | CallbackRead | CallbackError>
}