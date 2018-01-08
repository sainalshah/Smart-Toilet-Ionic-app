// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'chart.js','starter.controllers', 'starter.services',
'ngCordova','ngResource','ionic.cloud'])

.run(function($ionicPlatform,$rootScope,$ionicLoading) {
  $rootScope.showSpinner = function() {
    console.log("showing spinner");
    $ionicLoading.show({
      template: '<ion-spinner icon="android"></ion-spinner>'
    });
    setTimeout(function(){ $rootScope.hideSpinner(); }, 10000);
  };

  $rootScope.hideSpinner = function(){
    console.log("hiding spinner");
    $ionicLoading.hide();
  };
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }

    if (window.ga) {
      window.ga.trackView('Start application')
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})
.directive('connectFb', function() {
  return {
    link: function($scope, element) {

      element.on('click', function() {
        console.log("hello");
        $scope.connectFb();
      });
    }
  }
})
.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider,$ionicCloudProvider) {
  $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })
  .state('app.register', {
    url: '/register',
    views: {
      'menuContent': {
        templateUrl: 'templates/signup.html',
        controller: 'RegisterController'
      }
    }
  })
  .state('app.viewFeedback', {
    url: '/viewFeedback',
    views: {
      'menuContent': {
        templateUrl: 'templates/viewFeedback.html',
        controller: 'PatientViewFeedbackCtrl'
      }
    }
  })
  .state('app.showMap', {
    url: '/showMap',
    views: {
      'menuContent': {
        templateUrl: 'templates/clinicLocation.html',
        controller: 'MapController'
      }
    }
  })
  .state('app.paramSetting', {
    url: '/paramSetting',
    views: {
      'menuContent': {
        templateUrl: 'templates/parameterSetting.html',
        controller: 'settingCtrl'
      }
    }
  })
  .state('app.notification', {
    url: '/notification',
    cache:false,
    views: {
      'menuContent': {
        templateUrl: 'templates/notification.html',
        controller :'notificationCtrl'

      }
    }
  })
  .state('app.settingMenu', {
    url: '/settingMenu',
    views: {
      'menuContent': {
        templateUrl: 'templates/settingMenu.html',
        controller: 'settingMenuCtrl'
      }
    }
  })
  .state('app.scan', {
    url: '/scan',
    cache:false,
    views: {
      'menuContent': {
        templateUrl: 'templates/scan.html',
        controller :'scanCtrl'

      }
    }
  })
  .state('app.requestAppointment', {
    url: '/requestAppointment',
    views: {
      'menuContent': {
        templateUrl: 'templates/requestAppointment.html',
        controller: 'appointmenCtrl'
      }
    }
  })
  .state('app.home', {
    url: '/home',
    views: {
      'menuContent': {
        templateUrl: 'templates/home.html',
        controller:'LoginController'
      }
    }
  })


  .state('app.profile', {
    url: '/profile',
    views: {
      'menuContent': {
        templateUrl: 'templates/profile.html',
        controller: 'profileCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');
});
