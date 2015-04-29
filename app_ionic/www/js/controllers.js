angular.module('application.controllers', [])

    .controller('ModelListCtrl', ['$scope', 'LocalStorage', 'ServerSession', '$rootScope', function ($scope, LocalStorage, ServerSession, $rootScope) {

        $scope.status;

        getModels();
        $scope.doRefresh = getModels;
        $rootScope.getModels = getModels;
        function getModels () {
            ServerSession.getModels ()
                .success(function (models) {
                    console.log("success1");
                    $rootScope.download()
                    $rootScope.models = models;
                    var i = 0;
                    for (var i=0; i<$rootScope.models.length; i++){
                        $rootScope.models[i].position = i;
                    }
                    console.log("success2");
                })
                .error(function (error) {
                    $scope.status = 'Unable to load models: ' + error.message;
                    console.log("offline?");
                    $rootScope.load();
                })
                .finally(function() {
                    // Stop the ion-refresher from spinning
                    console.log("finally");
                    $rootScope.$broadcast('scroll.refreshComplete');
                });
        }

        $rootScope.download = function(){
            LocalStorage.download('test.js', 'http://ec2-52-4-249-151.compute-1.amazonaws.com/models/get');
        };
        $rootScope.load = function(){
            LocalStorage.load('test.js', $rootScope);
        };

    }])

    .controller('LoadCtrl', ['$scope', '$rootScope', 'ServerSession', 'PlotData', '$stateParams',
        function ($scope, $rootScope, ServerSession, PlotData, $routeParams) {
            $scope.models;
            var joinFunc;
            $scope.message = "No message";
            $scope.$on('scroll.refreshComplete', function(event){
                load_model();   
            });

            var id = $routeParams.param;
            console.log(id);
            $scope.doRefresh = function(){
                $rootScope.getModels();
                load_model();
            };

            var load_model = function(){
                $scope.model_name = $rootScope.models[id].name;
                $scope.patient = $rootScope.models[id].src.patient;
                $scope.schema = $rootScope.models[id].src.schema;
                $scope.lookup = $rootScope.models[id].src.lookup;

                joinFunc = $rootScope.models[id].src.join;
                if ($rootScope.models[id].src.lookup !== undefined && $rootScope.models[id].src.lookup.plotOutput !== undefined){
                    plotEqn = eval('(function(probability) {'+$scope.lookup.plotOutput+'})');
                    PlotData.setEquation(plotEqn);
                    $scope.hasPlot = true;
                }
                else { $scope.hasPlot = false; }
            };
            load_model();

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
            $scope.join();

    }])

    .controller('PlotCtrl', ['$scope', 'PlotData', '$ionicNavBarDelegate',
        function($scope, PlotData, $ionicNavBarDelegate) {
            //var eqn = PlotData.getEquation();
            //PlotData.setEquation(eqn);

            if (!PlotData.getEquation()){
                console.log("PlotData.getEquation not defined! Going back");
                //$ionicNavBarDelegate.back();
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
