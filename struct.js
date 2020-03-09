// Standard data structure for server
function getStruct () {
    return {
        confirmed: 0,
        death: 0,
        cured: 0,
        serious: 0,
        negative: 0,
        suspected: 0,
        area: "",
        ts: 0
    }
}

module.exports = {
    getStruct: getStruct
}