angular.module('application.controllers', [])

    .controller('ModelListCtrl', ['$scope', 'LocalStorage', 'ServerSession', '$rootScope', function ($scope, LocalStorage, ServerSession, $rootScope) {

        $scope.status;

        getModels();
        $scope.doRefresh = getModels;
        $rootScope.getModels = getModels;
        function getModels () {
            $rootScope.models = med_models;
            for (var i=0; i < $rootScope.models.length; i++){
                $rootScope.models[i].position = i;
            }
            $rootScope.$broadcast('scroll.refreshComplete');
            // Server and local storage code
            // ServerSession.getModels ()
            //     .success(function (models) {
            //         console.log("success1");
            //         $rootScope.download()
            //         $rootScope.models = models;
            //         var i = 0;
            //         for (var i=0; i<$rootScope.models.length; i++){
            //             $rootScope.models[i].position = i;
            //         }
            //         console.log("success2");
            //     })
            //     .error(function (error) {
            //         $scope.status = 'Unable to load models: ' + error.message;
            //         console.log("offline?");
            //         $rootScope.load();
            //     })
            //     .finally(function() {
            //         // Stop the ion-refresher from spinning
            //         console.log("finally");
            //         $rootScope.$broadcast('scroll.refreshComplete');
            //     });
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

    var med_models = [{"_id":"553d3cf6818ae8e0288471c4","downloads":24.5,"author":"master.admin@gmail.com","timestamp":"2015-03-23T21:12:22.164Z","src":{"patient":{"age":50,"probability":20,"bloodtest":3000,"bloodtest_type":"one","platform_type":"one"},"schema":[{"property":"age","label":"Age in years (1-150)","type":"number","attr":{"min":1,"max":150,"ngChange":"join()"},"msgs":{"min":"You need a age no less than 1","max":"You need a age no greater than 150"},"validate":true},{"property":"probability","label":"Probability (0-100)","type":"number","step":"any","attr":{"min":0,"max":100,"ngChange":"join()"},"msgs":{"min":"You need a probability no less than 0","max":"You need a probability no greater than 100"},"validate":true},{"property":"bloodtest","label":"NT-proBNP test result (0-40000)","type":"number","attr":{"min":0,"max":40000,"ngChange":"join()"},"msgs":{"min":"You need a number no less than 0","max":"You need a number no greater than 40000"},"validate":true},{"property":"bloodtest_type","label":"NT-proBNP unit","type":"select","list":"key as value for (key,value) in lookup.bloodtest_types","attr":{"ngChange":"join()"},"validate":true},{"property":"platform_type","label":"Platform Type","type":"select","list":"key as value for (key,value) in lookup.platform_types","attr":{"ngChange":"join()"},"validate":true}],"lookup":{"likelihood":[{"index":73.5,"+LR":">15.12","-LR":"0.52","msg":"[placeholder]"},{"index":65,"+LR":">10","-LR":"0.34","msg":"[placeholder]"},{"index":47,"+LR":"2.05","-LR":"0.86","msg":"[placeholder]"},{"index":32.5,"+LR":"<0.1","-LR":"5.31","msg":"[placeholder]"},{"index":0,"+LR":"<0.01","-LR":"3.06","msg":"[placeholder]"}],"bloodtest_types":{"one":"pg/mL or ng/L","two":"pmol/L"},"platform_types":{"one":"Roche","two":"Siemens"},"plotOutput":"var age = $scope.patient['age'];var bloodtest = $scope.patient['bloodtest']; var type = $scope.patient['bloodtest_type']; if (type == 'two') { bloodtest = bloodtest*8.457; } var temp = (8 + (0.011*age) - (5.9*probability*0.01) - (2.3*(Math.log(bloodtest)/Math.LN10)) + (0.82*probability*0.01*(Math.log(bloodtest)/Math.LN10)));var result = (Math.pow((1 + Math.pow(Math.E, temp)), -1)*100);var output = 'Post-Test Probability=' + result.toFixed(2) + '%'; return result.toFixed(2);"},"join":"var age = $scope.patient['age'];var probability = $scope.patient['probability']; var type = $scope.patient['bloodtest_type']; var platformType = $scope.patient['platform_type']; var bloodtest = $scope.patient['bloodtest']; if (type == 'two') { bloodtest = bloodtest*8.457; } if (platformType == 'two') { bloodtest = ((0.821 * bloodtest) + 268.1); } var temp = (8 + (0.011*age) - (5.9*probability*0.01) - (2.3*(Math.log(bloodtest)/Math.LN10)) + (0.82*probability*0.01*(Math.log(bloodtest)/Math.LN10)));var result = (Math.pow((1 + Math.pow(Math.E, temp)), -1)*100);var output = 'Post-Test Probability=' + result.toFixed(2) + '%'; var output1 = '(Highly supportive for AHF Dx)'; var output2 = '(Highly supportive against AHF Dx)'; var lr = $scope.bracket(result, $scope.lookup['likelihood']); if(parseFloat(lr['+LR']) < 10) {output1 = '(Indeterminate for AHF)';} if(parseFloat(lr['-LR']) > 0.1) {output2 = '(Indeterminate for AHF)';} $scope.output_name = ['Post-Test Probability', 'LR+', 'LR-']; $scope.output_value = [result.toFixed(2), lr['+LR'] + ' ' + output1, lr['-LR'] + ' ' + output2];"},"logo":"img/lungs.png","desc":"Calculate accute heart failure likelihood","idref":"0","name":"SOB-HF","__v":0},{"_id":"553d3cf6818ae8e0288471c5","downloads":16.5,"author":"dark.star@gmail.com","timestamp":"2015-03-16T21:09:38.080Z","src":{"patient":{"dvt_symptoms":false,"pe_chances":false,"heart_rate":false,"immobilize_surgery":false,"dvt_previous":false,"hemoptysis":false,"malign_pall":false},"schema":[{"property":"dvt_symptoms","label":"Clinical Signs and Symptoms of DVT","type":"checkbox","validate":false,"attr":{"ngChange":"join()"}},{"property":"pe_chances","label":"PE Is #1 Diagnosis, or Equally Likely","type":"checkbox","validate":false,"attr":{"ngChange":"join()"}},{"property":"heart_rate","label":"Heart Rate > 100","type":"checkbox","validate":false,"attr":{"ngChange":"join()"}},{"property":"immobilize_surgery","label":"Immobilization at least 3 days, or Surgery in the Previous 4 weeks","type":"checkbox","validate":false,"attr":{"ngChange":"join()"}},{"property":"dvt_previous","label":"Previous, objectively diagnosed PE or DVT","type":"checkbox","validate":false,"attr":{"ngChange":"join()"}},{"property":"hemoptysis","label":"Hemoptysis","type":"checkbox","validate":false,"attr":{"ngChange":"join()"}},{"property":"malign_pall","label":"Malignancy w/ Treatment within 6 mo, or palliative","type":"checkbox","validate":false,"attr":{"ngChange":"join()"}}],"join":" var points = 0; var message = ''; if ($scope.patient['dvt_symptoms'] == true) {points += 3;} if ($scope.patient['pe_chances'] == true) {points += 3;} if ($scope.patient['heart_rate'] == true) {points += 1.5;} if ($scope.patient['immobilize_surgery'] == true) {points += 1.5;} if ($scope.patient['dvt_previous'] == true) {points += 1.5;} if ($scope.patient['hemoptysis'] == true) {points += 1;} if ($scope.patient['malign_pall'] == true) {points += 1;} if (points < 2) {message = 'Low risk group: 1.3% chance of PE in an ED population. ';} if (points >= 2 && points <= 6) {message = 'Moderate risk group: 16.2% chance of PE in an ED population. ';} if (points > 6) {message = 'High risk group: 40.6% chance of PE in an ED population. ';} if (points < 5) {message = message + 'Another study assigned scores ≤ 4 as PE Unlikely and had a 3% incidence of PE.';} if (points > 4) {message = message + 'Another study assigned scores > 4 as PE Likely and had a 28% incidence of PE.';} $scope.perc_rule = false; if (points < 2) { $scope.perc_rule = true; } var title = 'Points: ' + points; $scope.output_name = [title]; $scope.output_value = [message];"},"logo":"img/wells.jpg","desc":"Objectifies risk of pulmonary embolism","idref":"1","name":"Wells Score","__v":0},{"_id":"553d3cf6818ae8e0288471c6","downloads":18.5,"author":"luffy.senpai@gmail.com","timestamp":"2015-04-13T22:53:26.668Z","src":{"patient":{"age":false,"heart_rate":false,"o2_stat":false,"ven_thromb":false,"traum_sur":false,"hemoptysis":false,"exo_estrogen":false,"uni_leg_swell":false},"schema":[{"property":"age","label":"Age ≥ 50","type":"checkbox","validate":false,"attr":{"ngChange":"join()"}},{"property":"heart_rate","label":"HR ≥ 100","type":"checkbox","validate":false,"attr":{"ngChange":"join()"}},{"property":"o2_stat","label":"O2 Sat on Room Air < 95%","type":"checkbox","validate":false,"attr":{"ngChange":"join()"}},{"property":"ven_thromb","label":"Prior History of Venous Thromboembolism","type":"checkbox","validate":false,"attr":{"ngChange":"join()"}},{"property":"traum_sur","label":"Trauma or Surgery within 4 weeks","type":"checkbox","validate":false,"attr":{"ngChange":"join()"}},{"property":"hemoptysis","label":"Hemoptysis","type":"checkbox","validate":false,"attr":{"ngChange":"join()"}},{"property":"exo_estrogen","label":"Exogenous Estrogen","type":"checkbox","validate":false,"attr":{"ngChange":"join()"}},{"property":"uni_leg_swell","label":"Unilateral Leg Swelling","type":"checkbox","validate":false,"attr":{"ngChange":"join()"}}],"join":"var points = 0; var message = ''; if ($scope.patient['age'] == true) {points += 1;} if ($scope.patient['heart_rate'] == true) {points += 1;} if ($scope.patient['o2_stat'] == true) {points += 1;} if ($scope.patient['ven_thromb'] == true) {points += 1;} if ($scope.patient['traum_sur'] == true) {points += 1;} if ($scope.patient['hemoptysis'] == true) {points += 1;} if ($scope.patient['exo_estrogen'] == true) {points += 1;} if ($scope.patient['uni_leg_swell'] == true) {points += 1;} if (points == 0) { message = 'No need for further workup, as <2% chance of PE. Only valid when clinician\\'s pre-test probability is <15%.'} if (points > 0)  { message = 'If any criteria are positive, the PERC rule does not rule out PE in this patient. Perform a D-Dimer test';} $scope.output_name = ['Message']; $scope.output_value = [message];"},"logo":"img/wells.jpg","desc":"Criteria for ruling out pulmonary embolism if pre-test probability is <15%","idref":"2","name":"PERC Score","__v":0},{"_id":"553d3cf6818ae8e0288471c7","downloads":17.5,"author":"icongito.dual@gmail.com","timestamp":"2015-03-21T21:23:54.190Z","src":{"patient":{"corn_bypass":false,"vasc_disease":false,"intubation":false,"heart_rate":false,"walk_test":false,"ecg":false,"pulmonary":false,"hemo":false,"urea":false,"serum":false},"schema":[{"property":"corn_bypass","label":"Coronary bypass graft ","type":"checkbox","validate":false,"attr":{"ngChange":"join()"}},{"property":"vasc_disease","label":"Peripheral vascular disease intervention","type":"checkbox","validate":false,"attr":{"ngChange":"join()"}},{"property":"intubation","label":"Intubation for respiratory distress","type":"checkbox","validate":false,"attr":{"ngChange":"join()"}},{"property":"heart_rate","label":"Heart rate on arrival in ED ≥ 110/min","type":"checkbox","validate":false,"attr":{"ngChange":"join()"}},{"property":"walk_test","label":"Too ill to do walk test after treatment in ED (SaO2 < 90% or heart rate ≥ 120/min)","type":"checkbox","validate":false,"attr":{"ngChange":"join()"}},{"property":"ecg","label":"Acute ischemic changes on ECG","type":"checkbox","validate":false,"attr":{"ngChange":"join()"}},{"property":"pulmonary","label":"Pulmonary congestion evident on chest radiography","type":"checkbox","validate":false,"attr":{"ngChange":"join()"}},{"property":"hemo","label":"Hemoglobin < 100 g/L","type":"checkbox","validate":false,"attr":{"ngChange":"join()"}},{"property":"urea","label":"Urea ≥ 12 mmol/L","type":"checkbox","validate":false,"attr":{"ngChange":"join()"}},{"property":"serum","label":"Serum CO2 ≥ 35 mmol/L","type":"checkbox","validate":false,"attr":{"ngChange":"join()"}}],"lookup":{"adverse_event":[{"index":11,"event":"N/A","risk":"Very High","msg":"[placeholder]"},{"index":10,"event":"91.4","risk":"Very High","msg":"[placeholder]"},{"index":9,"event":"N/A","risk":"Very High","msg":"[placeholder]"},{"index":8,"event":"75.6","risk":"Very High","msg":"[placeholder]"},{"index":7,"event":"62.6","risk":"Very High","msg":"[placeholder]"},{"index":6,"event":"47.5","risk":"Very High","msg":"[placeholder]"},{"index":5,"event":"32.9","risk":"Very High","msg":"[placeholder]"},{"index":4,"event":"20.9","risk":"High","msg":"[placeholder]"},{"index":3,"event":"12.5","risk":"High","msg":"[placeholder]"},{"index":2,"event":"7.2","risk":"Medium","msg":"[placeholder]"},{"index":1,"event":"4.0","risk":"Medium","msg":"[placeholder]"},{"index":0,"event":"2.2","risk":"Low","msg":"[placeholder]"}]},"join":"var points = 0; if ($scope.patient['corn_bypass'] == true) {points += 1;} if ($scope.patient['vasc_disease'] == true) {points += 1;} if ($scope.patient['intubation'] == true) {points += 2;} if ($scope.patient['heart_rate'] == true) {points += 2;} if ($scope.patient['walk_test'] == true) {points += 2;} if ($scope.patient['ecg'] == true) {points += 2;} if ($scope.patient['pulmonary'] == true) {points += 1;} if ($scope.patient['hemo'] == true) {points += 3;} if ($scope.patient['urea'] == true) {points += 1;} if ($scope.patient['serum'] == true) {points += 1;} $scope.output_name = ['Points', 'Adverse event (%)', 'Risk Category']; var rk = $scope.bracket(points, $scope.lookup['adverse_event']); $scope.output_value = [points, rk['event'], rk['risk']];"},"logo":"img/copd.png","desc":"Make disposition decision for chronic obstructive pulmonary disease","idref":"3","name":"COPD Model","__v":0},{"_id":"553d3cf6818ae8e0288471c8","downloads":18.5,"author":"robert.douche@gmail.com","timestamp":"2015-04-21T20:39:58.395Z","src":{"patient":{"age":20,"sunburn":false,"alliumphobia":false,"no_reflection":false,"blood_type":"one"},"schema":[{"property":"age","label":"Age between 1-1000","type":"number","attr":{"min":1,"max":1000,"ngChange":"join()"},"msgs":{"min":"You need a age no less than 1","max":"You need a age no greater than 1000"},"validate":true},{"property":"blood_type","label":"Blood Type","type":"select","list":"key as value for (key,value) in lookup.bloodtest_types","attr":{"ngChange":"join()"},"validate":true},{"property":"sunburn","label":"Has Sunburn?","type":"checkbox","validate":false,"attr":{"ngChange":"join()"}},{"property":"alliumphobia","label":"Has Alliumphobia?","type":"checkbox","validate":false,"attr":{"ngChange":"join()"}},{"property":"no_reflection","label":"Has No Reflection?","type":"checkbox","validate":false,"attr":{"ngChange":"join()"}}],"lookup":{"bloodtest_types":{"one":"A","two":"B","three":"O","four":"AB"}},"join":"var vampirism; if ($scope.patient['age'] > 150) {vampirism = true;} if ($scope.patient['sunburn'] == true) {vampirism = true;} if ($scope.patient['alliumphobia'] == true) {vampirism = true;} if ($scope.patient['no_reflection'] == true) {vampirism = true;} var type = $scope.patient['blood_type']; if(type=='four'){vampirism = true;} var bloodtest = $scope.patient['bloodtest']; $scope.output_name = ['Are you a vampire?']; if (vampirism) {$scope.output_value = ['Yes'];} else {$scope.output_value = ['No'];}"},"logo":"img/vampire.jpg","desc":"Are you a vampire? Find out now!","idref":"4","name":"VAMP Model","__v":0}];