$(document).ready(function () {

  var balance = 0;
  var dollars = 0;
  var quarters = 0;
  var dimes = 0;
  var nickels = 0;

  loadVendingMachine();

// add dollar
$('#addDollar').click(function (event) {
    $('#makePurchaseMessageField').val('');
    $('#changeMessageField').val('');
    balance += 1;
    dollars++;
    $('#addMoneyMessageField').val("$" + balance.toFixed(2));


});

// add quarter
$('#addQuarter').click(function (event) {
    $('#makePurchaseMessageField').val('');
    $('#changeMessageField').val('');
    balance += 0.25;
    quarters++;
    $('#addMoneyMessageField').val("$" + balance.toFixed(2));

});

// add dime
$('#addDime').click(function (event) {
    $('#makePurchaseMessageField').val('');
    $('#changeMessageField').val('');
    balance += 0.10;
    dimes++;
    $('#addMoneyMessageField').val("$" + balance.toFixed(2));

});

// add nickel
$('#addNickel').click(function (event) {
    $('#makePurchaseMessageField').val('');
    $('#changeMessageField').val('');
    balance += 0.05;
    nickels++;
    $('#addMoneyMessageField').val("$" + balance.toFixed(2));

});

// make purchase
$('#makePurchaseButton').click(function(){
     var itemNum = $('#itemDisplayBox').val();
     if(itemNum == ''){
         $('#makePurchaseMessageField').val('Please click on an item to select');
     }
     else{
         $('#makePurchaseMessageField').val('');
         $.ajax({
             type: 'GET',
             url: 'http://localhost:8080/money/' + balance + '/' + 'item/' + itemNum,
             success: function(response, status){

                 quarters = response.quarters;
                 dimes = response.dimes;
                 nickels = response.nickels;
                 pennies = response.pennies;

                 $('#makePurchaseMessageField').val('Thank You!!!');
                 displayChange(response);
                 balance = 0;
                 loadVendingMachine();
             },
             error: function(response,status){
                 switch(response.status){
                     case 422:
                         $('#makePurchaseMessageField').val(response.responseJSON.message);
                         break;
                     default:
                     $('#errorMessages')
                         .append($('<li>')
                         .attr({class: 'list-group-item  list-group-item-danger'})
                         .text('Error calling web service. Please try again later.'));
                 }
             }
         });
     }
 });

// cancel transaction and return change
$('#changeReturnButton').click(function () {
    $('#addMoneyMessageField').val('');
    $('#itemDisplayBox').val('');
    $('#makePurchaseMessageField').val('Transaction Cancelled');

    var pennies = Math.round(parseFloat(balance * 100));
    var quarters = Math.round(pennies / 25);
    pennies %= 25;
    var dimes = Math.round(pennies / 10);
    pennies %= 10;
    var nickels = Math.round(pennies / 5);
    pennies %= 5;
    var change = {'quarters':quarters, 'dimes':dimes, 'nickels':nickels,'pennies':pennies};
    displayChange(change);
    balance = 0;

});


});

function loadVendingMachine() {
  $('#vendingMachineContents').empty();
  $('#itemDisplayBox').val('');
  var vendingMachineContents = $('#vendingMachineContents');

  $.ajax({
    type: 'GET',
    url: 'http://localhost:8080/items',
    success: function(vendingMachineArray) {
      $.each(vendingMachineArray, function(index, vendingMachineItem) {
        var id = vendingMachineItem.id;
        var name = vendingMachineItem.name;
        var price = vendingMachineItem.price;
        var quantity = vendingMachineItem.quantity;
        var message = vendingMachineItem.message;

        var panel = '<div class="col-md-4"><div class="panel panel-default"><div class="panel-body">';
            panel += '<p class="text-left" id="itemId">' + id + '</p>';
            panel += '<p class="text-center">' + name + '</p>';
            panel += '<p class="text-center">' + price + '</p>';
            panel += '<br>'
            panel += '<p class="text-center">Quantity Left: ' + quantity + '</p>';
            panel += '</div></div></div>';

        vendingMachineContents.append(panel);

        $('.panel-body').hover(function() {
            $(this).css("background-color","#e1e1e1");
          },
          function() {
            $(this).css("background-color","white");
          });
          $('.panel-body').click(function() {
            $('#changeMessageField').val('');
            $('#makePurchaseMessageField').val(message);
            $("#itemDisplayBox").val($(this).find('#itemId').text());
          });

      });
    },
    error: function() {
      $('#errorMessages')
          .append($('<li>')
          .attr({class: 'list-group-item  list-group-item-danger'})
          .text('Error calling web service. Please try again later.'));
    }
  });
}

function displayChange(change) {
  var changeMessageField = change.quarters + ' Quarters ';
  changeMessageField += change.dimes + ' Dimes ';
  changeMessageField += change.nickels + ' Nickels ';
  changeMessageField += change.pennies + ' Pennies';
  $('#changeMessageField').val(changeMessageField);
}

function checkAndDisplayValidationErrors(input){
  $('#errorMessages').empty();

  var errorMessages = [];

  input.each(function() {
    if (!this.validity.valid) {
      var errorField = $('label[for=' + this.id +']').text();
      errorMessages.push(errorField + ' ' + this.validationMessage);
    }
  });

  if (errorMessages.length > 0){
    $.each(errorMessages, function(index, message) {
      $('#errorMessages').append($('<li>').attr({class: 'list-group-item list-group-item-danger'}).text(message));
    });
    return true;
  } else {
    return false;
  }
}
