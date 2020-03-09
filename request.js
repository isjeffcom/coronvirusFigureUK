/** 
 * Develop By Jeff Wu
 * 2020.03
 * isjeff.com
**/

/** 
 * VOIDS AND FUNCTIONS
 * getGet: http get function
 * contParam: construct get params
**/


var axios = require('axios')

// General get data
function genGet (api, param, callback) {
    axios.get(contParam(api, param)).then((response) => {

        if(typeof(response.data) == "string"){
            callback({status: false, error: response.data})
            return
        } else {
            callback({status: true, data: response.data})
            return
        }

    }).catch((err) => {

        callback({status: false, error: err})

    })
}

// Construct url with paramaters
function contParam (api, param) {
    
    // Assumble get url paramaters
    if(param.length > 0){
        api = api + "?"
        
        
        for(var i=0;i<param.length;i++){

            if(i == param.length - 1){
                
                api = api + param[i].name + "=" + param[i].val
            } else {
                api = api + param[i].name + "=" + param[i].val + "&"
            } 
        }    
    }

    return api
}

module.exports = {
    genGet: genGet
}