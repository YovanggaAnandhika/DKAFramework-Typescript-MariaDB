import Database from "./..";

(async () => {

    await new Database({
        user : "root",
        password : "",
        database : "test"
    }).Read(`test`)
        .then(async (res) => {
            console.log(res)
        }).catch(async (error) => {
            console.error(error)
    })

})();