app.controller('RegisterModalCtrl', function ($scope, $location, $uibModalInstance) {

    $scope.close = close;

    function close(){
        $uibModalInstance.close();
        $location.path("/login");
    }
});
