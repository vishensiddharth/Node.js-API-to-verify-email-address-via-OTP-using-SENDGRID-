const router = require("express").Router();
const User = require("../models/Users");
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport')

const transporter = nodemailer.createTransport(sendgridTransport({
    auth:{
      api_key:"YOUR SENDGRID API KEY"
    }
  }))

  router.post('/email_verification', async (req,res)=> {
      await User.findOne({email: req.body.email})
       .then(user => {
           if(!user) return res.status(401).json({
               message: 'the email is not associate with any account'
           });

           
           let OTP =user.generateOtp();
           user.save()
             .then(user => {
                 let otp =  OTP;
                 const mailOptions = {
                     to:user.email,
                     from: 'USE EMAIL ID FROM WHICH YOU WANT TO SEND MSG',
                     subject: "Email Verification",
                     html:` 
                                <P><b>Hi ${user.username},</b></P>
                                <p>You have  received a request to verify your email-id.<br>
                                    if you already verify your email then, please ignore this email.<br>
                                    <b>your Otp is '${otp}'.</b> </p>                                
                      
                     `,
                 };
                 transporter.sendMail(mailOptions, (error, result) => {
                    if (error) return res.status(500).json({message: error.message});

                    res.status(200).json({message: 'A email verification OTP has been sent to ' + user.email + '.'});
                });
                 
             })
             .catch(err => res.status(500).json({message: err.message}));
       })
       .catch(err => res.status(500).json({message: err.message}));
  });

  router.get('/verify/:email', async (req,res)=> {
    User.findOne({Otp: req.params.Otp, OtpExpires:{$gt: Date.now()} })
       .then((user) =>{
           if(!user) return res.status(401).json({message: 'OTP is invalid or has been expired'});
       })
       .catch(err => res.status(500).json({message: err.message}));
})     

router.post('/verify/:email', async (req,res)=> {
   
     try{
             const {Otp} =req.body;
             console.log(Otp);
             const user = await User.findOne({Otp: Otp});
             if(!user){
                 res.status(402).json({
                    
                     message:"Error in verifing. Make sure your otp is correct."
                 });
                 return;
             }

             user.isVerified = true;
             user.Otp= undefined;
             user.OtpExpires= undefined;
             await user.save();

             const mailOptions = {
                 to: user.email,
                 from: 'USE EMAIL ID FROM WHICH YOU WANT TO SEND MSG',
                 subject:"Email Verified",
                 html:`  <P><b>Hi ${user.username},</b></P>
                         <p> Thank You , Your ${user.email} is verified. Have a nice day</p>`
                        
             
             };
             transporter.sendMail(mailOptions,(err,result)=> {
                 if(err) return res.status(500).json({message: err.message});

                 res.status(200).json({success: true, message: 'Your email address is verified'});
             })
               
     }catch(err){
         res.status(500).json({
              message: err.message
         });
     }
  
})
  module.exports = router;