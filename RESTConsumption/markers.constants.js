app.factory('MarkersConstants', function($translate) {

    var root = "api/marker/";
    var grids = [
        { name: "large", columns: 3, icon: "assets/img/icons/markers/large-grid.png" },
        { name: "medium", columns: 4, icon: "assets/img/icons/markers/medium-grid.png" },
        { name: "small", columns: 6, icon: "assets/img/icons/markers/small-grid.png" },
        { name: "list", icon: "assets/img/icons/markers/list-grid.png" }
    ];
    var sortMethods = [
        { name: "name", direction: "asc", text: $translate.instant("markers.filters.sorts.titleASC") },
        { name: "name", direction: "desc", text: $translate.instant("markers.filters.sorts.titleDESC") },
        { name: "dateCreated", direction: "asc", text: $translate.instant("markers.filters.sorts.dateCreatedASC") },
        { name: "dateCreated", direction: "desc", text: $translate.instant("markers.filters.sorts.dateCreatedDESC") }
    ]

    return {
        getRoot: function() {
            return root;
        }
        getGrids: function() {
            return grids;
        },
        getSortMethods: function() {
            return sortMethods;
        }
    }

}
