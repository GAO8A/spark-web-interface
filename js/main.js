var token = localStorage.getItem("token");

//  declares anonymous function that retrieves value 'token' from local storage.

var devices = [];

// empty array 'devices'

function logIn() {
  var context = $('#login');

  // 'context' is binded to the div with id login in DOM

  $(context).removeClass('has-error'); // seems to work
 // $('.has-error', context).removeClass('has-error'); // old
  // removes the class .has-error in context
  

  $(context).removeClass('panel-danger');
// removes the panel-danger class in context

  $('.alert', context).hide();
// hides the element alert

  if ($('#email', context).val() == '') {
  // if the  value in the text input (id field), in context, is empty
    $('#email', context).parent().addClass('has-error');
    //add the class has-error to the email div (id email) in context
    return false;
  }

  if ($('#password', context).val() == '') {
    $('#password', context).parent().addClass('has-error');
    return false;
    // same as above, if the password is empty, then add the class has-error to context
  }

  // $('input', context).attr('disabled', 'disabled'); 
  // old, attr shouldnt be used
  // as disabled is delt with .prop
  $('input', context).prop('disabled', 'disabled');
  // element input in context sets the disabled property as disabled
  $('input[type=submit]', context).val('Logging in...');
  // changes the value of the submit button (text) to 'logging in...'

  jQuery.ajax('https://api.spark.io/oauth/token', {
    type: 'POST',
        // makes a POST request to spark's oauth server to get access token
    data: {
      'username': $('#email', context).val(),
      // the username req'd by the server will be the value in the div id email 
      // (in context)
      'password': $('#password', context).val(),
      // the password req'd by the server will be the value in the div id password 
      // (in context)
      'grant_type': 'password'
      // sets the grant type as 'password' as req'd by Spark Cloud API
    },


    success: function(result){
      // if the ajax POST call is successfull, pass and expect a  'result' arg...
      token = result.access_token;
      console.log(result.access_token);
      //the token will become the result's .access_token value
      localStorage.setItem("token", token);
      // now set that token in the local storage
      getDevices();
      // run function getDevices
      // the functionality of 'getDevices'
      // sends a Http GET request to api.spark.io to get devices associated with account
      // sends access token value 
      // the result of the GET call will be assigned to devices
      // var deviceString assigned empty value.

      $('#login').hide();
      // the  elements with the id of 'login' will hiddent
      $('#interface').show();
      // the elements with the ids of 'interface will show'
    },


    error: function(result){
      // if the ajax POST call is unsuccessfull, pass and expect a 'result' arg...
      // $('input', context).removeAttr('disabled', 'disabled');
      //old, should use removeProp for disabled property,
      $('input', context).removeProp('disabled', 'disabled');
      // removes the disabled value in disabled property in input elements
      $(context).addClass('panel-danger');
      // adds the class 'panel-danger' to the context (or anything with id 'login')
      $('input[type=submit]', context).val('Log in');
      // changes the value of the submit input element back to 'Login'
      $('.alert', context).text(result.responseJSON.error_description).show();
      console.log(result.responseJSON.error_description);
      // get the text contents in the responseJSON.error_description' in the 'results' arg that's expected 
      // show the alert class with the contents.
      // NB: responseJSON.error_description will contain something like 'User credentials are invalid' if error 400 BAD REQUEST.
      
      $('#password', context).val('')
      // the password field will be set to blank
    },
    beforeSend: function (xhr) {
    // callback beforeSend is triggered before the AJAX POST is sent, does an anon function that expects an arg 'xhr' or XMLHttpRequest
      xhr.setRequestHeader ("Authorization", "Basic c3Bhcms6c3Bhcms=");
    //A client must be sent in HTTP Basic auth, but it does not matter what the client credentials are—just use client ID spark, password spark.
    // c3Bhcms6c3Bhcms= is just base64 encoded 'spark:spark'
    // the xhr will give a basic access authentication (username and password)
    }
  });

  return false;
}

function logOut() {
  localStorage.removeItem("token");
  window.location.reload();
}
// the logout function removes the token variable and reloads your page.


function getDevices(){
  jQuery.get('https://api.spark.io/v1/devices', {'access_token': token}, 
    function(result){
    devices = result;
    var devicesString = '';
// fuction 'getDevices' 
// sends a Http GET request to api.spark.io to get devices associated with account
// sends access token value 
// the result of the GET call will be assigned to devices
// var deviceString assigned empty value.


  if (result.length > 0) {
    // if there is a device (result) then
      devicesString += '<table class="table table-striped">';
      // deviceString =  deviceString + '<table class="table table-striped">' 
      // this begins the device string structure that's going to appear in the DOM,
      // makes a <table> elemnt and gives it a class of 'table table-striped'
      


   for (i in result) {
    // for every time there is a result > 0 (AKA a detected device)...
        var device = result[i];
    // var device will assigned the value of the instance that a device appeared

        devicesString += '<tr data-device-id="' + device['id'] + '"><td><strong>' + device['name'] + '</strong><div class="spinner"><div></div><div></div><div></div></div></td>' +
                         '<td class="small">' + device['id'] + '</td>' +
                         '<td>' + (device['connected'] ? '<span class="label label-success">ONLINE</span>' : '') + '</td></tr>';

        getDeviceInfo(device['id']);
      }

      // deviceString will be built as with the neccessary information from the Http GET
      devicesString += '</table>';
      // and append the end of the table element at the end of the deviceString
    } else {
      devicesString = '<h5>No devices found</h5>';

    // if this function cannot be completed, then clearly no device was detected. Prompt the user 'No device found'
    // in the h5 element
    }

    $('#cores .panel-body').html(devicesString);
  });
// sets the contents (when the element id is cores with class of 'panel-body') to that of 'deviceString' built above.
}

function getDeviceInfo(deviceId) {
// function 'getDeviceInfo' facilitates an argument 'deviceId'
  jQuery.get('https://api.spark.io/v1/devices/' + deviceId, {
    'access_token': token
  },
// sends a Http GET request to api.spark.io/v1/devices with the deviceId appended to it
// along with the devices access token value.


   function(result){
    $('#cores [data-device-id=' + result.id + '] .spinner').remove();
// runs a function with the result of the Http GET by removing the spinner of the associated core 



    // Show functions
    if (result.functions != null && result.functions.length > 0) {
       for (i in result.functions) {
        var func = result.functions[i];
 // func is assigned the amount of functions in accordance to the device id (result)
        $('#functions tbody').append(
  // if the functions in the result (deviceId) are not null nor do they contain zero charcters...
          '<tr><td><strong>' + func + '</strong></td>' +
          '<td>' + result.name + '</td>' +
          '<td><button class="btn btn-default btn-xs" onclick="execute(\'' + result.id + '\', \'' + func + '\', null)">Execute</button></td></tr>'
        );

  // append a table of functions to the tbody of the element with id of 'fuctions'
      }
      $('#functions').show();
  // once the above is complete display the element with the id of functions.
    }

    // Show variables
    if (result.variables != null) {
      for (variable in result.variables) {
        var type = result.variables[variable];

        $('#variables tbody').append(
          '<tr data-device-id="' + result.id + '" data-variable-name="' + variable + '"><td><strong>' + variable + '</strong></td>' +
          '<td>' + type + '</td>' +
          '<td>' + result.name + '</td>' +
          '<td>?</td>' +
          '<td><button class="btn btn-default btn-xs" onclick="update(\'' + result.id + '\', \'' + variable + '\')">Update</button></td></tr>'
        );
      }
      $('#variables').show();
    }
  });
}

// same as above but the variables of said function.

// this doesnt seem to work?

function execute(deviceId, func, params) {
  if (params == null) params = prompt('Any parameters?');
  if (params == null) params = '';

// this is for the execute button, function 'execute' accomodates arguments 'deviceId', 'func' and 'params'
// all this does is check if the params field is empty then ask if there are any paramters and empties the variable params.

//old format...
  // var deviceName = devices.reduce(function(previous, current, index, array){
  //   return array[index].id == deviceId ? array[index].name : null;
  // });


var deviceName = devices.reduce(function(previous, current, index, array){return array[index].id == deviceId ? array[index].name : null;});
// invokes the same number of callbacks as per devices
//todo...

  // the device name is the reduced value of 

  // if the 'de

  var row = $(
    '<tr><td><strong>' + deviceName + '-&gt;' + func + '</strong></td>' +
    '<td>' + params + '</td>' +
    '<td><div class="spinner"><div></div><div></div><div></div></div></td>' +
    '<td><button class="btn btn-default btn-xs" onclick="execute(\'' + deviceId + '\', \'' + func + '\', \'' + params + '\')">Execute</button></td></tr>'
  );

  // i think this builds each row in the execution history table

  $('#execution-history tbody').prepend(row);
  // adds a new row to the beginning of the execution history table
  $('#execution-history').show();
  // show element that has id execution history

  jQuery.post('https://api.spark.io/v1/devices/' + deviceId + '/' + func + '/', {
    'access_token': token,
    'args': params
  }, function(result){
    $('.spinner', row).remove();
    $('td:nth-child(3)', row).text(result.return_value);
  });

}

// a Http call (POST) to the spark api.
// the arg builds the url its going to post to and also sends along the access token and arguments
// the user wrote as parameters ('params') when prompted.
// when theres a result from this http call, remove element with the spinner class
// adds the return value of the spark when the arg is passed to the 3rd child of the td element (3rd datacell in row)


function update(deviceId, variable) {
  var row = $('#variables [data-device-id=' + deviceId + '][data-variable-name=' + variable + ']');

  $('td:nth-child(4)', row).html('<div class="spinner"><div></div><div></div><div></div></div>');

  jQuery.get('https://api.spark.io/v1/devices/' + deviceId + '/' + variable + '/', {
    'access_token': token
  }, function(result){
    $('td:nth-child(4)', row).text(result.result);
  });
}

// the function 'update' will facilitate two args 'deviceId' and 'variable'
// which does the same described above but whenever we see the function update is called.

function clearHistory() {
  $('#execution-history tbody tr').remove();
}

// clears all the datacells (rows) in the body of the table

$(function() {
  if (token != null) {
    $('#interface').show();
    getDevices();
  } else {
    $('#login').show();
  }
});

//checks to see if there is a null token, if so, switch back to the login view.

