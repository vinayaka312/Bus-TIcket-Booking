$(window).load(()=>{
  $("#sub").hide();
});

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
    content+='<a class="dropdown-item" onclick="document.getElementById(\'source\').value=\''+data[i].departure+'\'" >'+data[i].departure+'</a>';
    $("#suggestionList1").append(content);
  }
  else {                          //destination search suggestion...
    for(i=0;i<len;i++) 
    content+='<a class="dropdown-item" onclick="document.getElementById(\'destination\').value=\''+data[i].departure+'\'" >'+data[i].departure+'</a>';
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
      else 
        window.location.href = "/seat_selecttion";
  });
}

$(document).ready(()=>{
  
  $("#leaving #submit").click(()=>{
    
    $("#HELLO").remove();
    $("#selection").remove();
    var leaving = $("#source").val();
    var going = $("#destination").val();
    var date = $("#da #date").val();
    var temp= new Date($("#da #date").val());
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

  $("#source").keyup(()=>{
    $("#suggestionList1").html('');
    if($("#source").val()!='') {
      $.post('/search_stops',{
        key:$("#source").val()
      },(data)=>{
        add(data,"departure");
      });
    }
  });


  $("#destination").keyup(()=>{
    $("#suggestionList2").html('');
    if($("#source").val()!='') {
      $.post('/search_stops',{
        key:$("#destination").val()
      },(data)=>{
        add(data,"destination");
      });
    }
  });

});