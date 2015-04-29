/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }

};

app.initialize();

var application = angular.module('application',['ngRoute', 'ngAnimate', 'autofields', 'uiSwitch', 'angular-flot']);

application.config(function ($routeProvider) {
    $routeProvider
        .when('/',
        {
            templateUrl: "partials/menu.html",
            controller: "AppCtrl"
        })
        .when('/models',
        {
            templateUrl: "partials/models.html",
            controller: "ModelListCtrl"
        })
        .when('/manage',
        {
            templateUrl: "partials/manage.html",
            controller: "ManageCtrl"
        })
        .when('/render/:param', 
        {
                templateUrl: "partials/load.html",
                controller: "LoadCtrl"
        })
        .when('/instructions', 
        {
                templateUrl: "partials/instructions.html",
                controller: "InstructionCtrl"
        })
        .when('/legal', 
        {
                templateUrl: "partials/legal.html",
                controller: "InstructionCtrl"
        })
        .when('/plot', 
        {
                templateUrl: "partials/plot.html",
                controller: "FlotCtrl"
        })
        .otherwise({redirectTo: '/'});
});

application.config(['$autofieldsProvider', function($autofieldsProvider){
    // Checkbox Field Handler
    $autofieldsProvider.registerHandler('checkbox', function(directive, field, index){
        var fieldElements = $autofieldsProvider.field(directive, field, '<switch/>');

        if(fieldElements.label) fieldElements.label.prepend(fieldElements.input);

        return fieldElements.fieldContainer;
    });
}]);

//global event handler
application.run(function($rootScope, $window, $route) {
        $rootScope.slide = '';
        $rootScope.$on('$routeChangeStart', function() {
            //event button to move backward
            $rootScope.back = function() {
                $rootScope.slide = 'slide-back';
                console.log("back");
                $window.history.back();
            }
            //event button item list to move forward
            $rootScope.next = function() {
                $rootScope.slide = 'slide-next';
                console.log("next");
            }
            //event button item list to move forward
            $rootScope.refresh = function() {
                $rootScope.slide = 'slide-next';
                $route.reload();
                console.log("refresh");
            }
        });
    });

var controllers = {};

application.factory('ServerSession', ['$http', function ($http) {
    var ServerSession = {};

    ServerSession.getModels = function() {
        return $http.get('http://ec2-54-165-60-76.compute-1.amazonaws.com/med_models');
        //return $http.get('http://localhost:8080/med_models');
    };

    ServerSession.getModel = function(id) {
        return $http.get('http://ec2-54-165-60-76.compute-1.amazonaws.com/med_model/' + id);
        //return $http.get('http://localhost:8080/med_model/' + id);
    };

    ServerSession.getModelInfo = function(id) {
        return $http.get('http://ec2-54-165-60-76.compute-1.amazonaws.com/get_model/' + id);
        //return $http.get('http://localhost:8080/get_model/' + id);
    };

    return ServerSession;
}]);

application.service('PlotData', function () {
    var eqn;
    var current_point;
    var setEquation = function(fn){
        eqn = fn;
    };
    var setPoint = function(point){
        current_point = point;
    };


    var getEquation = function(){
        return eqn;
    };

    var getPoint = function(){
        return current_point;
    }

    return {
        setEquation: setEquation,
        getEquation: getEquation,
        setPoint: setPoint,
        getPoint: getPoint
    };
});

application.controller('AppCtrl', function ($scope) {

});

application.controller('InstructionCtrl', ['$scope', function ($scope) {

}]);

application.controller('LegalCtrl', ['$scope', function ($scope) {

}]);

application.controller('ModelListCtrl', ['$scope', 'ServerSession', 
    function ($scope, ServerSession) {
        $scope.status;
        $scope.models;
        getModels();
        function getModels () {
            ServerSession.getModels ()
                .success(function (models) {
                    $scope.models = models;
                })
                .error(function (error) {
                    $scope.status = 'Unable to load models: ' + error.message;
                });
        }
}]);

application.controller('ManageCtrl', ['$scope', 'ServerSession', 
    function ($scope, ServerSession) {
        $scope.status;
        $scope.models;
        //$scope.saved = localStorage.getItem('localModels');
        $scope.localModels;
        getModels();
        function getModels () {
            ServerSession.getModels ()
                .success(function (models) {
                    $scope.models = models;
                })
                .error(function (error) {
                    $scope.status = 'Unable to load models: ' + error.message;
                });
        }
        getLocalModels();
        function getLocalModels(){
            //$scope.localModels = (localStorage.getItem('localModels')!==null) ? JSON.parse($scope.saved) : [ {text: 'Learn AngularJS', done: false}, {text: 'Build an Angular app', done: false} ]
        }
        $scope.add = function(){
            //localStorage.setItem('localModels', JSON.stringify($scope.localModels));
        }
        
        $scope.delete = function() {
        }
}]);

application.controller('LoadCtrl', ['$scope', 'ServerSession', 'PlotData', '$routeParams',
    function ($scope, ServerSession, PlotData, $routeParams) {
        $scope.models;
        var joinFunc;
        $scope.message = "No message";

        getModels();

        function getModels () {
            ServerSession.getModels ()
                .success(function (models) {
                    console.log("getModels");
                    $scope.models = models;
                    getModelInfo($routeParams.param);
                })
                .error(function (error) {
                    $scope.status = 'Unable to load models: ' + error.message;
                });
        }

        function getModelInfo (id) {
            ServerSession.getModelInfo (id)
                .success(function (modelinfo) {
                    console.log("getModelinfo");
                    $scope.model_name = $scope.models[id].name;
                    $scope.patient = modelinfo.patient;
                    $scope.schema = modelinfo.schema;
                    $scope.lookup = modelinfo.lookup;
                    joinFunc = modelinfo.join;
                    if (modelinfo.lookup !== undefined && modelinfo.lookup.plotOutput !== undefined){
                        plotEqn = eval('(function(probability) {'+$scope.lookup.plotOutput+'})');
                        PlotData.setEquation(plotEqn);

                        $scope.hasPlot = true;
                    }
                    else {
                        $scope.hasPlot = false;
                    }
                    $scope.join();
                    //eval(joinFunc);


                })
                .error(function (error) {
                    console.log('Unable to load models: ' + error.message);
                });
        }

        $scope.bracket = function(num, obj){
            var k = [];
            for (o in obj) k.push(obj[o].index);
            k.sort(function(a, b) { return a < b ? 1 : -1});
            for (i=0; i<k.length;i++){
                if (num >= k[i]) return obj[i];
            }
        };
        
        $scope.join = function () {
            eval(joinFunc);
            $scope.probability = $scope.patient['probability'];
            console.log("Evaluated Join Function");
            PlotData.setPoint([$scope.patient['probability'], $scope.output_value[0]]);
        };

}]);

application.controller('FlotCtrl', ['$scope', 'PlotData', 
    function($scope, PlotData) {
        //var eqn = PlotData.getEquation();
        //PlotData.setEquation(eqn);

        if (!PlotData.getEquation()){
            console.log("PlotData.getEquation not defined! Going back");
            $scope.back();
        }
        else {
            $scope.dataset = [
                { data: [], yaxis: 1, label: "posterior", lines: { show: true }},
                { data: [], color: 'green',  points: {symbol: "circle", fillColor: "#058DC7",  show: true } }
            ];


            $scope.options = {
                legend: {
                    container: "#legend",
                    show: true
                },
            };

            for (var i = 1; i <= 100; i += 1) {
                $scope.dataset[0].data.push([i, PlotData.getEquation()(i)]);
            }
            $scope.dataset[1].data.push(PlotData.getPoint());
            var plot = $.plot($("#placeholder"), [$scope.dataset[0], $scope.dataset[1]], $scope.options);

        }
    
}]);