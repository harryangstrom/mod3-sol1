(function () {
'use strict'

angular.module('NarrowItDownApp', [])
.controller('NarrowItDownController', NarrowItDownController)
.service('MenuSearchService', MenuSearchService)
.constant('ApiBasePath', "https://davids-restaurant.herokuapp.com")
.constant('ApiWeather', "https://api.openweathermap.org")
.directive('foundItems', foundItems)
.directive('weatherMap', weatherMap)
.directive('weatherForecast', weatherForecast);

//foundItems.$inject = [''];
function foundItems() {
    var ddo = {
        scope: {
            cont: '<myCont',
            title: '@'
        },
        templateUrl: 'loader/itemsloader.html'
    };
    return ddo;
}

function weatherMap() {
    var ddo = {
        scope: {
            cont: '<myCont',
            title: '@title'
        },
        templateUrl: 'loader/weathermap.html'
    };
    return ddo;
}

function weatherForecast() {
    var ddo = {
        scope: {
            cont: '<myCont',
            title: '@title'
        },
        templateUrl: 'loader/weatherforecast.html'    
    };
    return ddo;

}


NarrowItDownController.$inject = ['MenuSearchService'];
function NarrowItDownController(MenuSearchService) {

    var menu = this;
    window.SCOPE = menu;
    menu.cities = [];
    var ciudades = [
        "Madrid",
        "Barcelona",
        "Lugo",
        "Pontevedra",
        "Bilbao",
        "Cadiz",
        "Segovia",
        "Salamanca",
        "Guadalajara",
        "Sevilla"
    ];
    var indice = 0;
        //menu.title = "Your menu is: " + menu.matchedItems.length + " items.";

// La siguiente función es para la ejecución de la búsqueda mediante promise en el controlador. Espera
// a que se complete la promise para realizar la búsqueda.

    menu.getMatchedItems = function() {
        console.log("ejecutando getItems");
        var promise = MenuSearchService.getMenuItems();
        promise.then(function (response){
            // menu.items = response.data;
            console.log(response.data);
            menu.matchedItems = MenuSearchService.lookForItems(menu.searchTerm, response.data);
            menu.title = "Your menu is: " + menu.matchedItems.length + " items.";
            console.log(menu.matchedItems.length);
            console.log(menu.title);
            console.log(menu.matchedItems);
        })
        .catch(function (error) {
            console.log("Error.");
        });
    };



    menu.getWeather = function(index) {
        console.log("ejecutando getWeather");
        menu.citiId = menu.cities[index].id;
        menu.titlefor = "Previsión para: " + menu.cities[index].empresa+ ".";
        console.log("CitiId: ", menu.citiId, "Index: ", index);
        var promise = MenuSearchService.getWeather(menu.citiId);
        promise.then(function (response){
            // menu.items = response.data;
            console.log(response.data);
            menu.forecast = response.data.list;
            //console.log(menu.foritem.name == menu.ciudadecast);
            //menu.titlefor = "Previsión para: " + menu.cities[index].name+ ".";
        })
        .catch(function (error) {
            console.log("Error.");
        });
    };

    menu.getCities = function() {
        console.log("ejecutando getCities");
        var promise = MenuSearchService.getCities();

        promise.then(function (response){
            // menu.items = response.data;
            console.log(response.data);
            menu.city = response.data.sort(MenuSearchService.compara);
            menu.city = response.data.find(item => {
                //console.log("indice: ", indice);
                return item.name == ciudades[indice];
                
                //console.log("indice: ", indice);
               // return item.name == menu.ciudad;
            });
            if (menu.city !== undefined) {
                indice++;
                menu.city.empresa = menu.ciudad;
                menu.ciudad = "";
                console.log(menu.city);
            menu.cities.push(menu.city);
            console.log(menu.ciudad, "ID: ", menu.city.id);
            console.log(menu.ciudad, menu.city);
            }
            if (menu.cities.length > 1 || menu.cities.length == 0) {
                menu.titlecit = menu.cities.length + " empresas.";
            }
            else {
                menu.titlecit = menu.cities.length + " empresa.";
            }

        })
        .catch(function (error) {
            console.log("Error.");
        });
    };

    // Las siguientes funciones son para evitar una promise en el controlador. Hay que ejecutar primero
    // getMatchedItems() y después, una vez terminado, getItems() para que traiga los datos del Service.

/*     menu.getMatchedItems = function() {
        MenuSearchService.getMatchedMenuItems(menu.searchTerm);
    };

    menu.getItems = function() {
        menu.matchedItems = MenuSearchService.getItems();
    };
 */
    menu.removeItem = function(index) {
        MenuSearchService.removeItem(index);
        menu.title = "Your menu is: " + menu.matchedItems.length + " items.";
    };

}

MenuSearchService.$inject = ['$http', 'ApiBasePath', 'ApiWeather'];
function MenuSearchService($http, ApiBasePath, ApiWeather) {

    var service = this;
    window.serviceScope = service;
    var foundItems = [];


// La siguiente función se usa solo cuando no hay promise en el controlador
    service.getMatchedMenuItems = function (searchTerm) {

        console.log("ejecutando getMatchedMenuItems", searchTerm);
        // searchTermGlob = searchTerm;
        var tempArray = [];


        var promise = service.getMenuItems();
        promise.then(function (e) {
            service.lookForItems(searchTerm, e.data);
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
          url: (ApiBasePath + "/menu_items.json"),
          cache: true
        });
        return response;
    };

    service.getWeather = function (citiId) {
        console.log("Ejecutando http promise Weather");
        var response = $http({
          method: "GET",
          url: (ApiWeather + "/data/2.5/forecast"),
          params: {
              id: citiId,
              APPID: "9db9a15fd259808eef01a421dd7a82d3",
              units: "metric"
          }
        });
        return response;
    };

    service.getCities = function () {
        console.log("Ejecutando http promise Weather");
        var response = $http({
          method: "GET",
          url: ("https://oriondatadisks.blob.core.windows.net/json/city.list.json"),
          cache: true
        });
        return response;
    };

    service.lookForItems = function (searchTerm, items) {
        var data = items;
        foundItems = [];
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
        console.log("Respuesta lookForItems: ");
        console.log(foundItems);
        return foundItems; //en caso de trabajar con la función no-promise del controlador, hay que comentar esta línea.

    };

    service.removeItem = function (index) {
        foundItems.splice(index, 1);
    };

    service.getItems = function () {
        return foundItems;
    };

    service.compara = function compara (a, b) {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
    };

}


})();