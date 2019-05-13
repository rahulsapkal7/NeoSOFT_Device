'use strict';
var path = require('path');
var loopback = require('loopback');
var global = require("./global.js");
module.exports = function(Returndevice) {

  Returndevice.beforeRemote('create', function(context, device, cb) {
    console.log("inside return device",global.AdminEmail),
    console.log("inside Returndevice beforeRemote ",context.args.data);
    console.log("inside Returndevice beforeRemote device is",device);
    var data = context.args.data;
      console.log( JSON.stringify(data)+"-->"+ data.empId );
      Returndevice.app.models.emp.find({where: {"id": data.empId}} ,function (err, empResult) {
        // console.log("result of emp >>>>>",empResult)
        console.log("Total employee-->" + empResult.length)
        if (!err) {
         if(empResult.length){
          console.log( JSON.stringify(data)+"-->"+ data.empId );
          Returndevice.app.models.device.find({where: {"id": data.deviceId}} ,function (err, deviceResult) {
              console.log("Total product-->" + deviceResult.length)
              if (!err) {
               if(deviceResult.length){
                context.args.data.return_date =new Date().toString();
                // context.args.data.ReturndeviceFlag =true;
                     console.log("deviceResult is ",deviceResult);
                    
                     Returndevice.app.models.device.update({id:data.deviceId}, {isAvailable:true},
                                function (err, result) {
                                if (!err) {

                                  console.log("result is before issue device update",result);
                                  Returndevice.app.models.issueDevice.find({where: {"deviceId": data.deviceId}} ,function (err, IssueDeviceResult) {
                                    if (!err) {
                                      console.log("after find result is ",IssueDeviceResult);
                                      Returndevice.app.models.issueDevice.update({id:IssueDeviceResult.Id}, {issueDeviceFlag:false},
                                        function (err, issuedDeviceresult) {
                                        if (!err) {
    
                                          console.log("updates successfully",issuedDeviceresult)
                                          console.log("empResult is ->",empResult[0].email)
                                          console.log("deviceResult --> ",deviceResult)
                                        
                                          var myMessage = {heading:"Welcome to Device Management System", text:"Thanks for returning testing device. Details of return device are follows : ", deviceData : deviceResult[0] , empData : empResult[0], date: data.return_date }; 
                                          // prepare a loopback template renderer ../../common/views/returnDevice.ejs
                                          var renderer = loopback.template(path.resolve(__dirname, '../../server/views/returnDeviceTL.ejs'));
                                          var html_body = renderer(myMessage);
                                          //Email send from admin to user
                                       Returndevice.app.models.Email.send({
                                         to: empResult[0].email,
                                         from: global.AdminEmail,
                                         subject: 'Return Testing device',
                                         html: html_body 
                                       }, function(err, mail) {
                                         console.log('welcome email sent!');
                                         if(!err){
                                           console.log('email sent!');
                                          
                                         }
                                         
                                       });
                                       var myMessage = {heading:"Welcome to Device Management System", text:"Your team member return testing device. Details of return device are follows : ", deviceData : deviceResult[0] , empData : empResult[0],date: data.return_date }; 
                                       // prepare a loopback template renderer ../../common/views/returnDevice.ejs
                                       var renderer = loopback.template(path.resolve(__dirname, '../../server/views/returnDeviceTL.ejs'));
                                       var html_body = renderer(myMessage);
                                       Returndevice.app.models.Email.send({
                                         to: data.TLemail,
                                         from: global.AdminEmail,
                                         subject: 'Team member return Testing device',
                                         html: html_body 
                                       }, function(err, mail) {
                                         console.log('welcome email sent!');
                                         if(!err){
                                           console.log('email sent!');
                                           // cb(null, {"message":'Device issued successfully'});
                                         }
                                         
                                       });
                                       cb(null, 'Device return successfully');
                                    }
                                    else {
                                      console.log("error->"+err);
                                      cb({"message": "some thing went Wrong"});
                                    }
                                  });

                                    }else{
                                      console.log("error->"+err);
                                      cb({"message": "some thing went Wrong"});
                                    }

                                  })
                              

                                 
                                }
                                else {
                                  console.log("error->"+err);
                                  cb({"message": "some thing went Wrong"});
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
    })
};
