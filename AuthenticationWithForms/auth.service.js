app.factory('AuthService', function($cookies, RestService) {

    var credentials = {
        username: null,
        token: null
    };

    var getUser = function(){
        return credentials;
    };

    var login = function(params) {
        return RestService.post({
            method: "api/login",
            data: {
                username: params.username,
                password: params.password
            }
        }).then(function(response){
            setCredentials(response.data);
            setCookies(params.remember);
        });
    };

    var register = function(params) {
        return RestService.post({
            method: "api/guest/createCustomer",
            data: {
                name: params.name,
                surname: params.surname,
                email: params.email,
                customerCompany: params.customerCompany,
                country: params.country ? params.country.name : '',
                password: params.password,
                repeatPassword: params.repeatPassword,
                companyName: backend.subdomain,
            }
        });
    };

    var setCredentials = function(newCredentials) {
        credentials.username = newCredentials.username;
        credentials.token = newCredentials.access_token;
        RestService.setToken(credentials.token);
    }

    var setCookies = function(remember) {
        if(remember){
            var now = new Date();
            var expirationDate = new Date(now.getFullYear(), now.getMonth()+1, now.getDate());
            $cookies.put('ar_username', credentials.username, { expires: expirationDate });
            $cookies.put('ar_token', credentials.token, { expires: expirationDate });
        } else {
            $cookies.put('ar_username', credentials.username);
            $cookies.put('ar_token', credentials.token);
        }
    }

    return {
        getUser: getUser,
        login: login,
        register: register
    };
});
