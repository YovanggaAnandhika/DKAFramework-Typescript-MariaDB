import Database from "./../src";

    
(async () => {

    const db = await new Database({
        user : "root",
        password : "",
        database : "test",
        autoBackup : {
            enabled : true,
            backupPriodic : "DAILY",
            filename : "DKA"
        }
    });

    db.CreateTable(`test4`,{
        ifNotExist : true,
        data : [
            {
                coloumn : "id_data",
                type : "PRIMARY_KEY",
                primaryKey : true,
                autoIncrement : true
            },
            {
              coloumn : "nama",
              type : "LONGTEXT"
            },
            {
                coloumn : "data",
                type : "ENUM",
                values : [
                    "perempuan",
                    "laki-laki"
                ],
                default : "perempuan"
            }
        ]
    })
        .then(async (res) => {
            console.log(res)
        })
        .catch(async (error) => {
        console.error(error)
    })
    /*db.AutoBackup()
        .then(async (res) => {
            console.log(res)
        })
        .catch(async (error) => {
            console.error(error)
        });*/

})();