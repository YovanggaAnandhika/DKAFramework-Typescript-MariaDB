import {Config} from "./Config";
import {
    Callback,
    CallbackBackup, CallbackCreateTable,
    CallbackDelete,
    CallbackError, CallbackInsert,
    CallbackRead,
    CallbackUpdate
} from "./Callback";


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

export interface RulesUpdate extends Rules {
    search : Array<Object | String> | Object | false | any,
    data : Object | Array<Object | String> | false | any
}

export interface RulesDelete extends Rules {
    search : Array<Object | String> | Object | false | any,
}


export interface RulesCreateDataBigInt {
    coloumn : string,
    type : "BIGINT",
    index : boolean,
    unique : boolean,
    default ?: null | any
}

export type RulesCreateDataPrimary = {
    coloumn : string,
    primaryKey : boolean,
    autoIncrement : boolean,
    type : "PRIMARY_KEY",
    default ?: null | any
}

export type RulesCreateDataLongText = {
    coloumn : string,
    type : "LONGTEXT",
    default ?: null | any | string
}

export type RulesCreateDataVarchar = {
    coloumn : string,
    type : "VARCHAR",
    length ?: number | undefined,
    default : null | "NOT_NULL" | string
}

export type RulesCreateDataEnum = {
    coloumn : string,
    type : "ENUM",
    values : Array<string | number>,
    default : number | string | null
}

export type CreateTypeColoumn =
    RulesCreateDataPrimary |
    RulesCreateDataBigInt |
    RulesCreateDataVarchar |
    RulesCreateDataEnum |
    RulesCreateDataLongText;

export interface RulesCreateTable extends Rules {
    data : Array<CreateTypeColoumn>,
    ifNotExist ?: boolean,
    engine ?: string
}

export interface RulesInsert extends Rules {
    data? : Object | Array<Object | String> | false | any,
}

export class ClassInterfaces {

    constructor(config : Config);

    CreateTable(TableName : string, Rules : RulesCreateTable) : Promise<CallbackCreateTable | CallbackError>;

    /**
     * @param TableName the Table Name Format As String
     * @param Rules
     * @constructor
     * @example
     *  <Instance>.Create(`tes`, { Rules }).then(async (res) => { ... });
     *  @return Promise<CallbackCreate | CallbackError>
     */
    Insert(TableName : string, Rules : RulesInsert) : Promise<CallbackInsert | CallbackError>;
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

    Update(TableName : string, Rules : RulesUpdate) : Promise<CallbackUpdate | CallbackError>;

    Delete(TableName : string, Rules : RulesDelete) : Promise<CallbackDelete | CallbackError>;

    AutoBackup(enabled : boolean) : Promise<CallbackBackup>;


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
    rawQuerySync (SQLString? : string, values? : any) : Promise<Callback | CallbackUpdate | CallbackInsert | CallbackDelete | CallbackRead | CallbackError>
}