const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const UserSchema = new Schema({

    username: {type: String, unique: true, required:true},
    email: { type: String, unique: true, required: true },
    isVerified: {type: Boolean, default:false},
    password: { type: String, required: true },
    role: {type: String},
    createdDate: { type: Date, default: Date.now },
    resetPasswordToken: {
      type: String,
      required: false
  },

  resetPasswordExpires: {
      type: Date,
      required: false
  },
  Otp: {type: Number},

  OtpExpires:{type: Date}
  });


  UserSchema.pre("save", function(next) {
    let user = this;
    if (this.isModified("password") || this.isNew) {
      bcrypt.genSalt(10, function(err, salt) {
        if (err) {
          return next(err);
        }

        bcrypt.hash(user.password, salt, null, function(err, hash) {
          if (err) {
            return next(err);
          }

          user.password = hash;
          next();
        });
      });
    } else {
      return next();
    }
  });

  

 

UserSchema.methods.generateOtp = function(){
  
  for (let i = 0; i < 6; i++ ) { 
    this.Otp = Math.floor(Math.random()*10000);
         }
  this.OtpExpires = Date.now() +3600000; //expires in an hour
  return this.Otp
};


module.exports = mongoose.model("User", UserSchema);