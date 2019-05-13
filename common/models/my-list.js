'use strict';
var path = require('path');
var loopback = require('loopback');
var global = require("./global");
module.exports = function(Mylist) {

  Mylist.remoteMethod('addToMyList', {
    description: "post user address",
    accepts: [
      { arg: 'empId', type: 'string'},
      { arg: 'data', type: 'object', http: { source: 'body' } }
    ],
    returns: [
      {type: 'object', root: true}
    ],
       http : {verb : 'post', path : '/addToMyList/:empId'}
  });

  Mylist.remoteMethod('returnDevice', {
    description: "post user address",
    accepts: [
      { arg: 'empId', type: 'string'},
      { arg: 'data', type: 'object', http: { source: 'body' } }
    ],
    returns: [
      {type: 'object', root: true}
    ],
       http : {verb : 'post', path : '/returnDevice/:empId'}
  });

//funtion for adding device in to my list
Mylist.addToMyList = function (empId,data,cb) {
      console.log( JSON.stringify(data)+"-->"+ empId );
      Mylist.app.models.emp.find({where: {"id": empId}} ,function (err, empResult) {
        // console.log("result of emp >>>>>",empResult)
        console.log("Total product-->" + empResult.length)
        if (!err) {
         if(empResult.length){
          console.log( JSON.stringify(data)+"-->"+ empId );
          Mylist.app.models.device.find({where: {"id": data.deviceId}} ,function (err, deviceResult) {
              console.log("Total product-->" + deviceResult.length)
              if (!err) {
               if(deviceResult.length){
                Mylist.create({ 
                   "deviceId": data.deviceId,
                   "empId": empId},function (err, data) {
                   if (err) {
                     console.error(err);
                     cb({"message": "some thing went Wrong"});
                     return;
                   }
                   else {
                     console.log("deviceResult is ",deviceResult);
                     Mylist.app.models.device.update({id:data.deviceId}, {isAvailable:false},
                                function (err, result) {
                                if (!err) {
                                  console.log("updates successfully",result)
                                  console.log("empResult is ->",empResult[0].email)
                                  console.log("deviceResult --> ",deviceResult)
                                
                                  var myMessage = {heading:"Welcome to Device Management System", text:"Thanks for Issue Device", deviceData : deviceResult , empData : empResult[0] }; 
                                  // prepare a loopback template renderer ../../common/views/returnDevice.ejs
                                  var renderer = loopback.template(path.resolve(__dirname, '../../server/views/issueDevice.ejs'));
                                  var html_body = renderer(myMessage);
                               Mylist.app.models.Email.send({
                                 to: empResult[0].email,
                                 from: global.AdminEmail,
                                 subject: 'Issue Testing device',
                                 html: html_body 
                               }, function(err, mail) {
                                 console.log('welcome email sent!');
                                 if(!err){
                                   console.log('email sent!');
                                   cb(null, 'Device issued successfully');
                                 }
                                 
                               });


                                    // Mylist.app.models.Email.send({
                                    //   to: empResult[0].email,
                                    //   from: 'rahul.sapkal23@gmail.com',
                                    //   subject: 'Issue device for development',
                                    //   text: 'please check the device details',
                                    //   html: 'my <em>html</em>'
                                    // }, function(err, mail) {
                                    //   console.log('welcome email sent!');
                                    //   if(!err){
                                    //     console.log('email sent!');
                                    //     cb(null,data);
                                    //   }
                                      
                                    // });
                                 
                                }
                                else {
                                  console.log("error->"+err);
                                  cb({"message": "some thing went Wrong"});
                                }
                              });
                   
                   }
                 });
        
               }else {
                 cb("Invalid device ID");
               }
              }
              else {
                var err = new Error();
                err.statusCode = 404;
                err.message = 'something Went Wrong';
                cb(err);
                return;
              }
            });
          }else{
            cb("Invalid employee ID");
          }

        
        }
        else {
          var err = new Error();
          err.statusCode = 404;
          err.message = 'something Went Wrong';
          cb(err);
          return;
        }
      });
    }
  
Mylist.returnDevice = function (empId,data,cb) {
      console.log( JSON.stringify(data)+"-->"+ empId );
      Mylist.app.models.emp.find({where: {"id": empId}} ,function (err, empResult) {
        // console.log("result of emp >>>>>",empResult)
        console.log("Total emp is-->" + empResult.length)
        console.log("emp details are-->" + JSON.stringify(empResult))
        
        if (!err) {
         if(empResult.length){
          console.log( JSON.stringify(data)+"-->"+ empId );
          Mylist.find({where: {"id": data.myListId}} ,function (err, deviceResult) {
            console.log("Total myList is-->" + deviceResult.length)
            console.log("myList details are-->" + JSON.stringify(deviceResult))
              if (!err) {
               if(deviceResult.length){
                
                Mylist.destroyById(deviceResult[0].id,function (err,res) {
                  if (err) {
                    console.error(err);
                    cb({"message": "some thing went Wrong"});
                    return;
                  }
                  else {
                  console.log("deleted-->",res);
                   // find device and update the flag and inside then delete device from my list

                   var deviceData ;
                   Mylist.app.models.device.find({where: {"id": deviceResult[0].deviceId}} ,function (err, result) {
                     console.log("result is -->" + JSON.stringify(result));
                     if (!err) {
                      if(deviceResult.length){
                       deviceData = result[0];
                       console.log("device Data is ",JSON.stringify(deviceData));
                       Mylist.app.models.device.update({id:deviceData.deviceId}, {isAvailable:true},
                         function (err, result) {
                         if (!err) {
                           console.log("updates successfully",result)
                           console.log("empResult is ->",empResult[0].email)
                           console.log("deviceResult --> ",deviceResult)
                           var myMessage = {heading:"Welcome to Device Management System", text:"Thanks for returning Device", deviceData : deviceData , empData : empResult[0] }; 
                              // prepare a loopback template renderer ../../common/views/returnDevice.ejs
                              var renderer = loopback.template(path.resolve(__dirname, '../../server/views/retunDevice.ejs'));
                              var html_body = renderer(myMessage);
                           Mylist.app.models.Email.send({
                             to: empResult[0].email,
                             from: 'rahul.sapkal23@gmail.com',
                             subject: 'Return Testing device',
                             html: html_body 
                           }, function(err, mail) {
                             console.log('welcome email sent!');
                             if(!err){
                               console.log('email sent!');
                               cb(null, 'Device return successfully');
                             }
                             
                           });
                          
                         }
                         else {
                           console.log("error->"+err);
                           cb({"message": "some thing went Wrong"});
                         }
                       });
 
                     
                      }
                    else{
                      console.log("error-> from finde query device not found ");
                      cb({"message": "some thing went Wrong"});
                    }
                    }
                    else{
                      console.log("error-> ",err);
                           cb({"message": "some thing went Wrong"});
                        
                    }
                    })

                  }
                });
              // }
              }else{
                cb("Invalid myListId ");
              }
            }
            else {
              var err = new Error();
              err.statusCode = 404;
              err.message = 'something Went Wrong';
              cb(err);
              return;
            }
          });
        }else{
          cb("Invalid employee ID");
        }
      }
      else {
        var err = new Error();
        err.statusCode = 404;
        err.message = 'something Went Wrong';
        cb(err);
        return;
      }
    });
  }
             
    // Mylist.afterRemote('addToMyList', function(context, user, next) {
    //   // console.log("context is",context);
    //   console.log("user is",user);
    
      
    //   var options = {
    //     type: 'email',
    //     to: 'rahul.sapkal@neosofttech.com',
    //     from: 'rahul.sapkal@wwindia.com',
    //     subject: 'Issue device for development',
    //     template: path.resolve(__dirname, '../../server/views/index.ejs'),
    //     redirect: 'http://10.0.80.51:8087/server/files/thank.html',
    //     user: user
    //   };
  
    //   user.verify(options, function(err, response) {
    //     console.log("response is inside mail ",response);
    //     if (err) {
    //       // Emp.deleteById(user.id);
    //       return next(err);
    //     }
    //     next();
    //     context.res.render('response', {
    //       title: 'Added device to myList successfully',
    //       content: 'Mail is send to Admin ' +
    //           'Please contact Admin.',
    //       redirectTo: '/',
    //       redirectToLinkText: 'Log in'
    //     });
       
    //   });
    // });
};
