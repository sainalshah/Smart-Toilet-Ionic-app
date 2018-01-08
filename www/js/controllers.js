angular.module('starter.controllers', ['ionic.cloud'])
.constant("expectedMinWaterAbsorbance",0.700)
.controller('AppCtrl',function($scope,$state, $ionicHistory,$rootScope,accountFactory,$ionicPush) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $rootScope.side_menu = document.getElementsByTagName("ion-side-menu")[0];
  $scope.showMenuToggle = true;
  $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromParams, toParams) {
    if (toState.name != 'app.showMap') {
      $rootScope.side_menu.style.visibility = "visible";
      $scope.showMenuToggle = true;
      console.log("changed menuToggle to ",$scope.showMenuToggle);
    }
    else{
      $scope.showMenuToggle = false;
      console.log("changed menuToggle to ",$scope.showMenuToggle);
    }
  });
  $scope.logout = function(){
    accountFactory.logout().get(function () {
      console.log("inside logout callback");
      $scope.error="";
      accountFactory.verifiedUser = {};
      $scope.verifiedUser = false;
      $state.go("app.home");
    });
    $ionicHistory.clearCache().then(function() {
      $ionicPush.unregister().then(function(t) {
        return $ionicPush.saveToken(t);
      }).then(function(t) {
        console.log('Token saved:', t.token);
      });
      //now you can clear history or goto another state if you need
      $ionicHistory.clearHistory();
      $ionicHistory.nextViewOptions({ disableBack: true, historyRoot: true });
      $state.go('app.home');
    })
  };

})
.controller('MapController',function($scope,$state,$rootScope,mapService) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});
  var markerSet = false;

  function addMarkers(data, callback) {
    var markers = [];
    function onMarkerAdded(marker) {
      markers.push(marker);
      if (markers.length === data.length) {
        callback(markers);
      }
    }
    data.forEach(function(markerOptions) {
      map.addMarker(markerOptions, onMarkerAdded);
    });
  }
  angular.element(document).ready(function () {
    // var div = angular.element("#map_canvas");
    // Initialize the map view
    $rootScope.side_menu.style.visibility = "hidden";
    var div = document.getElementById("map_canvas");
    console.log("Map canvas ",div);
    map = plugin.google.maps.Map.getMap(div);
    position = mapService.getPosition();
    // Wait until the map is ready status.
    map.addEventListener(plugin.google.maps.event.MAP_READY, onMapReady);
    function onMapReady() {
      console.log("helloo!!!! from map ready");
      console.log(position);
      clinicLocations = mapService.getClinicLocations();
      console.log(clinicLocations);
      // map.addMarker({
      //   'position': position
      // });
      if(!markerSet){
        addMarkers(clinicLocations, function(markers) {
          markers[mapService.index].showInfoWindow();
        });
        markerSet = true;
      }
      map.animateCamera({
        target: position,
        zoom: 17,
        tilt: 60,
        bearing: 140,
        duration: 1000,
        padding: 0  // default = 20px
      }, function() {
        //alert("Camera target has been changed");
      });
      // var button = document.getElementById("button");
      // button.addEventListener("click", onBtnClicked, false);
    }
  });

})
.controller('appointmenCtrl',['$scope','$rootScope','$state','appointmentFactory','accountFactory','$cordovaGeolocation','mapService','$ionicLoading',
function($scope,$rootScope,$state,appointmentFactory ,accountFactory,$cordovaGeolocation,mapService,$ionicLoading) {
  function getLocationDetails(clinic_id){
    for (var i=0;i<$scope.clinics.length;i++)
    {
      if($scope.clinics[i].clinic_id == clinic_id){
        return {coordinates:$scope.clinics[i].coordinates,index:i};
      }
    }
    return null;
  }
  var from = 0;
  $scope.switchFrom = function () {
    if(from == 0){
      $scope.from = "home";
      $scope.current = "current location";
      from = 1;
      $cordovaGeolocation
      .getCurrentPosition(posOptions)
      .then(function (position) {
        var lat  = position.coords.latitude;
        var long = position.coords.longitude;
        locationStr = lat+","+long;
        console.log(lat,long);
        appointmentFactory.getClinic().query({id:locationStr},
          function(response){
            $scope.msg = "";
            $scope.clinics = response;
            $scope.data.clinic_id = response[0].clinic_id;
            console.log(response);
          },
          function(response){
            console.log("error");
            $scope.msg = "cannot retrieve available clinics";
          }
        );
      }, function(err) {
        // error
      });
    } else {
      from = 0;
      $scope.from = "current location";
      $scope.current  = "home";
      locationStr = accountFactory.verifiedUser.coordinates;
      appointmentFactory.getClinic().query({id:locationStr},
        function(response){
          $scope.msg = "";
          $scope.clinics = response;
          $scope.data.clinic_id = response[0].clinic_id;
          console.log(response);
        },
        function(response){
          console.log("error");
          $scope.msg = "cannot retrieve available clinics";
        }
      );
    }
  };

  $scope.switchFrom();
  $scope.showMap = function () {
    console.log("clinic_id, ",$scope.data.clinic_id);
    if($scope.data.clinic_id != -1){
      mapService.setClinicLocations($scope.clinics);
      mapService.setPosition(getLocationDetails($scope.data.clinic_id));
      console.log("location set, ",mapService.getPosition());
      $state.go("app.showMap");
    }
    console.log("showing map");
    var sApp = startApp.set({ /* params */
      "action":"ACTION_VIEW",
      "type":"text/css",
      "package":"com.google.android.apps.maps",
      "uri":"geo:37.7749,-122.4194"
    });
    sApp.start(function() { /* success */
      console.log("OK");
    }, function(error) { /* fail */
      alert(error);
    });
  }
  var posOptions = {timeout: 10000, enableHighAccuracy: false};

  $scope.msg = "Loading available clinics";

  var today = new Date();
  $scope.data = {clinic_id:"",appointment_date:today,time_of_day_id:"1"};
  $scope.requestAppointment = function () {
    $rootScope.showSpinner();
    $scope.data.appointment_date = $scope.data.appointment_date.format("yyyy-mm-dd");
    $scope.data.patient_id = accountFactory.verifiedUser.user_id;
    //$scope.data.clinic_id = $scope.data.clinic_id.clinic_id;
    console.log($scope.data);
    appointmentFactory.getAppointment().save($scope.data,function (success) {
      //console.log("successfully registered");
      console.log(success);
      $rootScope.hideSpinner();
      if(success.result.code == 1){
        alert("Appointment registered");
      } else {
        alert("Appointment registration failed. Try again");
      }
      $state.go('app.scan');
      //$location.path(/);
    },function (err) {
      //console.log("err registering");
      alert("Appointment registration failed. Try again");
    });
  };

}])


.controller('LoginController',
['$scope', '$rootScope', '$location','accountFactory','$location','$state','$ionicPush','$ionicLoading','pushService',
function ($scope, $rootScope, $location,accountFactory,$location,$state,$ionicPush,$ionicLoading,pushService) {

  $scope.error="";
  $scope.verifiedUser = false;

  $scope.data = {username:"dar@gmail.com",password:"password"};
  $scope.logout = function () {
    accountFactory.logout().get(function () {
      console.log("inside logout callback");
      $scope.error="";
      accountFactory.verifiedUser = {};
      $scope.verifiedUser = false;
    });
  }
  $scope.login = function () {
    $rootScope.showSpinner();
    $scope.dataLoading = true;
    console.log($scope.data);
    accountFactory.login().save($scope.data,function(response){
      $rootScope.hideSpinner();
      console.log(response);
      accountFactory.verifiedUser = response.user;
      $ionicPush.register().then(function(t) {
        return $ionicPush.saveToken(t);
      }).then(function(t) {
        token = t.token;
        console.log('Token saved:', t.token);
        console.log(t);
        pushService.getData().update({user_id:accountFactory.verifiedUser.user_id,token:t.token});
      });

      $state.go('app.scan');
    },
    function (error) {
      console.log(error.msg);
      $scope.msg=error.msg;
    });
  };
}])
.controller('RegisterController',['$rootScope','$scope','accountFactory', '$state', '$ionicLoading',function($rootScope,$scope,accountFactory,$state,$ionicLoading) {

  $scope.signUpSuccess = false;
  $scope.data = {username:"",password:"",contact:"",email:"",role_id:1,postal_code:""}

  $scope.signup = function () {
    $rootScope.showSpinner();
    console.log($scope.data);
    accountFactory.signUp().save($scope.data,function(response){
      $rootScope.hideSpinner();
      console.log(response);
      $scope.signUpSuccess = true;
      $state.go('app.home');
    });
  }
}])
.controller('scanCtrl',['$scope' ,'$rootScope','$cordovaCalendar','$ionicPopup','resultFactory',
'accountFactory','AuthenticationService', 'expectedMinWaterAbsorbance', 'scanDataService' ,'$ionicLoading',
function ($scope,$rootScope, $cordovaCalendar,
  $ionicPopup,resultFactory,accountFactory,AuthenticationService,expectedMinWaterAbsorbance,scanDataService,$ionicLoading) {

    $scope.data = {};
    $scope.data.patient_id = accountFactory.verifiedUser.user_id;
    var data = accountFactory.verifiedUser.user_id
    console.log(accountFactory.verifiedUser.user_id);
    console.log(data);
    console.log(  $scope.data.patient_id );

    console.log("otw get initialResult");


    resultFactory.getInitialResult().get({id:data},
      function(response){
        console.log("in get initialResult");

        $scope.initialResult = response.data;
        console.log($scope.initialResult);
        Showresult($scope.initialResult);
        console.log(response);
      },
      function(response){
        console.log("error");
      }

    );

    var Showresult = function(data){
      console.log("data to display, ",data);
      angular.forEach(data,function (value,key) {

        if(value.parameter_id==1){
          console.log("par 1")
          if(value.isNormal==true){
            $scope.par1 = true;
            console.log("par 1 true");
            $scope.par1condition="Normal";
          }else if(value.isNormal==false){
            $scope.par1 = false;
            console.log("par 1 false");
            $scope.par1condition="Not Normal";
          }
        }else if(value.parameter_id==2){
          console.log("par 2");
          if(value.isNormal==true){
            $scope.par2 = true;
            console.log("par 2 true");

            $scope.par2condition="Normal";
          }else if(value.isNormal==false){
            $scope.par2 = false;
            console.log("par 2 false");
            $scope.par2condition="Not Normal";

          }
        }
        else if (value.parameter_id===null){
          $scope.result = "No last scan result, try your first scan";
          console.log($scope.result)
        }
      })
    }
    $scope.isReadyToScan = false;
    $scope.status = "Connecting...";
    if($rootScope.connectedOnce){
      $scope.isReadyToScan = true;
      $scope.status = "Connected";
    }
    var search=function(){
      $rootScope.showSpinner();
      function success() {
        $rootScope.connectedOnce = true;
        $rootScope.hideSpinner();
        scope.isReadyToScan = true;
        console.log("success function called ");
        console.log(scope.status);
        scope.status = "Connected";
        scope.$apply();
      }
      function error(result) {
        $rootScope.hideSpinner();
        console.log(result);
        result = JSON.parse(result);
        console.log("search error called");
        console.log(result.msg);
        if(result.msg == "btoff"){
          nanoDevice.turnOnBT(function (result){
            result = JSON.parse(result);
            if(result.msg=="btStatusOn"){
              //alert("bt on");
              nanoDevice.startSearch(function (){
                $rootScope.hideSpinner();
                console.log("search started after turning on bt");
              },function (){
                $rootScope.hideSpinner();
                console.log("error starting search");
              });
            }
          },function (result) {
            console.log(result);
          });
        }
      }
      nanoDevice.startSearch(success,error);
    };
    angular.element(document).ready(function () {
      if(!$rootScope.connectedOnce){
        search(); //start search for bluetooth device when page is loaded
      }
    });
    var scope = $scope;
    console.log("in scanCtrl");
    $scope.scan=function(){
      $rootScope.showSpinner();
      function success(result) {
        $rootScope.hideSpinner();
        console.log(result);
        jsonData = JSON.parse(result);
        totalAbsorbance = 0;
        countAbsorbance = 0;
        for (var i = 0; i < jsonData.absorbance.length; i++) {
          if (jsonData.wavelength[i] >= 1050) {
            totalAbsorbance += jsonData.absorbance[i];
            countAbsorbance++;
          }
          if(jsonData.wavelength[i] > 1150){
            break;
          }
        }
        avgAbsorbance = totalAbsorbance/countAbsorbance;
        console.log("expectedAvgAbsorbance: "+expectedMinWaterAbsorbance);
        console.log("your avg absorbance: "+ avgAbsorbance);
        isNormal = avgAbsorbance < expectedMinWaterAbsorbance;
        if(isNormal == false){
          console.log("you have diabetes:(:(");
        }
        // console.log(jsonData);
        data = {glucose:{parameter_id:1}};
        function getPhData() {
          return {parameter_id:2,
            raw:"ph:6",
            isNormal:true
          }
        }
        data.ph = getPhData();
        data.glucose.raw = result;
        data.glucose.isNormal = isNormal;
        Showresult(data);
        data.patient_id = accountFactory.verifiedUser.user_id;
        scanDataService.getData().save(data,function (res) {
          console.log(res);
          if(res.success){
            alert("result uploaded");
          }
          else{
            alert("failed to upload result");
          }
        });
      }
      function error( msg) {
        $rootScope.hideSpinner();
        alert("Returned error: "+msg);
      }
      nanoDevice.scan(success,error);
    }

  }])

  .controller('notificationCtrl',['$scope','$location','notificationFactory','accountFactory','$ionicPush', function($scope,$location,notificationFactory,accountFactory,$ionicPush) {
    console.log("in the get notificationCtrl");
    $scope.nonoti = null;
    notificationFactory.getNotification().get({id:accountFactory.verifiedUser.user_id},function(success){
      if(success.data == null){
        $scope.nonoti = "No Notification";
      }else{
        $scope.patients=success.data;
        console.log($scope.patients)
      }
    })
  }])
  .controller('settingMenuCtrl', function($scope,fbService, accountFactory) {

    console.log("in the setting menu ctrl");
    $scope.connectFb = function () {
      console.log("in the connect to fb function");
      var fbLoginSuccess = function (userData) {
        console.log("UserInfo: ", userData);

        fbService.save({user_id:accountFactory.verifiedUser.user_id,fb_user_id:userData.authResponse.userID},
          function(response){
            if(response.status == 0){
              alert("Successfully connected to facebook");
            }
          });
        };

        facebookConnectPlugin.login(["public_profile"], fbLoginSuccess,
        function loginError (error) {
          console.error(error)
        }
      );
    };
  })
  .controller('settingCtrl', function($scope,$state,$location,settingService,accountFactory) {
    $scope.data = {ph_parameter:"", glucose_parameter:""};
    $scope.data.user_id = accountFactory.verifiedUser.user_id;
    settingService.getsettings().get({id:accountFactory.verifiedUser.user_id},function (success)  {
      console.log("settings retrieval success");
      console.log (success);
      $scope.data.ph_parameter = success.data[0].abnormal_threshold_days;
      $scope.data.glucose_parameter = success.data[1].abnormal_threshold_days
      console.log(success.data);
    });
    $scope.upload = function () {
      console.log($scope.data);
      settingService.getparameter().save($scope.data,function (success){
        $scope.error=success;
        if(success.code==0){
          console.log("here");
        }
      },
      function (error) {
        console.log(error.msg);
        $scope.error=error;
      });
      $state.go('app.scan');
    }
  })
  .controller('PatientViewFeedbackCtrl',['$scope', '$location', 'adviceService', 'accountFactory', function($scope, $location, adviceService, accountFactory){
    $scope.data = {};
    console.log(accountFactory.verifiedUser.user_id);
    adviceService.getfeedback().get({id:accountFactory.verifiedUser.user_id},function (success)  {
      console.log("feedback retrieval success");
      console.log (success);
      $scope.data=success.data;
      console.log(success.data);
      console.log($scope.data.comment);
    });
    $scope.back = function () {
      $location.path('/appointment');
    };
  }])
  .controller('profileCtrl',['$scope' ,function($scope) {


    // --------------------- Line Chart Configuration ----------------------------
    $scope.lineSeries = ['Date Scanned'];
    $scope.lineLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
    $scope.lineData = [
      [12, 5, 9, 14, 7, 4, 2]
    ];
    $scope.filter=function(number){


      Labels=[  ["10:00","11:05", "12:25", "14:45", "17:35", "19:20", "20:00"] ,  ["Mon", "Tues", "Wed", "Thrus", "Fri", "Saturday", "Sunday"],  ["Week 1","Week 2","Week 3", "Week 4"],  [14, 13, 10, 8, 7, 4, 2,14, 13, 10, 8, 7, 4, 2,14, 13, 10, 8, 7, 4, 2,14, 13, 10, 8, 7, 4, 2,2,2]];
      data=[  [[12, 5, 9, 14, 7, 4, 2]] ,  [[5, 9, 14, 7, 2, 4, 12]],  [[7, 6, 9, 12]],  [[14, 13, 10, 8, 7, 4, 2,14, 13, 10, 8, 7, 4, 2,14, 13, 10, 8, 7, 4, 2,14, 13, 10, 8, 7, 4, 2,2,2]]];
      console.log (data[number]);
      $scope.lineLabels=(Labels[number]);
      $scope.lineData=data[number];

    }
  }]);
