'use strict';
var path = require('path');
module.exports = function(Emp) {
//  var re = ;
var re = new RegExp("[\w]*@neosofttech\.com($)|@wwindia\.com($)");
// var re1 = new RegExp("([\w]*@neosofttech\.com)($)");
// var re2 = new RegExp("([\w]*@wwindia\.com)($)");

// var email1 = "raj@neowsofttech.com";
// var email2 = "raj@wwindia.com";
// console.log("re.test(context.args.data.email) -->",re.test(email1));
// console.log("re.test(context.args.data.email) -->",re.test(email2));
// console.log("re.test(context.args.data.email) -->",re1.test(email1));
// console.log("re.test(context.args.data.email) -->",re2.test(email1));
// Emp.validatesUniquenessOf('email', {message: 'Email already exists,please check the email idd'});


// *****************************************************************************************
  Emp.beforeRemote('create', function(context, empInstance, cb) {
    console.log("context is ",context.args.data);
    if (context.args.data.email == undefined) {
      cb({"statusCode" : 400,"message": "email Id is required"});
    }
     else if (re.test(context.args.data.email.toLowerCase()) == false ) {
      console.log("re.test(context.args.data.email) -->",re.test(context.args.data.email));
      cb({"statusCode" : 401,"message": "please provide Office Email id"});
    } 
    else if (context.args.data.password == undefined) {
      cb({"statusCode" : 402,"message": "password is required"});
    } else if (context.args.data.city == undefined) {
      cb({"statusCode" : 403,"message": "city is required"});
    } else if (context.args.data.branch == undefined) {
      cb({"statusCode" : 404,"message": "branch is required"});
    } else {
      context.args.data.createdate = new Date();
      // For every user we hahe to create one myList
      
      // var options = {
      //   type: 'email',
      //   to: empInstance.email,
      //   from: 'rahul.sapkal@wwindia.com',
      //   subject: 'Thanks for registering.',
      //   template: "Thank you "+empInstance.fname +" "+empInstance.lname+ " for registration !!! " ,
      //   redirect: '/verified',
      //   user: empInstance
      // };
  
      // empInstance.verify(options, function(err, response, next) {
      //   if (err) return next(err);
  
      //   console.log('> verification email sent:', response);
  
      //   context.res.render('response', {
      //     title: 'Signed up successfully',
      //     content: 'Please check your email and click on the verification link ' -
      //         'before logging in.',
      //     redirectTo: '/',
      //     redirectToLinkText: 'Log in'
      //   });
      // });
  
      cb();
      return;
    }
  });

  Emp.afterRemote('create', function(context, user, next) {
    var options = {
      type: 'email',
      to: user.email,
      from: 'rahul.sapkal@wwindia.com',
      subject: 'Thanks for registering.',
      template: path.resolve(__dirname, '../../server/views/verify.ejs'),
      redirect: 'http://10.0.80.51:8087/server/files/thank.html',
      user: user
    };

    user.verify(options, function(err, response) {
      console.log("response is ",response);
      if (err) {
        Emp.deleteById(user.id);
        return next(err);
      }
      next();
      context.res.render('response', {
        title: 'Signed up successfully',
        content: 'Please check your email and click on the verification link ' +
            'before logging in.',
        redirectTo: '/',
        redirectToLinkText: 'Log in'
      });
     
    });
  });
  
  Emp.remoteMethod('AdminLogin', {
    description: "API only for Admin login",
    accepts: [
      {arg: 'email', type: 'string', require: true},
      {arg: 'password', type: 'string', require: true}

    ],
    returns: [
      {arg: 'response', type: 'object'}
    ],
    http: {path: '/loginAdmin', verb: 'post'}
  });

  Emp.AdminLogin = function (email, password, cb) {
    var UserModel = Emp;
    console.log("-->" + email);

    UserModel.find({where: {and: [{email: email}, {role: 'admin'}, {emailVerified: true}]}}, function (err, user) {

      if (err) {
        //custom logger 
        console.error(err);
        cb({"message": "some thing went Wrong"});
        return;
      }
      else {

        console.log(JSON.stringify(user)+"success=" + user.length);
        if (user.length) {

          UserModel.login({
            email: email,           // must provide email or "username"
            password: password              // required by default

          }, function (err, accessToken) {
            if (accessToken) {
              console.log(accessToken.userId);
              console.log(accessToken.id);      // => GOkZRwg... the access token
              //console.log(accessToken.ttl);     // => 1209600 time to live
              console.log(accessToken.created); // => 2013-12-20T21:10:20.377Z


              cb(null, accessToken);
            }
            else {
              //custom logger 
              console.error('-->' + err);
              cb(err);
            }
          });
        }

        else {
          console.error(err);
          cb({"message": "You ar not an Admin"});

        }

      }
    });

  }
 
  // Method to render
  // Emp.afterRemote('prototype.verify', function(context, user, next) {
  //   context.res.render('response', {
  //     title: 'A Link to reverify your identity has been sent '+
  //       'to your email successfully',
  //     content: 'Please check your email and click on the verification link '+
  //       'before logging in',
  //     redirectTo: '/',
  //     redirectToLinkText: 'Log in'
  //   });
  // });
  // // Emp.afterRemote('create', function(context, emp, cb) {
  //   console.log("context is ",context.args.data);
  //   console.log("emp is ",emp);
    
      
  //   Emp.app.models.Email.send({
  //       to: context.args.data.email,//"sandip.ghadge@wwindia.com",//info.email,
  //       from: 'rahul.sapkal@wwindia.com',
  //       subject: 'Registration',
  //       html: "Thank you "+context.args.data.fname +" "+context.args.data.lname+ " for registration !!! "
  //       //html: 'my <em>html</em>'//html_body
  //     }, function (err, mail) {
  //       console.log('welcome email sent!');
  //       if (!err) {
  //         console.log("mail send");
  //         return true;
  //       } else {
  //         return false;
  //       }
  //     });
  //     cb();
  //     return;
    
  // });
  
  /*
   Below event will be triggered over reset password request
   will create access token
   */

  // Useraccount.on('resetPasswordRequest', function (info) {
  //   //console.log(info.email); // the email of the requested user
  //   console.log(info.accessToken.id); // the temp access token to allow password reset

  //   //console.log(JSON.stringify(info));

  //   //console.log("Useraccount: "+ Useraccount.app);
  //   console.log("Useraccount: 1 " + Useraccount.definition.name);

  //   var tempAccessToken = info.accessToken.id;

  //   //POST /user_accounts/reset-password

  //   //http://0.0.0.0:3000/api/user_accounts/reset-password?access_token=5Ey8OK9olx6fJ3c5ZCUD9D77iCwwjBZelBfnDt8APrGU4CeRlTcFNTG1JdDrWhEd

  //   //http://apiRoot/modelName/methodName
  //   var modelName = Useraccount.definition.name;
  //   var methodName = "reset-password"
  //   //var setURL = apiRootUrl+modelName +"/"+methodName +"access_token ="+tempAccessToken;
  //   var forgotPasswordPage = "http://10.0.100.211:4200/set-password";//"file:///Users/webwerks/Documents/Darshana/NeoStore/changePassword.html";
  //   var setURL = forgotPasswordPage + "?access_token=" + tempAccessToken;
  //   console.log("setURL : " + setURL);

  //   var options = {
  //     type: 'email',
  //     to: info.email,
  //     from: 'noreply@loopback.com',
  //     subject: 'Thanks for registering.',
  //     template: path.resolve(__dirname, '../../server/views/verify.ejs'),
  //     redirect: '/verified',
  //     user: Useraccount
  //   };


  //   Useraccount.app.models.Email.send({
  //     to: "suhel.khan@neosofttech.com",//"sandip.ghadge@wwindia.com",//info.email,
  //     from: 'darshana.patil@wwindia.com',
  //     subject: 'Forgot Email Id',
  //     html: "<a href='" + setURL + "'>Click Me to Change Password</a>"
  //     //html: 'my <em>html</em>'//html_body
  //   }, function (err, mail) {
  //     console.log('welcome email sent!');
  //     if (!err) {
  //       console.log("mail send");
  //       return true;
  //     } else {
  //       return false;
  //     }
  //   });


  //   // requires AccessToken.belongsTo(User)
  //   info.accessToken.user(function (err, user) {
  //     console.log(user); // the actual user
  //   });
  // });
// *****************************************************************************************
  
  // Employee.remoteMethod('empLogin', {
  //   description: "API only for Employee login",
  //   accepts: [
  //     {arg: 'email', type: 'string', require: true},
  //     {arg: 'password', type: 'string', require: true}

  //   ],
  //   returns: [
  //     {arg: 'response', type: 'object'}
  //   ],
  //   http: {path: '/login', verb: 'post'}
  // });
  // function responseStatus(status) {
  //   return function(context, callback) {
  //     var result = context.result;
  //     if(testResult(result)) { // testResult is some method for checking that you have the correct return data
  //       context.res.statusCode = status;
  //     }
  //     return callback();
  //   }
  // }
  
  // Emp.remoteMethod('create', {
    
  //   rest: {after: responseStatus(201) }
  // });
  // Emp.afterRemote('create', function(
  //   context,
  //   remoteMethodOutput,
  //   next
  // ) {
  //   context.res.statusCode = 201;
  //   next();
  // });
  // function responseStatus(status) {
  //   return function(context, callback) {
  //     var result = context.result;
  //     if(testResult(result)) { 
  //       context.res.statusCode = status;
  //     }
  //     return callback();
  //   }
  // }
  
  // Employee.remoteMethod('login', {
  //   // http: { status: 200}
  //   rest: {after: responseStatus(201) }
  // });
};
