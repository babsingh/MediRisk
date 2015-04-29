angular.module('application', ['ionic', 'autofields', 'application.controllers', 'application.services'])

    .run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
    })

    .config(function ($stateProvider, $urlRouterProvider) {

        $stateProvider

            .state('models', {
                url: '/models',
                templateUrl: 'templates/model-list.html',
                controller: 'ModelListCtrl'
            })

            .state('load', {
                url: '/load/:param',
                templateUrl: 'templates/load-model.html',
                controller: 'LoadCtrl'
            })

            .state('plot', {
                url: '/plot',
                templateUrl: 'templates/plot.html',
                controller: 'PlotCtrl'
            })

            .state('menu', {
                url: '/',
                templateUrl: 'templates/menu.html'
            })
            
			.state('legal', {
                url: '/legal',
                templateUrl: 'templates/legal.html'
            })
			
			.state('instructions', {
                url: '/instructions',
                templateUrl: 'templates/instructions.html'
            });

        $urlRouterProvider.otherwise('/');

    })

    .config(['$autofieldsProvider', function($autofieldsProvider){
        // Checkbox Field Handler
        $autofieldsProvider.registerHandler('checkbox', function(directive, field, index){
            var fieldElements = $autofieldsProvider.field(directive, field, '<input/>');
            var lbl = '';

            if(fieldElements.label) {
                lbl = fieldElements.label.html();
                fieldElements.label.text('');
                fieldElements.label.append(fieldElements.input);
            }
			fieldElements.label.addClass('checkbox');
			fieldElements.fieldContainer.removeClass('checkbox');
			fieldElements.fieldContainer.addClass('item item-checkbox item-text-wrap');
			fieldElements.fieldContainer.append(lbl);
            return fieldElements.fieldContainer;
        });

		$autofieldsProvider.registerHandler('number', function(directive, field, index){
			var fieldElements = $autofieldsProvider.field(directive, field, '<input/>');
            var lbl = '';

            if(fieldElements.label) { lbl = fieldElements.label.html(); }
            fieldElements.label.remove();
            var span = angular.element('<span>');
            span.addClass('input-label');
            span.text(lbl);
            fieldElements.fieldContainer.prepend(span);
			fieldElements.fieldContainer.removeClass('number valid');
			fieldElements.fieldContainer.addClass('item item-input item-stacked-label');

			var fixUrl = (field.fixUrl ? field.fixUrl : directive.options.fixUrl);
			if(field.type == 'url' && fixUrl) fieldElements.input.attr('fix-url','');

			return fieldElements.fieldContainer;
		});

		$autofieldsProvider.registerHandler('select', function(directive, field, index){
			var defaultOption = (field.defaultOption ? field.defaultOption : directive.options.defaultOption);
			var fieldElements_ = $autofieldsProvider.field(directive, field, inputHtml, inputAttrs);
            var lbl = '';

            if(fieldElements_.label) { lbl = fieldElements_.label.html(); }

			var inputHtml = '<div class="input-label">'+lbl+'</div><select><option value="">'+defaultOption+'</option></select>';
			var inputAttrs = {
				ngOptions: field.list
			};

			var fieldElements = $autofieldsProvider.field(directive, field, inputHtml, inputAttrs);
            fieldElements.label.remove();
			fieldElements.fieldContainer.removeClass('select valid');
			fieldElements.fieldContainer.addClass('item item-input item-select');
			return fieldElements.fieldContainer;
		});
    }]);
