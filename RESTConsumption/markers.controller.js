app.controller('MarkersCtrl', function ($scope,  $document, $routeParams, MarkersService, markersPreloaded) {

    $scope.grids = MarkersService.getGrids();
    $scope.sortMethods = MarkersService.getSortMethods();
    $scope.filters = MarkersService.getFilters();
    $scope.markers = [];

    $scope.setStatus = setStatus;
    $scope.setGrid = setGrid;
    $scope.getMarkers = getMarkers;
    $scope.getNextPage = getNextPage;
    $scope.resetSearch = resetSearch;

    function setStatus(status) {
        $scope.filters.status = status;
        getMarkers();
    }

    function setGrid(grid) {
        $scope.filters.grid = grid;
    }

    function getMarkers(changed) {
        $scope.markers = [];
        MarkersService.resetPagination();
        MarkersService.getMarkers().then(function(response){
            $scope.markers = response.data;
        })
    }

    function getNextPage() {
        return MarkersService.getNextPage().then(function(response){
            if(response.data.length > 0) $scope.markers = $scope.markers.concat(response.data);
            else $scope.filters.endOfPagination = true;
        })
    }

    function resetFilters(){
        $scope.filters.customer = {};
        $scope.filters.tags = [];
        $scope.filters.texts = [];
    }

    function resetSearch(){
        resetFilters();
        getMarkers();
    }

    $scope.$on('$routeUpdate', function() {
        MarkersService.resetPagination();
        $document.scrollTop(0, 500).then(function() {
            $scope.filterView = $routeParams.filter;
        });
    });


    /* Markers data is preloaded from Groovy/Grails REST API using Angular mechanism */
    (function init(){
        $scope.markers = markersPreloaded.data;
    })();



});
