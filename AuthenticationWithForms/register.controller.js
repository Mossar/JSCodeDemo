app.controller('RegisterCtrl', function ($scope, $uibModal, AuthService, SpinnerService, CustomersService, ErrorService) {

    $scope.errors = [];
    $scope.customerToCreate = {};
    $scope.countries = [];

    $scope.register = register;
    $scope.isError = isError;

    function isError(field) {
        return ErrorService.isError(field, $scope.errors);
    }

    function getCountries() {
        CustomersService.getCountries().then(function(response){
            $scope.countries = response.data;
        });
    }

    function showConfirmationModal() {
        var modalInstance = $uibModal.open({
            templateUrl: 'app/views/register/modals/register.confirmation.modal.html',
            controller: 'RegisterModalCtrl'
        });
    }

    function register() {
        $scope.errors = [];
        SpinnerService.showSpinner("register");
        AuthService.register($scope.customerToCreate).then(
            function(response) {
                if(response.data.status == 'error') {
                    $scope.errors = response.data.errors;
                }
                else {
                    showConfirmationModal();
                    $scope.customerToCreate = {};
                }
            }
        )
    }

    var init = (function() {
        getCountries();
    })();

});
