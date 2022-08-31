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

    await db.Lihat(`test`)
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