const express = require("express");
const morgan  = require("morgan");
const bodyparser = require("body-parser");
const mongoose= require("mongoose");
const dotenv = require("dotenv").config({ path: './.env' });


const app= express();

const cors = require('cors');


mongoose.connect(process.env.DATABASE,
    { useNewUrlParser:true, useUnifiedTopology: true,useCreateIndex:true },
    (err)=>{
        if (err)
        {
        console.log(err);
        }
        else
        {
            console.log('Connected to the  database');
        }
});


app.use(morgan("dev"));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:false}));
app.use(cors())


//api
const emailverification= require("./routes/email_verification");
app.use("/api", emailverification);

const verify = require("./routes/email_verification");
app.use("/api", verify);


app.listen(8000,err=>{
    if(err){
        console.log(err);
    }else{
        console.log("Listening on PORT",8000);
    }
});