$(window).ready(()=>{
  $("#pnr_form").hide();
});
$(document).ready(()=>{


  $("#submit").click(()=>{
    var pnr = $('input[type="text"]').val();
    $.post("/pnr",{
      pnr:pnr
    },(data)=>{
      if(data.length==0){
        alert("Enter the valid PNR number");
      }
      else {
        $("#pnr_form").show();
        $("#name").val(data[0].name);
        $("#age").val(data[0].age);
        if(data[0].gender=='M')
          $("#gender").val("Male");
        else 
          $("#gender").val("Female");
        $("#departure").val(data[0].departure);
        $("#destination").val(data[0].destination);
        $("#idno").val(data[0].idNO);
        $("#phone").val(data[0].phone);
        $("#email").val(data[0].email);
      }
    });
  });
});