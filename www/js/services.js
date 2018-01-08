angular.module('starter.services', ['ngResource'])
// .constant("baseURL","https://ec2-13-228-111-202.ap-southeast-1.compute.amazonaws.com/")  //aws server
// .constant("baseURL","https://172.20.10.5:3443/") //xiu bin hotspot
.constant("baseURL","https://192.168.0.181:3443/") //my home
// .constant("baseURL","https://192.168.43.152:3443/") //aliif hotspot
// .constant("baseURL","https://192.168.1.8:3443/") //darrel home
// .constant("baseURL","https://192.168.43.70:3443/") //my hotspot
// .constant("baseURL","https://192.168.43.152:3443/") //darrel hotspot

.service('settingService', ['$resource', 'baseURL', function($resource,baseURL) {
  this.getparameter = function () {

    return $resource(baseURL+"parameter/:id",null,
    {'update':{method:'PUT' }});
  };
  this.getsettings = function () {
    return $resource(baseURL+"parameter/settings/:id",null,
    {'update':{method:'PUT' }});
  };
}])

.service('pushService', ['$resource', 'baseURL', function($resource,baseURL) {
  this.getData = function () {
    return $resource(baseURL+"notification/pushToken/:id",null,
    {'update':{method:'PUT' }});
  };
}])
.service('notificationFactory', ['$resource', 'baseURL', function($resource,baseURL) {
  this.getNotification = function () {
    return $resource(baseURL+"notification/:id",null,
    {'update':{method:'PUT' }});
  };
}])
.service('adviceService', ['$resource', 'baseURL', function($resource,baseURL) {
  var service = {};
  service.verifiedComment = {};
  this.ID = null;
  this.getfeedback = function() {
    return $resource(baseURL+"advice/viewFeedback/:id",null,
    {'update':{method:'PUT' }});
  };

}])
.service('mapService',  function() {
  this.position = {};
  this.clinicLocations = [];
  this.index = "";
  this.parsePosition = function (location) {
    locationArray = location.split(",");
    return {lat:parseFloat(locationArray[0]), lng:  parseFloat(locationArray[1])};
  }
  this.setPosition = function (location) {
    this.position = this.parsePosition(location.coordinates);
    this.index = location.index;
  }
  this.getPosition = function (location) {
    return this.position;
  }
  this.setClinicLocations = function (clinics) {
    for (var clinic of clinics)
    {
      var clinicInfo = {"title":clinic.clinic_name,"position":this.parsePosition(clinic.coordinates)};
      this.clinicLocations.push(clinicInfo);
    }
  }
  this.getClinicLocations = function (location) {
    return this.clinicLocations;
  }
})
.service('scanDataService', ['$resource', 'baseURL', function($resource,baseURL) {
  this.getData = function () {

    return $resource(baseURL+"scandata/:id",null,
    {'update':{method:'PUT' }});
  };
}])
.service('fbService', ['$resource', 'baseURL', function($resource,baseURL) {

  return $resource(baseURL+"connectFb/:id",null,
  {'update':{method:'PUT' }});
}])
.service('resultFactory', ['$resource', 'baseURL', function($resource,baseURL) {
  this.getInitialResult = function () {

    return $resource(baseURL+"scan/:id",null,
    {'update':{method:'PUT' }});
  };
}])
.service('appointmentFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
  this.getClinic = function () {

    return $resource(baseURL + "clinic/:id", null, {
      'update': {
        method: 'PUT'
      }
    });
  };
  this.getAppointment = function () {

    return $resource(baseURL + "appointment/:id", null, {
      'update': {
        method: 'PUT'
      }
    });
  };
}])
.service('accountFactory', ['$resource', 'baseURL', function($resource,baseURL) {
  this.verifiedUser = {};
  this.login = function () {

    return $resource(baseURL+"patientLogin/:id",null,
    {'update':{method:'PUT' }});
  };
  this.logout = function () {

    return $resource(baseURL+"logout/:id",null,
    {'update':{method:'PUT' }});
  };
  this.signUp = function () {

    return $resource(baseURL+"patientSignup/:id",null,
    {'update':{method:'PUT' }});
  };

  // implement a function named getPromotion
  // that returns a selected promotion.
  this.getAccount = function () {

    return $resource(baseURL+"Register/:id",null,
    {'update':{method:'PUT' }});
  };

}])

.factory('AuthenticationService',
['Base64', '$http', '$rootScope', '$timeout','$window',
function (Base64, $http, $rootScope, $timeout, $window) {
  var service = {};

  service.Login = function (username, password, callback) {

    /* Dummy authentication for testing, uses $timeout to simulate api call
    ----------------------------------------------*/
    // $timeout(function(){
    //   var response = { success: username === 'test' && password === 'test' };
    //   if(!response.success) {
    //     response.message = 'Username or password is incorrect';
    //   }
    //   callback(response);
    // }, 1000);


    /* Use this for real authentication
    ----------------------------------------------*/
    var data = { username: username, password: password };
    console.log(data);
    $http.post('/login', { username: username, password: password })
    .then(function (response) {
      console.log("response is ");
      console.log(response);
      callback(response);
    });

  };

  service.SetCredentials = function (username, password) {
    var authdata = Base64.encode(username + ':' + password);

    $rootScope.userinfo = {
      currentUser: {
        username: username,
        authdata: authdata
      }
    };

    var now = new $window.Date(),
    // this will set the expiration to 6 months
    exp = new $window.Date(now.getFullYear(), now.getMonth()+6, now.getDate());
    console.log("cookie expires: "+exp);
    $cookies.putObject('userinfo', $rootScope.userinfo, {'expires': exp});
  };

  service.ClearCredentials = function () {
    $rootScope.userinfo = {};
    $cookies.remove('userinfo');
    $http.defaults.headers.common.Authorization = 'Basic ';
  };

  return service;
}])

.factory('Base64', function () {
  /* jshint ignore:start */

  var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  return {
    encode: function (input) {
      var output = "";
      var chr1, chr2, chr3 = "";
      var enc1, enc2, enc3, enc4 = "";
      var i = 0;

      do {
        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
          enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
          enc4 = 64;
        }

        output = output +
        keyStr.charAt(enc1) +
        keyStr.charAt(enc2) +
        keyStr.charAt(enc3) +
        keyStr.charAt(enc4);
        chr1 = chr2 = chr3 = "";
        enc1 = enc2 = enc3 = enc4 = "";
      } while (i < input.length);

      return output;
    },

    decode: function (input) {
      var output = "";
      var chr1, chr2, chr3 = "";
      var enc1, enc2, enc3, enc4 = "";
      var i = 0;

      // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
      var base64test = /[^A-Za-z0-9\+\/\=]/g;
      if (base64test.exec(input)) {
        window.alert("There were invalid base64 characters in the input text.\n" +
        "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
        "Expect errors in decoding.");
      }
      input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

      do {
        enc1 = keyStr.indexOf(input.charAt(i++));
        enc2 = keyStr.indexOf(input.charAt(i++));
        enc3 = keyStr.indexOf(input.charAt(i++));
        enc4 = keyStr.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        output = output + String.fromCharCode(chr1);

        if (enc3 != 64) {
          output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
          output = output + String.fromCharCode(chr3);
        }

        chr1 = chr2 = chr3 = "";
        enc1 = enc2 = enc3 = enc4 = "";

      } while (i < input.length);

      return output;
    }
  };

  /* jshint ignore:end */
});
