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

//getting total count of seats from layout.Can be/getSeatSelected removed after layout is finalised
var seatCount=0;        
for(row of seatLayout)
  for(seat of row)              
    if(seat==1)
      seatCount++; 

var seatSelected = [];   //contains the user selected seat number 
var count=0;             //count variable
var selection = [];      //


var seats = [];             //contains seat booking information. true if available, false if booked
var selectedSeats = [];     //true if seat is selected by user, false if deselected. 
for(var i=0;i<seatCount;i++) {
  selectedSeats.push(false);          //required
  // seats.push(true);                   //remove this when seat info is fetched from database in a boolean array form. 
                                      //where array[seat_no] = false if already booked.
}

//adds seat button 
function addButton(name,container) {
  var button='<button type="button" class="btn bt/getSeatSelectedn-outline-primary btn-sm seatButton" onclick="btnToggle(this)"  >' + name + '</button>';
  container.innerHTML += button;
}

//adds empty space for aisle, etc
function addHiddenButton(container) {
  var button='<button type="button" class="btn btn-outline-primary btn-sm seatButton" style="visibility:hidden"></button>'; 
  container.innerHTML += button;
}

//adds booked seat button (deactivated)
function addInactiveButton(name,container) {
  var button='<button type="button" class="btn btn-secondary btn-sm seatButton" disabled>' + name + '</button>';
  container.innerHTML += button;
}

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

//toggles seat selected or deselcted buttons/getSeatSelected
function toggleSeatSelect() {
  var seatCard = document.getElementById("seatCard");
  seatCard.hidden = !seatCard.hidden;
}

function show() {     //It will shows the passenger details form
  if(count<=seatSelected.length) {   //count is number of details filled and seatSelected is booking seat
    alert("Enter the details of passenger who sits in seat no "+seatSelected[count]);
    $("#frm").show();
  }
  else {
    alert("Thanks for booking....!");   //if number of details filled is equal to
    window.location.href = "/";         //number of seats booking then go to home page
  }
}


$(window).load(()=>{

  $("#fill").hide();   //It will hide fill details button
  $("#frm").hide();           //it will hide details form
  
  $.get('/getSeatSelected',(data)=>{    //It will get the booked seat from database
    var i;
    seats = data;
    // for(i=0;i<data.length;i++) {
    //   if(data[i]==true)
    //     seats[i] = true;
    //   else
    //     seats[i] = false;
    // }
  });

});

  $(document).ready(()=>{
    $("#SeatButton").click(()=>{           //on pressing the select seat button it will show fill details and cancel button
      $("#fill").show();
      loadSeatSelect();
    });

    $("#fill #fillDetails").click(()=>{
      var i,k=0;
      $("#SeatButton").disable();
      $("#seatCard").disable();
      for(i=1;i<selectedSeats.length;i++)
        if(selectedSeats[i]) {
          seatSelected[i] =i+1;
          k++;
        }
        if(k==0)
          alert("Select any seat before entering the details...!");
        else
          show();
    });

    $("#passengerDetail").click(()=>{
      var name = $("#nameEntered").val();
      var age = $("#ageEntered").val();
      var gender = $("input[name='genderEntered']:checked"). val();
      var idNo = $("#idEntered").val();
      var phone = $("#phoneEntered").val();
      var email = $("#mailEntered").val();
      var seatNo = seatSelected[count];
      $.post('/insertSeat',{
        name:name,
        age:age,
        gender:gender,
        idNo:idNo,
        phone:phone,
        email:email,
        seatNo:seatNo
      },(data)=>{
        if(data=='YES') {
          count++; 
          show();
        }
        else
          alert("Error!Please refresh page again...");
      });
     
    });

  });