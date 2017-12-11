module.exports = {
    get_params:function(req) {
        if(typeof req.params[0] !== "undefined"){
            params = req.params[0].split('/');
        }else{
            params = [];
        }
        uri_to_params = req.query;
        for(var i=0; i<params.length; i+=2){
            //uri_to_params.push({});
            uri_to_params[params[i]] = params[i+1];
        }
        return uri_to_params;
    }
}