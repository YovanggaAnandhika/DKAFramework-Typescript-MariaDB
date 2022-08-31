import {createConnection, createPool, createPoolCluster} from "mariadb";
import GlobalConfig, {CreateTableConfig} from "./Config";
import crypto from "crypto";
import {Config} from "./Interfaces/Config";
import {isArray, isObject, merge, extend, isTypedArray} from "lodash";
import {
    Callback,
    CallbackBackup,
    CallbackCreateTable,
    CallbackDelete,
    CallbackError,
    CallbackInsert,
    CallbackRead,
    CallbackUpdate,
    metadata
} from "./Interfaces/Callback";
import moment, {now} from "moment-timezone";
import {
    ClassInterfaces,
    RulesInsert,
    RulesDelete,
    RulesRead,
    RulesUpdate,
    RulesCreateDataPrimary, RulesCreateTable
} from "./Interfaces/Class";
import {Instance, Method} from "./Type/types";
import {default as mysqlDump, DumpReturn} from "mysqldump";
import fs from "fs";
import path from "path";

/**
 * @class MariaDB
 * @implements ClassInterfaces
 * @description
 * The Class Is a MariaDB Function For Database MariaDB
 * The Base In DKAFramework Application
 */
class MariaDB implements ClassInterfaces {


    /**
     *
     * @private
     * @param {any[]} _mKey
     */
    private _mKey : any[] = [];
    private _mVal : any[] = [];
    private _mWhere : any[] = [];
    private _mSetData : any[] = [];
    private _timeStart = new Date().getTime();

    get timeStart(): number {
        return this._timeStart;
    }

    set timeStart(value: number) {
        this._timeStart = value;
    }

    get mKey(): any[] {
        return this._mKey;
    }

    set mKey(value: any[]) {
        this._mKey = value;
    }

    get mVal(): any[] {
        return this._mVal;
    }

    set mVal(value: any[]) {
        this._mVal = value;
    }

    get mWhere(): any[] {
        return this._mWhere;
    }

    set mWhere(value: any[]) {
        this._mWhere = value;
    }

    get mSetData(): any[] {
        return this._mSetData;
    }

    set mSetData(value: any[]) {
        this._mSetData = value;
    }

    private SqlScript : string = "";

    private mMethod : Method = "READ";
    private mInstance : Instance;
    private mSearchAdd : string = ``;

    private _mConfig : Config = GlobalConfig;

    private get mConfig(): Config {
        return this._mConfig;
    }

    private set mConfig(value: Config) {
        this._mConfig = value;
    }

    private static checkModuleExist(name : string){
        try {
            require.resolve(name);
            return true;
        }catch (e) {
            return false;
        }
    }


    /**
     * @constructor
     * @param {Config | undefined } config
     */
    constructor(config? : Config) {
        this.mConfig = merge(GlobalConfig, config);
        moment.locale("id")
    }


    async CreateTable(TableName: string, Rules : RulesCreateTable = CreateTableConfig): Promise<CallbackCreateTable | CallbackError> {
        let mRules : RulesCreateTable = await extend(CreateTableConfig, Rules);
        this.timeStart = new Date().getTime();
        let mQuery = ``;
        let mFinalQuery = ``;
        let length : number;
        let mDefault : string;

        mRules.data.forEach((value) => {
            switch (value.type) {
                case "PRIMARY_KEY" :
                    let autoIncrement = (value.autoIncrement) ? "AUTO_INCREMENT" : "";
                    mQuery += ` \`${value.coloumn}\` BIGINT PRIMARY KEY ${autoIncrement}`;
                    break;
                case "VARCHAR" :
                    length = (value.length !== undefined) ? value.length : 20;
                    mDefault = (value.default === null) ? `DEFAULT NULL` : `NOT NULL`;
                    mQuery += ` \`${value.coloumn}\` VARCHAR(${length}) ${mDefault}`;
                    break;
                case "LONGTEXT" :
                    mDefault = (value.default === null) ? `DEFAULT NULL` : `NOT NULL`;
                    mQuery += ` \`${value.coloumn}\` LONGTEXT ${mDefault}`;
                    break;
                case "ENUM" :
                    mDefault = (value.default === null) ? `DEFAULT NULL` : ` DEFAULT '${value.default}'`;
                    let ms = `'${value.values.join(`','`)}'`;
                    mQuery += ` \`${value.coloumn}\` ENUM(${ms}) ${mDefault}`;
                    break;

            }
            mQuery += `,`;
        });

        /** Remove (,) in last statment **/
        mQuery = mQuery.substring(0, mQuery.length - 1);

        let mIfNotExist = (mRules.ifNotExist) ? "IF NOT EXISTS " : "";
        let mEngine = (mRules.engine !== undefined) ? `ENGINE ${mRules.engine}` : ``;
        mFinalQuery = `CREATE TABLE ${mIfNotExist}\`${TableName}\`(${mQuery}) ${mEngine};`;
        //console.log(mFinalQuery);
        this.mMethod = "CREATE_TABLE";
        return this.rawQuerySync(mFinalQuery,[]);
    }


    /**
     * INFORMATION DOCUMENTATION CODE
     * -----
     * @param { string } TableName - <b>TableName</b><br/>
     * The Table Name Database Selected For Use Action for <b>READ DATA<b/>
     * <br/>
     * ---------
     * @param {RulesInsert} Rule - <b>Rules</b><br/>
     * The Rules is Parameter Options For Insert <b>Database Function</b><br/>
     * ---------
     * @return Promise<CallbackCreate | CallbackError> - <b>Promise<CallbackCreate | CallbackError></b><br/>
     * The Return Variable Format
     */
    async Insert(TableName : string, Rule : RulesInsert) : Promise<CallbackInsert | CallbackError> {
        this.timeStart = new Date().getTime();
        let Rules : RulesInsert = merge({
            data: {}
        }, Rule);

        if (isObject(Rules.data)){
            this.mKey = [];
            this.mVal = [];

            await Object.keys(Rules.data).forEach((key) => {
                this.mKey.push(` \`${key}\` `);
                this.mVal.push(`"${ Rules.data[key]}"`);
            });

            this.SqlScript = `INSERT INTO \`${TableName}\` (${this.mKey})VALUES (${this.mVal}) `;
        }else if (isArray(Rules.data)){

            //@@@@@@@@@@@@@@@@@@@
            this.mVal = [];
            this.mKey = [];
            this.mSetData = [];
            //@@@@@@@@@@@@@@@@@@@

            //**********************************************************
            Rules.data.map(async (item, index) => {
                this.mKey = [];
                this.mSetData = [];
                //######################################################
                Object.keys(item).map(async (key) => {
                    this.mKey.push(`${key}`);
                    this.mSetData.push(`"${Rules.data[index][key]}"`);
                });
                //#######################################################
                this.mVal.push(`(${this.mSetData})`)
            });
            //************************************************************
            this.SqlScript = `INSERT INTO ${TableName} (${this.mKey})VALUES ${this.mVal} `;
        }
        //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
        this.mMethod = "INSERT";
        //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
        return await this.rawQuerySync(this.SqlScript,[]);
    };

    /**
     * INFORMATION DOCUMENTATION CODE
     * -----
     * @param { string } TableName - <b>TableName</b><br/>
     * The Table Name Database Selected For Use Action for <b>READ DATA<b/>
     * <br/>
     * ---------
     * @param {RulesRead} Rules - <b>Rules</b><br/>
     * The Rules is Parameter Options For Read <b>Database Function</b><br/>
     * ---------
     * @return Promise<CallbackRead | CallbackError> - <b>Promise<CallbackRead | CallbackError></b><br/>
     * The Return Variable Format
     */
    async Read(TableName : string, Rules ?: RulesRead): Promise<CallbackRead | CallbackError> {
        this.timeStart = new Date().getTime();
        this.mSearchAdd = ``;

        if (Rules !== undefined){
            if (isArray(Rules.search)){
            await Rules.search.forEach((item) => {
                Object.keys(item).forEach((k) => {
                    this.mSearchAdd += `\`${k}\`=\'${item[k]}\' `;
                });
            });
        }else if (isObject(Rules.search)){
            await Object.keys(Rules.search).forEach( (item) => {
                this.mSearchAdd += ` \'${Rules.search[item]}\' `;
            });
        }

        const UpdateWhere = (Rules.search !== false) ? `WHERE ${this.mSearchAdd}` : ``;
        const SelectColumn = (Rules.column.length > 0) ? Rules.column : `*`;
        const SelectLimit = (Rules.limit > 0) ? `LIMIT ${Rules.limit}` : ``;
        const SelectOrderBy = (Rules.orderBy.column.length > 0) ? `ORDER BY ${Rules.orderBy.column} ${Rules.orderBy.mode}` : ``;
        const selectParentAs = (Rules.as !== false) ? `as \`${Rules.as}\`` : ``;

        const mSQL = `SELECT ${SelectColumn} FROM \`${TableName}\`${selectParentAs} ${UpdateWhere} \n ${SelectOrderBy} ${SelectLimit}`;
            this.mMethod = "READ";
            return await this.rawQuerySync(mSQL,[]);

        }else{
            const mSQL = `SELECT * FROM \`${TableName}\` `;
            this.mMethod = "READ";
            return await this.rawQuerySync(mSQL,[]);
        }

    };

    /**
     * INFORMATION DOCUMENTATION CODE
     * -----
     * @param { string } TableName - <b>TableName</b><br/>
     * The Table Name Database Selected For Use Action for <b>READ DATA<b/>
     * <br/>
     * ---------
     * @param {RulesUpdate} Rules - <b>Rules</b><br/>
     * The Rules is Parameter Options For Update <b>Database Function</b><br/>
     * ---------
     * @return Promise<CallbackUpdate | CallbackError> - <b>Promise<CallbackUpdate | CallbackError></b><br/>
     * The Return Variable Format
     */
    async Update(TableName : string, Rules : RulesUpdate) : Promise<CallbackUpdate | CallbackError> {
        this.timeStart = new Date().getTime();
        /** Merge JSON Extend loDash **/
        const Rule = extend({
            data: false,
            search: false
        }, Rules);

        this.mKey = [];
        this.mWhere = [];

        Object.keys(Rule.data).forEach((key) => {
            this.mKey.push(` ${key} = '${Rule.data[key]}'`);
        });

        Object.keys(Rule.search).forEach((key) => {
            this.mWhere.push(`${key} = '${Rule.search[key]}'`);
        });

        const UpdateWhere = (Rule.search !== false) ? `WHERE ${this.mWhere}` : ``;

        const mSQL = `UPDATE \`${TableName}\` SET${this.mKey} ${UpdateWhere} `;
        this.mMethod = "UPDATE";
        return this.rawQuerySync(mSQL, []);
    }

    /**
     * INFORMATION DOCUMENTATION CODE
     * -----
     * @param { string } TableName - <b>TableName</b><br/>
     * The Table Name Database Selected For Use Action for <b>READ DATA<b/>
     * <br/>
     * ---------
     * @param {RulesDelete} Rules - <b>Rules</b><br/>
     * The Rules is Parameter Options For Delete <b>Database Function</b><br/>
     * ---------
     * @return Promise<CallbackDelete | CallbackError> - <b>Promise<CallbackDelete | CallbackError></b><br/>
     * The Return Variable Format
     */

    async Delete (TableName : string , Rules : RulesDelete) : Promise<CallbackDelete | CallbackError>{

        const Rule = extend({
            search: false
        }, Rules);

        this.mWhere = [];

        Object.keys(Rule.search).forEach((key) => {
            this.mWhere.push(` \`${key}\` = "${Rule.search[key]}" `)
        });

        const DeleteWhere = (Rule.search !== false) ? `WHERE ${this.mWhere}` : ``;

        const SqlScript = `DELETE FROM \`${TableName}\` ${DeleteWhere} `;
        this.mMethod = "DELETE";
        return this.rawQuerySync(SqlScript, []);
    };


    /**
     *
     * @param {string} SQLString
     * @param {any}values
     */
    async rawQuerySync(SQLString : string, values?: any): Promise<Callback | CallbackUpdate | CallbackInsert | CallbackDelete | CallbackRead | CallbackError> {
        return new Promise(async (resolve, rejected) => {
            switch (this.mConfig.engine) {
                case "Connection":
                    this.mInstance = createConnection(this.mConfig)
                    break;
                case "PoolConnection":
                    let mInstance = createPool(this.mConfig);
                    let connection = mInstance.getConnection();

                    await connection
                        .then(async (PoolConnection) => {
                            /** **/
                            PoolConnection.query(SQLString, values)
                                .then(async (rows) => {
                                    let timeEnd = new Date().getTime();
                                    let metadata: metadata = {
                                        activeConnections: mInstance.activeConnections(),
                                        idleConnections: mInstance.idleConnections(),
                                        totalConnections: mInstance.totalConnections(),
                                        lastInsertId : undefined,
                                        sqlRaw: SQLString,
                                        timeExecuteinMilliSecond: Math.round(timeEnd - this.timeStart),
                                        timeExecuteinSecond: ((timeEnd - this.timeStart) / 1000)
                                    }
                                    switch (this.mMethod) {
                                        case "CREATE_TABLE" :
                                            PoolConnection.release()
                                                .then(async () => {
                                                    if (rows.warningStatus < 1) {
                                                        await resolve({
                                                            status: true,
                                                            code: 200,
                                                            msg: `successful, your table has been created`,
                                                            metadata: metadata
                                                        });
                                                    }else{
                                                        await rejected({
                                                            status: false,
                                                            code: 201,
                                                            msg: `warning status detected. Check Warning Message`,
                                                            affected : rows.affectedRows,
                                                            warning : rows.warningStatus,
                                                            metadata: metadata
                                                        })
                                                    }

                                                }).catch(async (e) => {
                                                await rejected({
                                                    status: false,
                                                    code: 500,
                                                    msg: `Pool Connection Release Failed`,
                                                    metadata: metadata,
                                                    error : e
                                                });
                                            });
                                            break;
                                        case "INSERT":
                                            if (rows.affectedRows > 0) {
                                                if (rows.warningStatus < 1) {
                                                    PoolConnection.release()
                                                        .then(async () => {
                                                            metadata = merge(metadata, { lastInsertId : rows.insertId })
                                                            await resolve({
                                                                status: true,
                                                                code: 200,
                                                                msg: `successful, your data has been created`,
                                                                metadata: metadata
                                                            })
                                                        }).catch(async () => {
                                                        await rejected({
                                                            status: false,
                                                            code: 500,
                                                            msg: `Pool Connection Release Failed`,
                                                            metadata: metadata
                                                        });
                                                    });
                                                } else {
                                                    PoolConnection.release()
                                                        .then(async () => {
                                                            await rejected({
                                                                status: false,
                                                                code: 201,
                                                                msg: `warning status detected. Check Warning Message`,
                                                                metadata: metadata
                                                            });
                                                        }).catch(async () => {
                                                        await rejected({
                                                            status: false,
                                                            code: 500,
                                                            msg: `Pool Connection Release Failed`,
                                                            metadata: metadata
                                                        });
                                                    });
                                                }
                                            } else {
                                                PoolConnection.release()
                                                    .then(async () => {
                                                        await rejected({
                                                            status: false,
                                                            code: 404,
                                                            msg: `Succeeded, But No Data Changed Created`,
                                                            metadata: metadata
                                                        });
                                                    }).catch(async () => {
                                                    await rejected({
                                                        status: false,
                                                        code: 500,
                                                        msg: `Pool Connection Release Failed`,
                                                        metadata: metadata
                                                    });
                                                });
                                            }
                                            break;
                                        case "READ":
                                            if (rows.length > 0) {
                                                PoolConnection.release()
                                                    .then(async () => {
                                                        await resolve({
                                                            status: true,
                                                            code: 200,
                                                            msg: `successful, your data has been read`,
                                                            data: rows,
                                                            metadata: metadata
                                                        });
                                                    }).catch(async () => {
                                                    await rejected({
                                                        status: false,
                                                        code: 500,
                                                        msg: `Pool Connection Release Failed`,
                                                        metadata: metadata
                                                    });
                                                })

                                            } else {
                                                PoolConnection.release()
                                                    .then(async () => {
                                                        await rejected({
                                                            status: false,
                                                            code: 404,
                                                            msg: `Succeeded, But No Data Found`,
                                                            metadata: metadata
                                                        });
                                                    }).catch(async () => {
                                                    await rejected({
                                                        status: false,
                                                        code: 500,
                                                        msg: `Pool Connection Release Failed`,
                                                        metadata: metadata
                                                    });
                                                })
                                            }
                                            break;
                                        case "UPDATE" :
                                            if (rows.affectedRows > 0) {
                                                if (rows.warningStatus < 1) {
                                                    await resolve({
                                                        status: true,
                                                        code: 200,
                                                        msg: `successful, your data has been update`,
                                                        affected : rows.affectedRows,
                                                        warning : rows.warningStatus,
                                                        metadata: metadata
                                                    });
                                                    //resolve({status : true, code : 200, msg : `success`, da})
                                                } else {
                                                    await rejected({
                                                        status: false,
                                                        code: 201,
                                                        msg: `warning status detected. Check Warning Message`,
                                                        affected : rows.affectedRows,
                                                        warning : rows.warningStatus,
                                                        metadata: metadata
                                                    })
                                                }
                                            } else {
                                                await rejected({
                                                    status: false,
                                                    code: 404,
                                                    msg: `Succeeded, But No Data Changed`,
                                                    metadata: metadata
                                                });
                                            }
                                            break;
                                        case "DELETE" :
                                            if (rows.affectedRows > 0) {
                                                if (rows.warningStatus < 1) {
                                                    await resolve({
                                                        status: true,
                                                        code: 200,
                                                        msg: `successful, your data has been delete`,
                                                        affected : rows.affectedRows,
                                                        warning : rows.warningStatus,
                                                        metadata: metadata
                                                    });
                                                    //resolve({status : true, code : 200, msg : `success`, da})
                                                } else {
                                                    await rejected({
                                                        status: false,
                                                        code: 201,
                                                        msg: `warning status detected. Check Warning Message`,
                                                        affected : rows.affectedRows,
                                                        warning : rows.warningStatus,
                                                        metadata: metadata
                                                    })
                                                }
                                            } else {
                                                await rejected({
                                                    status: false,
                                                    code: 404,
                                                    msg: `Succeeded, But No Data Changed`,
                                                    metadata: metadata
                                                });
                                            }
                                            break;
                                        default:
                                            this.timeStart = new Date().getTime();
                                            PoolConnection.release()
                                                .then(async () => {
                                                    await rejected({
                                                        status: false,
                                                        code: 505,
                                                        msg: `Method Unknown`,
                                                        metadata: metadata
                                                    });
                                                }).catch(async () => {
                                                await rejected({
                                                    status: false,
                                                    code: 500,
                                                    msg: `Pool Connection Release Failed`,
                                                    metadata: metadata
                                                });
                                            })
                                            break;
                                    }

                                })
                                .catch(async (error) => {
                                    let timeEnd = new Date().getTime();
                                    let metadata: metadata = {
                                        activeConnections: mInstance.activeConnections(),
                                        idleConnections: mInstance.idleConnections(),
                                        totalConnections: mInstance.totalConnections(),
                                        sqlRaw: SQLString,
                                        timeExecuteinMilliSecond: Math.round(timeEnd - this.timeStart),
                                        timeExecuteinSecond: ((timeEnd - this.timeStart) / 1000)
                                    }
                                    switch (error.code) {
                                        case 'ER_TABLE_EXISTS_ERROR' :
                                            PoolConnection.release()
                                                .then(async () => {
                                                    await rejected({
                                                        status: false,
                                                        code: 500,
                                                        msg: "Failed, Table Name Is Exists",
                                                        error: {
                                                            errorMsg: error.text,
                                                            errorCode: error.code,
                                                            errNo: error.errno
                                                        }
                                                    });
                                                }).catch(async () => {
                                                await rejected({
                                                    status: false,
                                                    code: 500,
                                                    msg: `Pool Connection Release Failed`,
                                                    metadata: metadata
                                                });
                                            });
                                            break;
                                        default :
                                            PoolConnection.release()
                                                .then(async () => {
                                                    await rejected({
                                                        status: false,
                                                        code: 500,
                                                        msg: "Error Detected",
                                                        error: {
                                                            errorMsg: error.text,
                                                            errorCode: error.code,
                                                            errNo: error.errno
                                                        }
                                                    });
                                                }).catch(async () => {
                                                await rejected({
                                                    status: false,
                                                    code: 500,
                                                    msg: `Pool Connection Release Failed`,
                                                    metadata: metadata
                                                });
                                            });
                                    }
                                });
                        }).catch(async (error) => {
                            await rejected({
                                status: false,
                                code: 500,
                                msg: `Pool Connection get connection Error`,
                                error: error
                            });
                        });
                    break;
                case "PoolClusterConnection":
                    this.mInstance = createPoolCluster(this.mConfig);
                    break;
                default:
                    this.mInstance = undefined;
                    break;
            }
        });

    }

    async AutoBackup(enabled : Boolean = true) : Promise<CallbackBackup> {
        return new Promise(async (resolve, rejected) => {
            if (enabled){
                if (MariaDB.checkModuleExist("mysqldump")){
                    const mysqlDump = require("mysqldump").default;
                    const fs = require("fs");
                    let AddPathByTimes = ``;
                    let renameFile = ``;
                    let renameFileChecksum = ``;
                    let nameCompressed = ``;
                    let reformatNameTimes = ``;

                    let fileBuffer : Buffer;
                    let hashSum : crypto.Hash;
                    let checksumHex : string | undefined = undefined;
                    switch (this.mConfig.autoBackup?.backupPriodic) {
                        case "HOURS" :
                            AddPathByTimes = path.join(<string>this.mConfig.autoBackup?.dumpFileLocation,'./Hours');
                            if (!fs.existsSync(AddPathByTimes)){
                                await fs.mkdirSync(AddPathByTimes, { recursive : true, mode : 0o77 });
                            }
                            reformatNameTimes = moment().format("dddd_HH_DD-MM-YYYY");
                            nameCompressed = (this.mConfig.autoBackup?.compressFile) ? ".gz" : "";
                            renameFile = `${AddPathByTimes}/${this.mConfig.autoBackup?.filename}-${reformatNameTimes}${this.mConfig.autoBackup?.extension}${nameCompressed}`;
                            renameFileChecksum = `${AddPathByTimes}/${this.mConfig.autoBackup?.filename}-${reformatNameTimes}${this.mConfig.autoBackup?.extension}${nameCompressed}.txt`;
                            break;
                        case "DAILY" :
                            AddPathByTimes = path.join(<string>this.mConfig.autoBackup?.dumpFileLocation,'./Daily');
                            if (!fs.existsSync(AddPathByTimes)){
                                await fs.mkdirSync(AddPathByTimes, { recursive : true, mode : 0o77 });
                            }

                            reformatNameTimes = moment().format("dddd_DD-MM-YYYY");
                            nameCompressed = (this.mConfig.autoBackup?.compressFile) ? ".gz" : "";
                            renameFile = `${AddPathByTimes}/${this.mConfig.autoBackup?.filename}-${reformatNameTimes}${this.mConfig.autoBackup?.extension}${nameCompressed}`;
                            renameFileChecksum = `${AddPathByTimes}/${this.mConfig.autoBackup?.filename}-${reformatNameTimes}${this.mConfig.autoBackup?.extension}${nameCompressed}.txt`;
                            break;
                        case "MONTH" :
                            AddPathByTimes = path.join(<string>this.mConfig.autoBackup?.dumpFileLocation,'./Month');
                            if (!fs.existsSync(AddPathByTimes)){
                                await fs.mkdirSync(AddPathByTimes, { recursive : true, mode : 0o77 });
                            }

                            reformatNameTimes = moment().format("MM-YYYY");
                            nameCompressed = (this.mConfig.autoBackup?.compressFile) ? ".gz" : "";
                            renameFile = `${AddPathByTimes}/${this.mConfig.autoBackup?.filename}-${reformatNameTimes}${this.mConfig.autoBackup?.extension}${nameCompressed}`;
                            renameFileChecksum = `${AddPathByTimes}/${this.mConfig.autoBackup?.filename}-${reformatNameTimes}${this.mConfig.autoBackup?.extension}${nameCompressed}.txt`;
                            break;
                        case "YEARS" :
                            AddPathByTimes = path.join(<string>this.mConfig.autoBackup?.dumpFileLocation,'./Years');
                            if (!fs.existsSync(AddPathByTimes)){
                                await fs.mkdirSync(AddPathByTimes, { recursive : true, mode : 0o77 });
                            }

                            reformatNameTimes = moment().format("YYYY");
                            nameCompressed = (this.mConfig.autoBackup?.compressFile) ? ".gz" : "";
                            renameFile = `${AddPathByTimes}/${this.mConfig.autoBackup?.filename}-${reformatNameTimes}${this.mConfig.autoBackup?.extension}${nameCompressed}`;
                            renameFileChecksum = `${AddPathByTimes}/${this.mConfig.autoBackup?.filename}-${reformatNameTimes}${this.mConfig.autoBackup?.extension}${nameCompressed}.txt`;

                            break;
                        default :
                            await rejected({
                                status : false,
                                code : 500,
                                msg : `Method Unknown or Not Available`
                            });
                            break;
                    }

                    if (!fs.existsSync(renameFile) || this.mConfig.autoBackup?.forceReplace){
                        await mysqlDump({
                            connection : {
                                host : this.mConfig.host,
                                user : this.mConfig.user,
                                password : this.mConfig.password,
                                port : this.mConfig.port,
                                database : this.mConfig.database
                            },
                            dumpToFile : renameFile,
                            compressFile : this.mConfig.autoBackup?.compressFile
                        }).then(async (dumpReturn: DumpReturn) => {
                            /** Generate Hex Checksum Of File Backup **/
                            fileBuffer = fs.readFileSync(renameFile);
                            hashSum = crypto.createHash('sha256');
                            await hashSum.update(fileBuffer);
                            checksumHex = hashSum.digest('hex');
                            await fs.writeFileSync(renameFileChecksum, `checksum=${checksumHex}`);
                            /** End Generate Hex Checksum Of File Backup **/
                            let timeEnd = new Date().getTime();

                            resolve({
                                status : true,
                                code : 200,
                                msg : `successfully to Backup Database`,
                                filename : renameFile,
                                checksum : checksumHex
                            })
                        }).catch(async (error : CallbackError) => {
                            await rejected({
                                status : false,
                                code : 500,
                                msg : `Failed to Backup Database Schedule.`,
                                error : {
                                    errorMsg : ``
                                },
                                errorEx : error
                            })
                        })
                    }else{
                        /** Generate Hex Checksum Of File Backup **/
                        fileBuffer = fs.readFileSync(renameFile);
                        hashSum = crypto.createHash('sha256');
                        await hashSum.update(fileBuffer);
                        checksumHex = hashSum.digest('hex');
                        await fs.writeFileSync(renameFileChecksum, `checksum=${checksumHex}`);
                        /** End Generate Hex Checksum Of File Backup **/

                        await resolve({
                            status : true,
                            code : 301,
                            msg : `Sucessfully. But backup is Exist. Backup Action Skipped`,
                            filename : renameFile,
                            checksum : checksumHex
                        })
                    }
                }else{
                    await rejected({
                        status : false,
                        code : 500,
                        msg : `MODULE "mysqldump" not Installed. please install First`
                    });
                }
            }else{
                await rejected({
                    status : false,
                    code : 500,
                    msg : `Auto Backup Disable. to use it please enabled first`
                });
            }
        })
    }
}

export default MariaDB;
export { MariaDB };
