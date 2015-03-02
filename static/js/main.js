$('input[type=number]').on('keypress', function(evt) {
  var charCode = (evt.which) ? evt.which : evt.keyCode;
  if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57))
    return false;
  return true;
})

function syntaxHighlight(json) {
  if (typeof json != 'string') {
    json = JSON.stringify(json, undefined, 2);
  }
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function(match) {
    var cls = 'number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'key';
      } else {
        cls = 'string';
      }
    } else if (/true|false/.test(match)) {
      cls = 'boolean';
    } else if (/null/.test(match)) {
      cls = 'null';
    }
    return '<span class="' + cls + '">' + match + '</span>';
  });
}

function errorToHTML(error, element) {
  $('.spinner').fadeOut(1000);
  var html = '';
  html += '<div class="alert alert-info" role="alert">';
  html += '  <strong>Error</strong>';    
  html += '  <br/>' + error;
  html += '</div>';
  element.html(html);
}

function resultToHTML(result, searchMode) {

  var element = searchMode ? $('#search_result') : $('#verify_result');

  var html = '';
  if (result['verified'] == 'Y') {
    html += '<div class="media">'
    html += ' <div class="media-left"><img width="80" class="media-object" src="/static/images/check.png" alt="check"></div>';
    html += ' <div class="media-body">';
    html += '   <h3 class="media-heading">' + result['fulladdress'] + '</h3>';
    html += '   <hr/>';
    if(!searchMode) {
      html += '   <p><b>' + result['verificationcodedescription'] + '</b></p>';

      var ms = result['verificationcodedescription'].match(/Score\s([0-9]+)/)
      var core = 0;
      if (ms && ms.length == 2) {
        score = ms[1];
      }

      html += '   <div class="progress">'
      html += '     <div class="progress-bar  progress-bar-info" role="progressbar" aria-valuenow="' + score + '" aria-valuemin="0" aria-valuemax="100" style="min-width: 2em; width: ' + score + '%">'
      html += '    accuracy, score: ' + score + '%';
      html += '     </div>';
      html += '   </div>';
      html += '   <dl>';
      html += '     <dd>Verification Code: ' + result['verificationcode'] + '</dd>';
      html += '     <dd>Accuracy Description: ' + result['geoaccuracycodedescription'] + '</dd>';
    }
    if (result['postalcodeprimary']) {
      html += '     <dd>Primary Postal Code: ' + result['postalcodeprimary'] + '</dd>';
      }
    for (i = 1; i <= 4; i++) {
      if (result['address' + i]) {
        html += '     <dd>Address' + i + ': ' + result['address' + i] + '</dd>'
      }
    } 
    html += '     <dd>City: ' + result['city'] + '</dd>';
    html += '     <dd>Subadmin Area: ' + result['subadminarea'] + '</dd>';
    html += '     <dd>Admin Area: ' + result['adminarea'] + '</dd>';
    html += '     <dd>Postal Code: ' + result['postalcode'] + '</dd>';
    html += '     <dd>Country: ' + result['country'] + '</dd>';
    html += '     <dd>Time: ' + result['duration_ms'] + ' ms</dd>';
    html += '   </dl>';
    html += '   <hr/>';
    if (result['latitude'] && result['longitude']) {
      html += '   <img class="thumbnail" src="https://maps.googleapis.com/maps/api/staticmap?center=' + result['latitude'] + ',' + result['longitude'] + '&zoom=' + parseInt(17 * score / 100) + '&size=' + element.width() + 'x400">';
    }

    html += '</div>';
  } else {
    html += '<div class="media">'
    html += ' <div class="media-left"><img width="80" class="media-object" src="/static/images/unverified.png" alt="unverified"></div>';
    html += ' <div class="media-body">';
    html += '   <h3 class="media-heading">' + result['fulladdress'] + '</h3>';
    html += '   <p><b>' + result['verificationcodedescription'] + '</b></p>';
    html += '   <hr/>';
    html += '   <dl>';
    html += '     <dd>Verification Code: ' + result['verificationcode'] + '</dd>';
    html += '     <dd>Time: ' + result['duration_ms'] + ' ms</dd>';
    html += '   </dl>';
    html += '   <hr/>';
    html += ' </div>';
    html += '</div>';
  }

  // debug window
  html += '<a class="btn btn-small" data-toggle="collapse" href="#collapseDebug' + element.attr('id') + '" aria-expanded="false" aria-controls="collapseDebug">';
  html += '  <span class="glyphicon glyphicon-tasks" aria-hidden="true"></span>&nbsp; View JSON result';
  html += '</a>';
  html += '<div class="collapse" id="collapseDebug'  + element.attr('id') + '">';
  html += '  <div class="alert"><pre>';
  html += syntaxHighlight(result);
  html += '  </pre></div>';
  html += '</div>';

  element.html(html);
}



var cache = {};


$(document).ready(function() {

  $('.cc').html($("#country_code").val());

  $("#country_code").on('blur', function() {
    $('.cc').html($("#country_code").val().toUpperCase());
  });

  $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    if(e.target.attributes.href.value == '#verify') {
      jQuery("#verifyAddress1").focus();
    }
    else if(e.target.attributes.href.value == '#search') {
      jQuery("#address1").focus();
    }

  })

  jQuery("#address1").focus();
  jQuery("#address1").autocomplete({
    source: function(request, response) {
      var country = $('#country_code').val();
      var origin_server = $('#origin_server').val();
      var username = $('#username').val();
      var password = $('#password').val();

      $('#search_result').html('');
      var address1 = $('#address1').val();
      if (address1.split(' ').length > 1) {
        $('.spinner').fadeIn('fast');
        var jqXHR = $.ajax({
            url: "/v1.0/proxy",
            contentType: 'application/json',
            type: "POST",
            data: JSON.stringify({
              "address1": address1,
              "mode": 'S',
              "country": country,
              "origin_server": origin_server,
              "username": username,
              "password": password
            })
          })
          .done(function(r) {
            $('.spinner').fadeOut(1000);
            var list = []
            $.each(r.result, function(i) {
              r.result[i]['fulladdress'] = r.result[i]['fulladdress'].replace(/[|]/g, ', ');
              r.result[i]['duration_ms'] = r['duration_ms']
              var fullAddress = r.result[i]['fulladdress']
              cache[fullAddress] = r.result[i];
              list.push(fullAddress);
            });
            response(list);
          })
          .fail(function() {
            errorToHTML(jqXHR.statusText, $('#search_result'));
          });
      }
    },
    minLength: 5
  });

  jQuery("#address1").on("autocompleteselect", function(event, ui) {
    var result = cache[ui.item.value];
    if (result) {
      resultToHTML(result, true);
    }
  });


  jQuery("#verify_clear").on("click", function() {
    $('#verifyAddress1').val('');
    $('#verifyAddress2').val('');
    $('#verifyCity').val('');
    $('#verifyAdminArea').val('');
    $('#verifyPostalCode').val('');
    $('#verifyMinLevel').val('3');
  });

  jQuery("#verify").submit(function(event) {
    event.preventDefault();

    var country = $('#country_code').val();
    var origin_server = $('#origin_server').val();
    var address1 = $('#verifyAddress1').val();
    var address2 = $('#verifyAddress2').val();
    var city = $('#verifyCity').val();
    var adminarea = $('#verifyAdminArea').val();
    var postalcode = $('#verifyPostalCode').val();
    var minimumverificationlevel = $('#verifyMinLevel').val();
    if (minimumverificationlevel < 0 || minimumverificationlevel > 5) {
      minimumverificationlevel = 5;
    }

    var username = $('#username').val();
    var password = $('#password').val();

    var jqXHR = $.ajax({
        url: "/v1.0/proxy",
        contentType: 'application/json',
        type: "POST",
        data: JSON.stringify({
          "address1": address1,
          "address2": address2,
          "mode": 'V',
          "country": country,
          "username": username,
          "password": password,
          "origin_server": origin_server,
          "city": city,
          "adminarea": adminarea,
          "postalcode": postalcode,
          "minimumverificationlevel": minimumverificationlevel
        })
      })
      .done(function(r) {
        $('.spinner').fadeOut(2000);
        if (r.result.length > 0) {
          var result = r.result[0];
          result['fulladdress'] = result['fulladdress'].replace(/[|]/g, ', ');
          result['duration_ms'] = r['duration_ms'];
          resultToHTML(result, false);
          $('#verify_result').ScrollTo();
        }
      })
      .fail(function() {
        errorToHTML(jqXHR.statusText, $('#verify_result'));
      });

  });


});
