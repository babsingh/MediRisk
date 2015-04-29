var app = angular.module('myApp', ['ui.bootstrap', 'googlechart', 'uiSwitch', 'textAngular', 'autofields', 'ngResource', 'angular-flot', 'ngRoute']);

  app.service('PlotData', function () {
      var eqn;
      var current_point;
      var setEquation = function(fn){ eqn = fn; };
      var setPoint = function(point){ current_point = point; };
      var getEquation = function(){ return eqn; };
      var getPoint = function(){ return current_point; }

      return {
          setEquation: setEquation,
          getEquation: getEquation,
          setPoint: setPoint,
          getPoint: getPoint
      };
  });

  app.controller('homeController', ['$scope', '$http', '$location', 'PlotData', '$window',
                                function($scope, $http, $location, PlotData, $window) {
      $scope.maxshow;
      function setMaxShow (num) {
        $scope.maxshow = num;
      };

      $scope.resetUsers = function() {
        $http.get('/user/profile')
            .success(function(data, status, headers, config) {
          // console.log(data);
          $scope.user = data;
          $scope.error = "";
        }).
        error(function(data, status, headers, config) {
          $scope.user = {};
          $scope.error = data;
        });
      };

      $scope.resetIdeas = function() {
        $http.get('/models/get1')
            .success(function(data, status, headers, config) {
          $scope.models = data;
          $scope.modelsfil = data;
          setMaxShow($scope.models.length);
          console.log($scope.maxshow);
          console.log($scope.models);
          $scope.error = "";
        }).
        error(function(data, status, headers, config) {
          $scope.models = {};
          $scope.error = data;
        });
      };

      $scope.resetUsers();
      $scope.resetIdeas();

      $scope.setContent = function(filename) {
        $scope.content = '/static/' + filename;
      };

      var joinFunc;
      $scope.seltypes1 = ['fields', 'data', 'lookup', 'output'];
      $scope.seltypes = ['data', 'lookup', 'output'];
      $scope.seltype;
      $scope.orightml;
      $scope.model_name;
      $scope.patient;
      $scope.schema;
      $scope.lookup;

      // $scope.setOrigModelHtml = function () {
      //   $scope.orightml = JSON.stringify($scope.currentModel.src.patient, null, 4);
      //   console.log("Original HTML:");
      //   console.log($scope.orightml);
      // };

      $scope.join = function () {
          console.log(joinFunc);
          eval(joinFunc);
          if($scope.patient) {
            $scope.probability = $scope.patient['probability'];
            console.log("Evaluated Join Function");
            PlotData.setPoint([$scope.patient['probability'],    $scope.output_value[0]]);
          }
      };

      $scope.resetSchema = function(datam) {
        $scope.schema = JSON.parse(datam);
        console.log('Schema');
        console.log($scope.schema);
      };


      $scope.resetUser = function(datam) {
        // console.log($scope.orightml);
        $scope.patient = JSON.parse(datam);
        // console.log($scope.patient);
      };

      $scope.resetCode = function(datam) {
        joinFunc = datam;
      };

      $scope.resetLookup = function(datam) {
        $scope.lookup = datam;
      };

      $scope.changeModel = function(datam) {
        console.log("OT - " + $scope.seltype);
        if($scope.seltype == "fields") {
          $scope.resetUser(datam);
        }
        if($scope.seltype == "data") {
          $scope.resetSchema(datam);
        }
        if($scope.seltype == "lookup") {
          $scope.resetCode(datam);
        }
        if($scope.seltype == "output") {
          $scope.resetLookup(datam);
        }
      };

      $scope.selectData = function(datam) {
        $scope.seltype = datam;
        console.log("OT - " + $scope.seltype);
        if($scope.seltype == "fields") {
          $scope.orightml = JSON.stringify($scope.patient, null, 4);
          console.log($scope.orightml);
        }
        if($scope.seltype == "data") {
          $scope.orightml = JSON.stringify($scope.schema, null, 4);
          console.log($scope.orightml);
        }
        if($scope.seltype == "lookup") {
          $scope.orightml = JSON.stringify($scope.lookup, null, 4);
          console.log($scope.orightml);
        }
        if($scope.seltype == "output") {
          $scope.orightml = joinFunc;
          console.log($scope.orightml);
        }
        return $scope.orightml;
      };

      $scope.updateModel = function () {
        var url = "/model/update/" + $scope.currentItem._id;
        console.log("Updating model");
        var dataObj = {
            name: $scope.model_name,
            desc: $scope.model_desc,
            src: {
                   patient: $scope.patient,
                   schema: $scope.schema,
                   lookup: $scope.lookup,
                   join: joinFunc
                 }
        };
        var request = $http.post(url, dataObj);

         // Store the data-dump of the FORM scope.
         request.success(
             function( data, status, headers, config ) {
               $scope.setContent('home.hjs');
               $scope.resetIdeas();
               $window.alert("Model Updated");
             }
         );

         request.error(
             function( data, status, headers, config ) {
                 $window.alert("Update Failed");
             }
         );

        //  $scope.setContent('home.hjs');
      };

      $scope.deleteModel = function () {
        var url = "/model/delete/" + $scope.currentItem._id;
        console.log("Deleting model");
        var dataObj = {};
        var request = $http.post(url, dataObj);

         // Store the data-dump of the FORM scope.
         request.success(
             function( data, status, headers, config ) {
               $scope.setContent('home.hjs');
               $scope.resetIdeas();
               $window.alert("Model Deleted");
             }
         );

         request.error(
             function( data, status, headers, config ) {
                 $window.alert("Update Failed");
             }
         );

        //  $scope.setContent('home.hjs');
      };

      $scope.addModel = function () {
        var url = "/newmodel";
        console.log("Updating model");
        var dataObj = {
            author: $scope.user.username,
            name: $scope.model_name,
            desc: $scope.model_desc,
            src: {
                   patient: $scope.patient,
                   schema: $scope.schema,
                   lookup: $scope.lookup,
                   join: joinFunc
                 }
        };
        var request = $http.post(url, dataObj);

         // Store the data-dump of the FORM scope.
         request.success(
             function( data, status, headers, config ) {
               $scope.setContent('home.hjs');
               $scope.resetIdeas();
               $window.alert("Model Added");
             }
         );

         request.error(
             function( data, status, headers, config ) {
                 $window.alert("Update Failed");
             }
         );

        //  $scope.setContent('home.hjs');
      };

      $scope.updateModelName = function(name) {
          $scope.model_name = name;
      };

      $scope.updateDesc = function(desc) {
          $scope.model_desc = desc;
      };

      $scope.plot_data = function () {
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
      };

      $scope.setContentModel = function (filename) {
        $scope.content_model = '/static/' + filename;
      };

      $scope.setContentModel1 = function (filename) {
        $scope.content_model1 = '/static/' + filename;
      };

      $scope.resetModel = function () {
        console.log("Reset Model");
        $scope.content = '/static/editmodel.hjs';
        $scope.content_model = '/static/load_model.hjs';
        $scope.model_name = $scope.currentItem.name;
        $scope.model_desc = $scope.currentItem.desc;
        $scope.patient = $scope.currentModel.patient;
        $scope.schema = $scope.currentModel.schema;
        $scope.lookup = $scope.currentModel.lookup;
        joinFunc = $scope.currentModel.join;
        console.log(joinFunc);
        $scope.orightml = JSON.stringify($scope.schema, null, 4);
        $scope.seltype = 'data';
        $scope.join();
        return $scope.orightml;
      };

      $scope.setupAddModel = function () {
        $scope.setContent('addmodel.hjs');
        $scope.content_model1 = '/static/load_model1.hjs';
        $scope.currentItem = $scope.models[1];
        $scope.currentModel = $scope.currentItem.src;
        $scope.model_name = $scope.currentItem.name;
        $scope.model_desc = $scope.currentItem.desc;
        $scope.patient = $scope.currentModel.patient;
        $scope.schema = $scope.currentModel.schema;
        $scope.lookup = $scope.currentModel.lookup;
        joinFunc = $scope.currentModel.join;
        console.log(joinFunc);
        $scope.orightml = JSON.stringify($scope.patient, null, 4);
        $scope.seltype = 'data';

        if ($scope.currentModel.lookup !== undefined && $scope.currentModel.lookup.plotOutput !== undefined){
            plotEqn = eval('(function(probability) {'+$scope.lookup.plotOutput+'})');
            PlotData.setEquation(plotEqn);
            $scope.hasPlot = true;
        }
        else { $scope.hasPlot = false; }

        console.log($scope.currentModel.patient);
        console.log($scope.currentModel);
        console.log(joinFunc);

        $scope.join();
        // $scope.setOrigModelHtml();
        console.log("Seltype - ");
        console.log($scope.seltype);
        console.log($scope.orightml);

        return $scope.orightml;
      };

      $scope.setSelected = function() {
        $scope.content = '/static/editmodel.hjs';
        $scope.content_model = '/static/load_model.hjs';
        $scope.currentItem = this.model;
        $scope.currentModel = this.model.src;
        $scope.model_name = this.model.name;
        $scope.model_desc = this.model.desc;
        $scope.patient = $scope.currentModel.patient;
        $scope.schema = $scope.currentModel.schema;
        $scope.lookup = $scope.currentModel.lookup;
        joinFunc = $scope.currentModel.join;
        console.log(joinFunc);
        $scope.orightml = JSON.stringify($scope.patient, null, 4);
        $scope.seltype = 'data';

        if ($scope.currentModel.lookup !== undefined && $scope.currentModel.lookup.plotOutput !== undefined){
            plotEqn = eval('(function(probability) {'+$scope.lookup.plotOutput+'})');
            PlotData.setEquation(plotEqn);
            $scope.hasPlot = true;
        }
        else { $scope.hasPlot = false; }

        console.log($scope.currentModel.patient);
        console.log($scope.currentModel);
        console.log(joinFunc);

        $scope.join();
        // $scope.setOrigModelHtml();
        console.log("Seltype - ");
        console.log($scope.seltype);
        console.log($scope.orightml);
      };

      $scope.bracket = function(num, obj){
          var k = [];
          for (o in obj) k.push(obj[o].index);
          k.sort(function(a, b) { return a < b ? 1 : -1});
          for (i=0; i<k.length;i++){
              if (num >= k[i]) return obj[i];
          }
      };

      $scope.maxmodels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

      $scope.genGraph = function() {
        setGraph();
      };

      $scope.today = function () {
        $scope.maxDate = new Date();
      };
      $scope.today();

      function setGraph () {
        $scope.chartObject = {};
        var rows = [];
        var i;
        for (i = 0; i < $scope.models.length; i++) {
          rows[i] = {c: [
              {v: $scope.models[i].name},
              {v: $scope.models[i].downloads},
          ]};
        }
        $scope.chartObject.data = {"cols": [
            {id: "t", label: "Medical Model", type: "string"},
            {id: "s", label: "Downloads", type: "number"}
        ], "rows":rows };

        //$routeParams.chartType == BarChart or PieChart or ColumnChart...
        $scope.chartObject.type = 'BarChart';
        $scope.chartObject.options = {
            'title': 'How many times each model has been downloaded'
        }
      };

      $scope.orderByField = 'downloads';
      $scope.reverseSort = true;

      $scope.queryIdeas = function (startDate, endDate, maxModels) {
        if (startDate) {
          if(endDate) {
            if(startDate > endDate) {
              $window.alert("Invalid Input: Please enter a start date that occurs before the end date");
            } else {
              if(maxModels) {
                console.log(startDate);
                console.log(endDate);
                console.log(maxModels);
                var dateConc = startDate + "++" + endDate + "++" + maxModels;
                var url = "/models/get/date/" + dateConc;
                console.log(url);
                $http.get(url)
                    .success(function(data, status, headers, config) {
                  // console.log(data);
                  $scope.modelsfil = data;
                  $scope.error = "";
                }).
                error(function(data, status, headers, config) {
                  $scope.modelsfil = {};
                  $scope.error = data;
                });

                $scope.maxshow = maxModels;
                $scope.orderByField = 'likes';
                $scope.reverseSort = true;
              } else {
                $window.alert("Invalid Input: Please enter valid maximum models for the query");
              }
            }
          } else {
            $window.alert("Invalid Input: Please enter valid end date for the query");
          }
        } else {
          $window.alert("Invalid Input: Please enter valid start date for the query");
        }
      };
  }]);
