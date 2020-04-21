$(window).load(()=>{
  $("#otp_form").hide();
});
function shw() {
  $("#otp_form").show();
}
var otp,pnr,email;
$(document).ready(()=>{
  $("#submit").click(()=>{
     pnr = $("#pnr").val();
     email = $("#email").val();
    $.post('/cancel',{
      pnr_no : pnr,
      email_id: email
    },(data)=>{
      if(data.otp=='NO') {
        alert("Enter the correct PNR number and Email-Id...!");
      }
      else {
        otp = data.otp;
       shw();
        $("#otp_submit").click(()=>{
          if(otp==$("input[type='number']").val()) {
            $.post("/ticket_cancel",{
              pnr:pnr,
              email:email
            },(data)=>{
              if(data=='YES')
                alert("Your ticket cancelled successfully....!");
              else
                alert("Your ticket cancelled unsuccessfully....!");
            });
          }

        });
      }
    });
  });
});