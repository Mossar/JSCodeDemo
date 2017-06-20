app.factory('MarkersService', function($q, RestService, MarkerConstants) {

    var root = MarkerConstants.getRoot();
    var grids = MarkerConstants.getGrids();
    var sortMethods = MarkerConstants.getSortMethods();
    var filters = {
        grid:  grids[1],
        sortBy: sortMethods[0],
        amount: 24,
        page: 1,
        status: "all",
        customer: {},
        tags: [],
        texts: [],
        endOfPagination: false
    };

    function getFilters(){
        return filters;
    }

    function resetPagination(){
        filters.page = 1;
        filters.endOfPagination = false;
    }

    function getMarkers(){
        return RestService.authGet({
            method: root + "list",
            data: {
                customerId: filters.customer.id,
                tags: filters.tags.map(function(value) { return value.id;  }),
                texts: filters.texts,
                sortBy: filters.sortBy.name,
                order: filters.sortBy.direction,
                size: filters.amount,
                page: filters.page
            }
        });
    }

    function getMarker(id){
        return RestService.authGet({
            method: root + "listById",
            data: {
                id: id
            }
        });
    }

    function getMarkerForLanguage(params){
        return RestService.authGet({
            method: root + "listById",
            data: {
                id: params.id,
                language: params.language
            }
        });
    }

    function setActive(params){
        return RestService.authPost({
            method: root + "setActive",
            data: {
                id: params.id,
                active: params.isActive
            }
        });
    }

    function removeMarker(params){
        return RestService.authPost({
            method: root + "delete",
            data: {
                id: params.id
            }
        });
    }

    function updateLanguages(params){
        return RestService.authPost({
            method: root + "languages/update",
            data: {
                markerId: params.markerId,
                languages: params.languages
            }
        });
    }

    function getNextPage(){
        filters.page++;
        return getMarkers(filters);
    }

    return {
        getMarkers: getMarkers,
        getMarker: getMarker,
        getMarkerForLanguage: getMarkerForLanguage,
        setActive: setActive,
        removeMarker: removeMarker,
        updateLanguages: updateLanguages,
        getNextPage: getNextPage,
        getFilters: getFilters,
        resetPagination: resetPagination,
    };
});
