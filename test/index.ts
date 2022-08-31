import Database from "./..";

    
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

    db.Read()
    /*db.AutoBackup()
        .then(async (res) => {
            console.log(res)
        })
        .catch(async (error) => {
            console.error(error)
        });*/

})();