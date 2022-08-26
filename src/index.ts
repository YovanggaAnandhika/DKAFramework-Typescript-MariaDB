import {createConnection, createPool, createPoolCluster} from "mariadb";
import GlobalConfig from "./Config";
import {Config} from "./Interfaces/Config";
import {isArray, isObject, merge} from "lodash";
import {Callback, CallbackCreate, CallbackError, CallbackRead, metadata} from "./Interfaces/Callback";
import {ClassInterfaces, Rules, RulesCreate, RulesRead} from "./Interfaces/Class";
import {Instance, Method} from "./Type/types";


/**
 * @class MariaDB
 * @implements ClassInterfaces
 * @description
 * The Class Is a MariaDB Function For Database MariaDB
 * The Base In DKAFramework Application
 */
class MariaDB implements ClassInterfaces {

    private mKey : any[] = [];
    private mVal : any[] = [];
    private mSetData : any[] = [];
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


    /**
     * @constructor
     * @param {Config | undefined } config
     */
    constructor(config? : Config) {
        this.mConfig = merge(GlobalConfig, config);
    }

    /**
     * INFORMATION DOCUMENTATION CODE
     * -----
     * @param { string } TableName - <b>TableName</b><br/>
     * The Table Name Database Selected For Use Action for <b>READ DATA<b/>
     * <br/>
     * ---------
     * @param {RulesCreate} Rule - <b>Rules</b><br/>
     * The Rules is Parameter Options For Read <b>Database Function</b><br/>
     * ---------
     * @return Promise<CallbackCreate | CallbackError> - <b>Promise<CallbackCreate | CallbackError></b><br/>
     * The Return Variable Format
     */
    async Create(TableName : string, Rule : RulesCreate) : Promise<CallbackCreate | CallbackError> {
        let Rules : RulesCreate = merge({
            data: {}
        }, Rule);

        if (isObject(Rules.data)){
            this.mKey = [];
            this.mVal = [];

            await Object.keys(Rules.data).forEach((key) => {
                this.mKey.push(` \`${key}\` `);
                this.mVal.push(`"${ Rules.data[key]}"`);
            });

            this.SqlScript = `INSERT INTO \`${TableName}\` (${this.mKey}) VALUES (${this.mVal}) `;
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
            this.SqlScript = `INSERT INTO ${TableName} (${this.mKey}) VALUES ${this.mVal} `;
        }
        //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
        this.mMethod = "CREATE";
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
     *
     * @param {string} SQLString
     * @param {any}values
     */
    async rawQuerySync(SQLString : string, values?: any): Promise<Callback |CallbackCreate | CallbackRead | CallbackError> {
        return new Promise<CallbackRead | CallbackError>(async (resolve, rejected) => {
            switch (this._mConfig.engine) {
                case "Connection":
                    this.mInstance = createConnection(this._mConfig)
                    break;
                case "PoolConnection" :
                    let mInstance = createPool(this._mConfig);
                    let connection = mInstance.getConnection();

                    await connection
                        .then(async (PoolConnection) => {
                            /** **/
                            PoolConnection.query(SQLString, values)
                                .then(async (rows) => {
                                    let metadata : metadata = { activeConnections : mInstance.activeConnections(), idleConnections : mInstance.idleConnections(), totalConnections : mInstance.totalConnections(), sqlRaw : SQLString, timeExecuteinSecond : ""}
                                    switch (this.mMethod) {
                                        case "CREATE":
                                            if (rows.affectedRows > 0) {
                                                if (rows.warningStatus < 1){
                                                    PoolConnection.release()
                                                        .then(async () => {
                                                            await resolve({ status: true, code: 200, msg: `successful, your data has been created`, metadata : metadata})
                                                        }).catch(async () => {
                                                        await rejected({status: false, code: 500, msg: `Pool Connection Release Failed`, metadata : metadata});
                                                    });
                                                }else{
                                                    PoolConnection.release()
                                                        .then(async () => {
                                                            await rejected({ status: false, code: 201, msg: `warning status detected. Check Warning Message`, metadata : metadata});
                                                        }).catch(async () => {
                                                        await rejected({status: false, code: 500, msg: `Pool Connection Release Failed`, metadata : metadata});
                                                    });
                                                }
                                            }else{
                                                PoolConnection.release()
                                                    .then(async () => {
                                                        await rejected({ status: false, code: 404, msg: `Succeeded, But No Data Changed Created`, metadata : metadata});
                                                    }).catch(async () => {
                                                    await rejected({status: false, code: 500, msg: `Pool Connection Release Failed`, metadata : metadata});
                                                });

                                            }
                                            break;
                                        case "READ":
                                            if (rows.length > 0) {
                                                PoolConnection.release()
                                                    .then(async () => {
                                                        await resolve({ status: true, code: 200, msg: `successful, your data has been read`, data : rows, metadata : metadata});
                                                    }).catch(async () => {
                                                    await rejected({status: false, code: 500, msg: `Pool Connection Release Failed`, metadata : metadata});
                                                })

                                            }else{
                                                PoolConnection.release()
                                                    .then(async () => {
                                                        await rejected({status: false, code: 404, msg: `Succeeded, But No Data Found`, metadata : metadata});
                                                    }).catch(async () => {
                                                    await rejected({status: false, code: 500, msg: `Pool Connection Release Failed`, metadata : metadata});
                                                })
                                            }
                                            break;
                                        default :
                                            PoolConnection.release()
                                                .then(async () => {
                                                    await rejected({ status: false, code: 505, msg: `Method Unknown`, metadata : metadata});
                                                }).catch(async () => {
                                                await rejected({status: false, code: 500, msg: `Pool Connection Release Failed`, metadata : metadata});
                                            })
                                            break;
                                    }

                                })
                                .catch(async (error) => {
                                    let metadata : metadata = { activeConnections : mInstance.activeConnections(), idleConnections : mInstance.idleConnections(), totalConnections : mInstance.totalConnections(), sqlRaw : SQLString, timeExecuteinSecond : ""}
                                    switch (error.code){
                                        case 'ER_TABLE_EXISTS_ERROR' :
                                            PoolConnection.release()
                                                .then(async () => {
                                                    await rejected({ status: false, code: 500, msg: "Failed, Table Name Is Exists", error: { errorMsg : error.text, errorCode : error.code, errNo : error.errno }});
                                                }).catch(async () => {
                                                await rejected({status: false, code: 500, msg: `Pool Connection Release Failed`, metadata : metadata});
                                            });
                                            break;
                                        default :
                                            PoolConnection.release()
                                                .then(async () => {
                                                    await rejected({ status: false, code: 500, msg: "Error Detected", error: { errorMsg : error.text, errorCode : error.code, errNo : error.errno }});
                                                }).catch(async () => {
                                                await rejected({status: false, code: 500, msg: `Pool Connection Release Failed`, metadata : metadata});
                                            });
                                    }
                                });
                        }).catch(async (error) => {
                            await rejected({status: false, code: 500, msg: `Pool Connection get connection Error`, error : error});
                        })
                    break;
                case "PoolClusterConnection" :
                    this.mInstance = createPoolCluster(this._mConfig);
                    break;
                default :
                    this.mInstance = undefined;
                    break;
            }
        });

    }
}

export { MariaDB }
export default MariaDB;