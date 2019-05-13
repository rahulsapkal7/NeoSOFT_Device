'use strict';
var path = require('path');
var loopback = require('loopback');
var each =require('async/each');
var global = require("./global");
module.exports = function(Issuedevice) {


  //funtion for adding device in to my list
  // Issuedevice.addToIssuedevice = function (empId,data,cb) {
    Issuedevice.beforeRemote('create', function(context, device, cb) {
      console.log("inside Issuedevice beforeRemote ",context.args.data);
      console.log("inside Issuedevice beforeRemote device is",device);
      var data = context.args.data;
        console.log( JSON.stringify(data)+"-->"+ data.empId );
        Issuedevice.app.models.emp.find({where: {"id": data.empId}} ,function (err, empResult) {
          // console.log("result of emp >>>>>",empResult)
          console.log("Total employee-->" + empResult.length)
          if (!err) {
           if(empResult.length){
            console.log( JSON.stringify(data)+"-->"+ data.empId );
            Issuedevice.app.models.device.find({where: {"id": data.deviceId}} ,function (err, deviceResult) {
                console.log("Total product-->" + deviceResult.length)
                if (!err) {
                 if(deviceResult.length){
                  context.args.data.issued_date =new Date().toString();
                  // context.args.data.issueDeviceFlag =true;
                       console.log("deviceResult is ",deviceResult);
                       Issuedevice.app.models.device.update({id:data.deviceId}, {isAvailable:false},
                                  function (err, result) {
                                  if (!err) {
                                    console.log("updates successfully",result)
                                    console.log("empResult is ->",empResult[0].email)
                                    console.log("deviceResult --> ",deviceResult)
                                    var myMessage = {heading:"Welcome to Device Management System", text:"Thanks for Issue testing device. Details of issue device are follows : ", deviceData : deviceResult[0] , empData : empResult[0], date: data.issued_date }; 
                                    // prepare a loopback template renderer ../../common/views/returnDevice.ejs
                                    var renderer = loopback.template(path.resolve(__dirname, '../../server/views/issueDevice.ejs'));
                                    var html_body = renderer(myMessage);
                                 Issuedevice.app.models.Email.send({
                                   to: empResult[0].email,
                                   from: global.AdminEmail,
                                   subject: 'Issue Testing device',
                                   html: html_body 
                                 }, function(err, mail) {
                                   console.log('welcome email sent!');
                                   if(!err){
                                     console.log('email sent!');
                                     
                                   }
                                   
                                 });

                                 var myMessage = {heading:"Welcome to Device Management System", text:"Your team member Issue testing device.  Details of issue device are follows : ", deviceData : deviceResult[0] , empData : empResult[0],  date: data.issued_date }; 
                                 // prepare a loopback template renderer ../../common/views/returnDevice.ejs
                                 var renderer = loopback.template(path.resolve(__dirname, '../../server/views/issueDevice.ejs'));
                                 var html_body = renderer(myMessage);
                                 Issuedevice.app.models.Email.send({
                                   to: data.TLemail,
                                   from: global.AdminEmail,
                                   subject: 'Team member issued Testing device',
                                   html: html_body 
                                 }, function(err, mail) {
                                   console.log('welcome email sent!');
                                   if(!err){
                                     console.log('email sent!');
                                     // cb(null, {"message":'Device issued successfully'});
                                   }
                                   
                                 });
                                 cb(null, {"message":'Device issued successfully'});
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

     

      Issuedevice.remoteMethod('getMyIssuedDevices', {
        description: "On admin login to get details for dash board",
        accepts: [
          { arg: 'data', type: 'object', http: { source: 'body' },require:true }
        ],
        returns: [{type: 'object', root: true}],
        http: {path: '/getMyIssuedDevices', verb: 'post'}
      });


      Issuedevice.getMyIssuedDevices = function (data, cb) {
        console.log("data is",data);
        // check empID is exist or not
        Issuedevice.app.models.emp.find({where: {"id": data.empId}} ,function (err, empResult) {
          console.log("result of emp >>>>>",empResult)
          console.log("Total employee-->" + empResult.length)
          if (!err) {
           if(empResult.length){
            console.log( JSON.stringify(data)+"-->"+ data.empId );
             // check Issuedevice for that particular empId
            Issuedevice.find({
              where:{"empId":data.empId,"issueDeviceFlag":true}},function (err,IssuedeviceResult){
                console.log("IssuedeviceResult is",IssuedeviceResult)
                var IssuedeviceWithImage = [];
                var  IssuedeviceArray=IssuedeviceResult;
                var counter = 0;
                if (IssuedeviceArray.length >0 ) {
                  // each
                each(IssuedeviceArray, function (issueDeviceObj, cb) {
                console.log("issueDeviceObj->", issueDeviceObj.deviceId);
                // console.log("counter is->", k);
                Issuedevice.app.models.device.find({where: {"id": issueDeviceObj.deviceId}} ,function (err, deviceResult) {
                  // console.log("result of device >>>>>",deviceResult)
                  //   console.log("Total product-->" + deviceResult.length)
                    if (!err) {
                     if(deviceResult.length){
                          //  console.log("deviceResult is ",deviceResult);
    
                           Issuedevice.app.models.image.find(
                            {where: {"deviceId": issueDeviceObj.deviceId}} ,function (err, newDeviceResult) {
                              if(!err){
                                console.log("newDeviceResult is",newDeviceResult);
                                var res = 
                                {
                                  "Brand": deviceResult[0].Brand,
                                  "Model_No": deviceResult[0].Model_No,
                                  "OS_Version": deviceResult[0].OS_Version,
                                  "Resolution": deviceResult[0].Resolution,
                                  "Size": deviceResult[0].Size,
                                  "isAvailable": false,
                                  "id": deviceResult[0].id,
                                  "categoryId": deviceResult[0].categoryId,
                                  "issued_date": issueDeviceObj.issued_date,
                                  "TLemail":issueDeviceObj.TLemail,
                                  "images": [
                                      {
                                          "id": newDeviceResult[0].id,
                                          "deviceId": newDeviceResult[0].deviceId,
                                          "name": newDeviceResult[0].name,
                                          "type": newDeviceResult[0].type,
                                          "container": newDeviceResult[0].container,
                                          "isActive": newDeviceResult[0].isActive,
                                          "ImgURL": newDeviceResult[0].ImgURL,
                                          "ThumbURL250": newDeviceResult[0].ThumbURL250,
                                          "ThumbURL100": newDeviceResult[0].ThumbURL100
                                      }
                                  ]
                              };
                              // console.log("newDeviceResult res is -->",res);
                              IssuedeviceWithImage.push(res);
                              counter ++;
                              console.log("counter after incr",counter);
                              console.log("IssuedeviceArray.length after incr",IssuedeviceArray.length)
                              cb(null,IssuedeviceWithImage);
                            
                              }else{
                                console.log("errorin query is",err);
                                var err = new Error();
                                err.statusCode = 404;
                                err.message = 'something Went Wrong';
                                cb(err);
                                return;
                              }
                          })
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
               

              }, function (err, res) {
                if (err) {
                  console.log('some thing went wrong',err);
                  cb('some thing went wrong');
                } else {
                  console.log('total cost to be inserted',IssuedeviceWithImage);
                  cb(null,IssuedeviceWithImage);
                  // cb(null, data,userdeatils, toatalcost,productArray);
                }
              });
                  
                } else {
                  cb('You not issued any device');
                }
            })





           
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

};
