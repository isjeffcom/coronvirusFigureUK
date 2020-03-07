function getMapbox(){
    return {
        api: "https://api.mapbox.com/geocoding/v5/mapbox.places/",
        token: "<MAPBOX API TOKEN>"
    }
}

function getDB(){
    return {
        host     : 'localhost',
        user     : '<USERNAME>',
        password : '<PASSWORD>',
        database : 'corona',
        port: "<PORT>"
    }
}


module.exports={
    getMapbox: getMapbox,
    getDB: getDB
}