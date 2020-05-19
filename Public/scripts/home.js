var modal1 = document.getElementById('id01'); 
var modal2 = document.getElementById('id02');

//function to show PNR Enquiry ....
$("#pnr_enquiry").click(()=>{                                     
  if (event.target == modal1) {
    modal1.style.display = "none";
  }
});

//function to show Cancel Ticket ....
$("#cancel_ticket").click(()=>{                                   
  if (event.target == modal2) {
    modal2.style.display = "none";
  }
});


//function to send PNR to server for PNR enquiry ....
function send_pnr(){                                              
  var pnr = $("#pnr_value").val();
  if(pnr=="") {
    alert("Enter PNR before submit");
  }
  else {
    $.post("/pnr",{
      pnr:pnr
    },(data)=>{
      alert(data);
      if(data.length==0){
        alert("Enter the valid PNR number");
      }
      else {
        $("#pnr_details").prop("hidden",false);
        $("#pnr_name").val(data[0].name);
        $("#pnr_age").val(data[0].age);
        if(data[0].gender=='M')
          $("#pnr_gender").val("Male");
        else 
          $("#pnr_gender").val("Female");
        $("#pnr_departure").val(data[0].departure);
        $("#pnr_destination").val(data[0].destination);
        $("#pnr_idno").val(data[0].idNO);
        $("#pnr_phone").val(data[0].phone);
        $("#pnr_email").val(data[0].email);
      }
    });
  }
}

//function to send otp and email to server for cancellation of ticket ....
function send_otp_email () {                                    
  pnr = $("#pnr_value1").val();
  email = $("#email_value").val();
  if(pnr=="" || email=="") {
    alert("Enter PNR or Email before press send OTP button");
  }
  else {
    $.post('/cancel',{
      pnr_no : pnr,
      email_id: email
    },(data)=>{
      if(data.otp=='NO')
          alert("Enter the correct PNR number or Email-Id...!");
      else 
        $("#enter_otp").prop("hidden",false);
        $("#sendotp").prop("hidden",true);
        $("#submitotp").prop("hidden",false);
    });
  }
}

//function to submit OTP to server for confirmation ....
function submit_otp() {
  var otp = $("#otp").val();
  if(otp=="") {
    alert("Enter OTP before Submit");
  }
  else {
    $.post("/ticket_cancel",{
      otp:otp
    },(data)=>{
      if(data=='YES') {
        alert("Your ticket cancelled successfully....!");
        window.location.href = "http://localhost:3001/";
      }
      else
        alert("Incorrect OTP");
    });
  }
}


function swap() {
  var temp = $("#source").val();
  $("#source").val($("#destination").val());
  $("#destination").val(temp);
}

function add(data,dep_dest) { //function for search suggestion...
  var len = data.length;
  var content='',i=0;
  if(len>5) len=5;
  if(dep_dest=="departure") {     //departure search suggestion...
    for(i=0;i<len;i++) 
    content+='<a class="dropdown-item" onclick="document.getElementById(\'source\').value=\''+data[i].departure+'\'">'+data[i].departure+'</a><br>';
    $("#suggestionList1").append(content);
  }
  else {                          //destination search suggestion...
    for(i=0;i<len;i++) 
    content+='<a class="dropdown-item" onclick="document.getElementById(\'destination\').value=\''+data[i].departure+'\'" >'+data[i].departure+'</a><br>';
    $("#suggestionList2").append(content);
  }
}

function selected(leaving,going,date) {            // function which sends the  user entered details
  $.post("/search",{
    leav: leaving,
    go: going,
    da:date
  },(data)=>{
      if(data==0)
        alert("Route cannot be found....!");
      else {
      window.location.href="http://localhost:3001/seat_selection";
      }
  });
}


$(document).ready(()=>{
  $("#source").keyup(()=>{
    $("#suggestionList1").html('');
    var key = $("#source").val();
    if(key!='') {
      $.post('/search_stops',{
        key:key
      },(data)=>{
        add(data,"departure");
      });
    }
  });
  
  $("#destination").keyup(()=>{
    $("#suggestionList2").html('');
    var key = $("#destination").val();
    if(key!="") {
      $.post('/search_stops',{
        key:key
      },(data)=>{
        add(data,"destination");
      });
    }
  });

  $("#submit").click(()=>{ 
    
    $("#HELLO").remove();
    $("#selection").remove();
    var leaving = $("#source").val();
    var going = $("#destination").val();
    var date = $("#date").val();
    var temp= new Date($("#date").val());
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth()).padStart(2, '0');
    var yy = today.getFullYear();
    
    if(leaving=="" || going=="") {
      $('input[type=date]').val('');
      alert("Enter departure and destination ..!");
    }
    else if(temp.getFullYear()<yy || date=="") {
      $('input[type=date]').val('');
      alert("Enter Valid date..!");
    }
    else if (temp.getFullYear()==yy) {
      if(temp.getMonth()<mm) {
        $('input[type=date]').val('');
        alert("Enter Valid date..!");
      }
      else if(temp.getMonth()==mm) {
        if(temp.getDate()<dd) {
          $('input[type=date]').val('');
          alert("Enter Valid date..!");
        }
        else {
          selected(leaving,going,date);
        }
      }
      else {
        selected(leaving,going,date);
      }
    }
    else {
      selected(leaving,going,date);
    }
  });
});
