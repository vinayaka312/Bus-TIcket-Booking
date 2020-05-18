var express = require("express");                           //modules insertion....
var mysql = require("mysql");
var path = require("path");
var bodyParser = require("body-parser");
var session = require("express-session");
var nodemailer = require('nodemailer');


var app = express();


var sess,id,type,seat,dep,dest,cost,name,lea,goi,otp,email,pnr;           //variables declaration...
var busses;

app.use(bodyParser.urlencoded({ extended:false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,"Public")));
app.use(session({                                           //session declaration....
  secret:'LetsGo',
  resave:false,
  saveUninitialized:true
}));




var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'majjigetambli@gmail.com',
    pass: 'amteKayi'
  }
});



var con = mysql.createConnection({                          //database connection....
  host:"localhost",
  user:'root',
  password:"",
  database:"booking"
});
con.connect(()=>{console.log("Connected!!!");});

app.get('/social',(rea,res)=>{
  res.sendFile(__dirname+'/social.html');
});

app.get('/',(req,res)=>{                                    //home page loader
  sess = req.session;
  sess.destroy(()=>{});
  res.sendFile(__dirname+'/home.html');
});

app.post('/search_stops',function(req,res){
  var key = req.body.key;
  sql = 'SELECT distinct departure from stops where departure like "'+key+'%"';
  console.log(sql);
  con.query(sql,(err,result)=>{
    if (err) throw err;
    console.log(result);
    res.send(result);
  });
});

app.post('/search',(req,res)=>{                             //search for the  available busses with details

  sess = req.session;                                       //session declaration
  sess.leaving = req.body.leav;                             // sess.leaving = user's  departure
  sess.going = req.body.go;                                 //sess.going  = use's destination
  sess.date = req.body.da;                                  //sess.date = user's travel date
  
  var leaving = sess.leaving;                               //assigning the session variable to local variable
  var going  = sess.going;
  var date = sess.date;

  console.log(leaving+" "+going+" "+date);

  sql = 'select * from paths';                              //sql command to acquire all the busses in the database 
  con.query(sql,(err,result)=>{
    var k=0;
   
    for(var i=0;i<result.length;i++) {

      id = result[i].id;                                    //id = bus path code
      type = result[i].type;                                //type = bus type (Rajahamsa or Karnataka Sarige etc..)
      seat = result[i].seats;                               //seats = Total seats available in the bus
      dep = result[i].departure;                            //dep = bus departure point
      dest = result[i].destination;                         //dest = bus destionation point
      
      search_busses(id,type,seat,dep,dest,leaving,going,date);  //search for the required busses
    }  
  });

  con.query("select * from busses",(err,data)=>{            //acquire all the favarable busses inserted in the search operation
    if(err) throw err;
    busses = data;
    con.query("delete from busses",(err,result)=>{if(err)throw err;}); //delete all required busses in the favarable busses table                                                       //send favarable busses details to client side                                         
    if(busses.length==0)
    res.send('0');
  else
    res.send('1');
  });
});

app.get('/bus_details',(req,res)=>{
  res.send(busses);
});


app.post('/selected_bus',(req,res)=>{                       // insert selected bus path id to session
  sess = req.session;
  sess.code = req.body.code;
  res.send(sess.code);
});



app.get('/seat_selection',(req,res)=>{                     //Seat booking page loader
  sess = req.session;
  // if(sess.date)
    res.sendFile(__dirname+'/seat.html');
  // else
    // res.sendFile(__dirname+'/home.html');
});



app.get('/getSeatSelected',(req,res)=>{                     // fetching the booked seat numbers
  
  sess = req.session;                                       //session declaraton
  id = sess.code;                                           //id = bus path id
  date = sess.date;
  name = date.substring(0,4)+date.substring(5,7)+date.substring(8)+id;   //name = date user choosed + bus path id
 
  var sql = "select seats from paths where id='"+id+"'";      //mysql command to get total seat available in the bus with path id = id
  con.query(sql,(err,result)=>{
    
    var seats = new Array(result[0].seats);
    for(var i=0;i<seats.length;i++) seats[i] = true;         //assign all the seats as available seats
 
    sql = 'show tables where Tables_in_booking = "'+name+'"';            //mysql command to get all the tables 
    con.query(sql,(err,tables)=>{
      
      if(tables.length == 0) {                   //if there is no table with name = name;
        create_table();                                     //create table with name = name;
        res.send(seats);                                    //send all the seats in the bus as available seats 
      }
      else {
        sql = 'select seat from '+name +' where  destination > '+lea+" and destination <= "+goi;
        sql +=" union distinct select seat from "+name+" where departure < "+goi +' and destination >= '+goi;                     //get booked seat number from name table
        con.query(sql,(err,resu)=>{
            var k;
            for(var i=0;i<resu.length;i++) {                // remove booked seat number from available seats
              k = resu[i].seat;
              seats[k-1] = false;
            }
            res.send(seats);                                //send available seats
          });
      }
    });
  });
});



app.post('/insertSeat',(req,res)=>{                         //inserting the passenger details into table
  sess = req.session;                                       //session declaration
  var Name = req.body.name;                                 //Name = passenger-name (name is a one of the tables,Name != name)
  var age = req.body.age;                                   //age = passenger-age
  var gender = req.body.gender;                             //gender = passenger-gender
  var idno = req.body.idNo;                                 //inno = identity card no 
  var phone = req.body.phone;                               //phone = passenger-telephone number
  var email = req.body.email;                               //email = passenger-email
  var seatNo = req.body.seatNo;                             //seatNo = passenger-seat no
  var pnr = name+seatNo;                                    //pnr = unique identity number for the passenger
  var content = 'congratulations your booking is successful...!';
  content += "Your pnr is "+pnr+" and seat number is "+seatNo;
  content += ". We will inform you about bus details later...! Thank You...!";
  var mailOptions = {
    from: 'majjigetambli@gmail.com',
    to: email,
    subject: 'Confirming the booking of bus ticket',
    text: content
  };
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
  sql = "insert into pnr values('"+pnr+"','"+Name+"',"+age+",'"+gender+"','";
  sql += sess.leaving+"','"+sess.going+"',"+idno+","+phone+",'"+email+"',"+seatNo+")";     //mysql command to insert passenger details 
  console.log(sql);
  con.query(sql,(err,result)=>{
    if(err) throw err;
    else {
      sql = 'insert into '+name+" values('"+Name+"',"+lea+","+goi+","+seatNo+",'"+gender+"')";  //inserting the passenger details to temperory table...
      con.query(sql,(err,data)=>{                                                               //...to get booked seat no
        if(err) throw err;
        else 
        res.send("YES");                                    //send "YES" as insertion successful signal
      });
    }
  });
});



app.get("/pnr_enquiry",(req,res)=>{                         //PNR Enquiry page loader
  res.sendFile(__dirname+"/pnr.html");
});



app.post("/pnr",(req,res)=>{                                    //get PNR value and returns passenger ddetails
  var pnr = req.body.pnr;
  sql = 'select * from pnr where pnr = "'+pnr+'"';
  con.query(sql,(err,result)=>{
    res.send(result);
  });
});



app.get("/cancel_ticket",(req,res)=>{                       //Ticket cancel page loader
  res.sendFile(__dirname+"/cancel.html");
});



app.post('/cancel',(req,res)=>{
  pnr = req.body.pnr_no;
  email = req.body.email_id;
  sql = "select * from pnr where pnr = '"+pnr+"' and email = '"+email+"'";
  con.query(sql,(err,result)=>{
    if(result.length == 0) {
      var data={};
      data.otp='NO';
      res.send(data);
    }
    else {
      otp = Math.floor(1000 + Math.random() * 9000);
      console.log(otp);
      var content = 'Your one time password is ' +otp;
      var mailOptions = {
        from: 'majjigetambli@gmail.com',
        to: email,
        subject: 'Confirming cancellation of bus ticket',
        text: content
      };
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
      var data={};
      data.otp=otp;
      res.send(data);
    }
  });
});

app.post('/ticket_cancel',(req,res)=>{
  var recieved_otp = req.body.otp;
  if(otp == recieved_otp) {
    sql = "delete from pnr where pnr ='"+pnr+"' and email ='"+email+"'";
    con.query(sql,(err,result)=>{
      if(err) {
        throw err;
      }
      res.send("YES");
    });
  }
  else {
    res.send("NO");
  }
});


function search_busses(id,type,seat,dep,dest,leaving,going,date) {         //function to search for the favarable busses
  // leaving = leaving.substring(1);
  console.log(leaving);
  sql = 'select l.no as no1,g.no as no2,l.time as time1,g.time as time2,l.cost as cost1,g.cost as cost2  ';
  sql += 'from '+id+' as l,'+id+' as g where l.no<g.no and l.stops="'+leaving+'" and g.stops="'+going+'"';  //mysql command to search for favarable busses

  con.query(sql,(err,result)=>{
    if(err) throw err;
    else if(result.length!=0) {
      lea = result[0].no1;
      goi = result[0].no2;
      cost = result[0].cost1 - result[0].cost2;
      sql = "insert into busses values('"+id+"','"+result[0].time1+"','"+result[0].time2+"','"+dep;    //inserting favarable buss to temperaory table
      sql += "','"+dest+"',"+cost+","+seat+",'"+type+"')";
     
      con.query(sql,(err,resu)=>{
        if(err) throw err;
      });
    }
  });
}

function create_table() {     //function to create table with name = name
  sql = 'create table '+name+'(name varchar(30),departure int';
  sql += ',destination int,seat int,gender char)';
  con.query(sql,(err)=>{});
}


app.listen(3001);  //server listening at port 3001