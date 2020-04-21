 var busses;
 var numberOfSeats=[];     //contains seats  number user selected  
 var count = 0;           //contains the number of times "Select seat pressed"
 var passengerSeat;
 //define bus layout here. 0 = aisle or no seat, 1 = seat
 var seatLayout=[[0,0,0,1,1],
                 [0,0,0,1,1],
                 [1,1,0,1,1],
                 [1,1,0,1,1],
                 [1,1,0,1,1],
                 [1,1,0,1,1],
                 [1,1,0,1,1],
                 [1,1,1,1,1],];

//getting max width of bus
var maxSeatWidth=seatLayout[0].length;

//getting total count of seats from layout.Can be removed after layout is finalised
var seatCount=0;        
for(row of seatLayout)
  for(seat of row)                // con.query("select * from busses",(err,data)=>{            //acquire all the favarable busses inserted in the search operation
  //   if(err) throw err;
  //   console.log(data);
  //   con.query("delete from busses",(err,result)=>{if(err)throw err;}); //delete all required busses in the favarable busses table 
  //   res.send(data);                                         //send favarable busses details to client side                                         
  // });
    if(seat==1)
      seatCount++; 

var seats = []; //contains seat booking information. true if available, false if booked
var selectedSeats = []; //true if seat is selected by user, false if deselected. 
for(var i=0;i<seatCount;i++) {
  selectedSeats.push(false);          //required
 // seats.push(true);                   //remove this when seat info is fetched from database in a boolean array form. 
                                    //where array[seat_no] = false if already booked.
}

//adds seat button 
function addButton(name,container) {
  var button='<button type="button" class="btn btn-outline-primary btn-sm seatButton" onclick="btnToggle(this)"  >' + name + '</button>';
  container.innerHTML += button;
}

//adds empty space for aisle, etc
function addHiddenButton(container) {
  var button='<button type="button" class="btn btn-outline-primary btn-sm seatButton" style="visibility:hidden"></button>'; 
  container.innerHTML += button;
}

//adds booked seat button (deactivated)
function addInactiveButton(name,container) {
  var button ='<button type="button" class="btn btn-secondary btn-sm seatButton" disabled>' + name + '</button>';
  container.innerHTML += button;
}
2
//dynamically adds seats to container at page load
function loadSeatSelect() {
  var seatContainer = document.getElementById("seatContainer");                
  var align = "";
  var i=0,j=0;
  while(i<seats.length) {
    for(var k=0;k<maxSeatWidth;k++) {
      if(seatLayout[j][k]==0) addHiddenButton(seatContainer);
      else {                            
        if(seats[i]) {
          addButton((i+1).toString() , seatContainer);
        }
        else {
          addInactiveButton((i+1).toString() , seatContainer);
        }    
        i++;
      }
    }     
    j++;
    seatContainer.innerHTML += "<br>";
  }
}

//toggles seat selection menu
function btnToggle(btn) {            
  index=parseInt(btn.innerHTML) - 1;            
  if(selectedSeats[index] == true) {
    selectedSeats[index]=false;
    $(btn).removeClass("btn-primary").addClass("btn-outline-primary");    
  }
  else {
    selectedSeats[index]=true;
    $(btn).removeClass("btn-outline-primary").addClass("btn-primary");
  }
}

//toggles seat selected or deselcted buttons
function toggleSeatSelect() {
  var seatCard = document.getElementById("seatCard");
  seatCard.hidden = !seatCard.hidden;
  fill_details.hidden = !fill_details.hidden;
  cancel.hidden =! cancel.hidden;
}

function bus_no(num) {
  $.post("/selected_bus",{
    code : busses[num].id
    },(ans)=>{
      if(ans == busses[num].id) {
        $("#seatCard").show();
        fill_details.hidden = false;
        cancel.hidden = false;
        $("#details").hide();
        $("#seatContainer").empty();
        $.get('/getSeatSelected',(data)=>{    //It will get the booked seat from database
          var i;
          for(i=0;i<data.length;i++) {
            if(data[i]==true)
              seats[i] = true;
            else
              seats[i] = false;
          }
          loadSeatSelect();
        });
      }
      else 
        alert("Error! Please refreash the page");
  });
}

function add_details() {
  var len =  busses.length;
  console.log(busses);
  var content = " <tr><td>Bus Id</td><td>Bus Time</td><td>Bus Type</td><td>Bus Route</td><td>Bus Seat</td><td>cost</td></tr>";
  for(var i=0;i<len;i++)
  content += " <tr><td>"+busses[i].id+"</td><td>"+busses[i].time1+" - "+busses[i].time2+"</td><td>"+busses[i].type+"</td><td>"+busses[i].depart+" - "+busses[i].dest+"</td><td>"+busses[i].seat+"</td><td>"+busses[i].cost+"</td><td style='border :0px solid;background-color:yellow'><button id='SeatButton' type='button' class='btn btn-primary btn-sm m-3' onclick='bus_no(\""+i+"\")'>Select Seat</button></td></tr>";    
  // <input type='button' value='Select' onclick='bus_no(\""+i+"\")' style='background-color:blue;color:white;'></input>
  $("#busses").append(content);
}

$(window).load(()=>{
  // $("#SeatButton").hide();
  $("#seatCard").hide();
  $("#details").hide();
  $("#sub").hide();
  $.get('/bus_details',(data)=>{
    busses = data;
    add_details();
  })
  
});

$(document).ready(()=>{
  loadSeatSelect();

  $("#fill_details").click(()=>{
    var k=0;
    for(var i=0;i<seatCount;i++) {
      if(selectedSeats[i]) {
        numberOfSeats[k] = i+1;
        k++;
      }
    }
    if(k==0)
      alert("Select any seats before entering the details....!");
    else {    
      $("#SeatButton").hide();
      $("#seatCard").hide();
      $("#fill_details").hide();
      $("#details").show();
      $("#sub").show();
        passengerSeat = numberOfSeats[count];
        alert("Enter the details of passenger who sits in seat number "+numberOfSeats[count]);
    }
  });

  $("#sub").click(()=>{
    var Name = $("#name").val();
    var Age = $("#age").val();
    var Gender =  $("input[name='gender']:checked"). val();
    var IdNo = $("#idno").val();
    var Phone = $("#phoneno").val();
    var Email = $("#email").val();

    $.post('/insertSeat',{
      name:Name,
      age:Age,
      gender:Gender,
      idNo:IdNo,
      phone:Phone,
      email:Email,
      seatNo:passengerSeat
    },(data)=>{
      if(data=='YES') {
        count++;
        if(count == numberOfSeats.length) {
          alert("Thanks for booking....!");
          window.location.href="/";
        }
        else {
          passengerSeat = numberOfSeats[count];
          alert("Enter the details of passenger who sits in seat number "+numberOfSeats[count]);
        }
      }
      else
        alert("Error!Please refresh page again...");
    });
  });

});