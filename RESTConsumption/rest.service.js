/* Service which override standard $http service for more intuitive usage */
app.factory('RestService', function(CONFIG, $http, Upload) {

    var token = null;

    var setToken = function(retrievedToken) {
        token = retrievedToken;
    }

    var get = function(params) {
        return $http.get(CONFIG.REST + params.method, params.data).error(function(data){
            console.log("Error in " + params.method + " request!");
        });
    }

    var authGet = function(params) {
        return $http({
            method: 'GET',
            url: CONFIG.REST + params.method,
            headers: {
                'Authorization': 'Bearer ' + token
            },
            params: params.data
        });
    };

    var post = function(params) {
        return $http.post(CONFIG.REST + params.method, params.data).error(function(data){
            console.log("Error in " + params.method + " request!");
        });
    }

    var authPost = function(params) {
        return $http({
            method: 'POST',
            url: CONFIG.REST + params.method,
            headers: {
                'Authorization': 'Bearer ' + token
            },
            data: params.data
        });
    };

    var upload = function(params){
        return Upload.upload({
            url: CONFIG.REST + params.method,
            file: params.file,
            fields: params.fields,
            sendFieldsAs: 'form',
            headers: {
                'Authorization': 'Bearer ' + token
            },
        });
    }

    return {
        post: post,
        authPost: authPost,
        get: get,
        authGet: authGet,
        upload: upload,
        setToken: setToken
    };
});
