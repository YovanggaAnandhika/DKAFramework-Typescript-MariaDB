import Database from "./../src/index";
import Server, { Options } from "@dkaframework/server";
    
(async () => {

    const db = await new Database({
        user : "root",
        password : "",
        database : "akuntaris",
        autoBackup : {
            enabled : true,
            backupPriodic : "DAILY",
            filename : "DKA"
        }
    });

    await Server({
        state : Options.Server.State.SERVER_STATE_DEVELOPMENT,
        engine : Options.Server.Engine.SOCKETIO,
        port : 82,
        app : async (io) => {
            let auth = io.of("auth");
            auth.on('connection', async (io) => {
                io.on('ping', async (data) => {
                    db.Select(`akuntaris-user_login`,{
                    }).then(async (res) => {
                        console.log(res);
                    }).catch(async (error) => {
                        console.error(error);
                    });
                })
            })
        }
    }).then(async (res) => {
        console.log(res)
    }).catch(async (error) => {
        console.error(error)
    });



    /*await db.CreateDB(`jhask`, {
        encryption : {
            secretKey : "12347"
        }
    })
        .then(async (res) => {
        console.log(res);
    }).catch(async (error) => {
        console.error(error);
    });*/

    /*await db.CreateTable(`jhask`, {
        data : [
            { coloumn : `id_user`, type : "PRIMARY_KEY", primaryKey : true, autoIncrement : true},
            { coloumn : `nama`, type : "LONGTEXT"},
        ],
        encryption : {
            secretKey : "12347"
        }
    })*/

    /*db.CreateDB(`test`)
        .then(async (res) => {
            console.log(res);
        }).catch(async (error) => {
        console.error(error);
    });*/




    /*db.Insert(`test`, {
        data : {
            nama : "Dhika"
        }
    })
        .then(async (res) => {
            console.log(res);
        }).catch(async (error) => {
            console.error(error);
        })*/

    /*db.Select(`test`)
        .then(async (res) => {
            console.log(res);
        }).catch(async (error) => {
        console.error(error);
    })*/

    /*db.AutoBackup()
        .then(async (res) => {
            console.log(res)
        })
        .catch(async (error) => {
            console.error(error)
        });*/

})();