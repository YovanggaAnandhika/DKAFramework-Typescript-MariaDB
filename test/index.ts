import Database from "./../src/index";

    
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

    db.Select(`akuntaris-user_login`,{

    }).then(async (res) => {
        console.log(res);
    }).catch(async (error) => {
        console.error(error);
    });


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