(function () {
'use strict'

angular.module('NarrowItDownApp', [])
.controller('NarrowItDownController', NarrowItDownController)
.service('MenuSearchService', MenuSearchService)
.constant('ApiBasePath', "https://davids-restaurant.herokuapp.com");



NarrowItDownController.$inject = ['MenuSearchService', '$scope'];
function NarrowItDownController(MenuSearchService, $scope) {

    var menu = this;

    menu.getItems = function() {
        console.log("ejecutando getItems");
        var promise = MenuSearchService.getMenuItems();
        promise.then(function (response){
            menu.items = response.data;
            console.log(menu.items);
            menu.matchedItems = MenuSearchService.lookForItems($scope.searchTerm, menu.items);
            console.log(menu.matchedItems);
        })
        .catch(function (error) {
            console.log("Error.");
        });
    };

    menu.getMatchedItems = function() {
        MenuSearchService.getMatchedMenuItems($scope.searchTerm);

    };

}

MenuSearchService.$inject = ['$http', 'ApiBasePath'];
function MenuSearchService($http, ApiBasePath) {

    var service = this;

    service.getMatchedMenuItems = function (searchTerm) {
// 1. descargarse el json y buscar solo en los menu items
// 2. buscar el término en todos los términos
// 3. crear el array found
// 4. si found="", Nada encontrado!
        console.log("ejecutando getMatchedMenuItems", searchTerm);
        searchTermGlob = searchTerm;
        var tempArray = [];


        var promise = service.getMenuItems();
        promise.then(function (e){
            service.lookForItems(e);
        })
        .catch(function(error) {
            console.log("Error getMatchedMenuItems");
        });
        // promise.then(service.lookForItems(response))
        // .catch(function (error) {
        //     console.log("Error en getMatchedMenuItems");
        // });



    };

    service.getMenuItems = function () {
        console.log("Ejecutando http promise");
        var response = $http({
          method: "GET",
          url: (ApiBasePath + "/menu_items.json")
        });
        return response;
    };

    service.lookForItems = function (searchTerm, items) {
        var data = items;
        var foundItems = [];
        for (var key in data.menu_items) {
            if (data.menu_items[key].description.indexOf(searchTerm) !== -1) {
                var item = {};
                item.id = data.menu_items[key].id;
                item.short_name = data.menu_items[key].short_name;
                item.description = data.menu_items[key].description;
                //console.log(key);
                //console.log(data.menu_items[key].id);
                foundItems.push(item);
            };
        };
        console.log(foundItems);
        return foundItems;

    };

}


})();