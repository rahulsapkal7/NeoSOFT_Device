'use strict';
var loopback = require('loopback');
var Device = loopback.getModel("device");
// var Category = loopback.getModel("category");

// var UserAcc = loopback.getModel("user_account");
// var urls = require("./global");

// var Product =require("product");
module.exports = function(Image) {
  // var app = require('../../server/server');
  //  var publicContainer = "public";
   
  var thumb = require('node-thumbnail').thumb;
  // var imgURL = "http://10.0.8.145:8087";
  var imgURL = "http://10.0.80.51:8087";
  
 
  var containerName = 'image';
  // var containerName = 'thumbnail';
  
  var thumbpath;
  var imgType;
  var img_source_path = 'server/files/image/';
  var img_destination_path = 'server/files/thumbnail'

  // Custom API for Upload image for Product, Category, User
  Image.profileData = function (ctx,options, cb) {

  console.log("before image create",ctx.req.params);
    ctx.req.params.container = containerName;
    console.log("before image create",ctx.req.params);
    console.log("before Image.app.models",Image.app.models.container);
    console.log("before Image.app.models.upload ",Image.app.models.container.upload);
    
    
    Image.app.models.container.upload(ctx.req, ctx.result, function (err, fileObj) {
      console.log("upload00",JSON.stringify(err));
      if (err) {
        console.log("upload01");
        // console.log('err', err);
        cb({"statusCode" : 402,"message": "file is not uploaded please attach file"});
        return;
      }
      // else
      else if (fileObj.fields.empId == undefined && fileObj.fields.deviceId == undefined )
      {
        console.log("upload02");
        cb({"statusCode" : 400,"message": "Either deviceId or empId is required"});
        return;
      }
      else if (fileObj.fields.empId == undefined && fileObj.fields.deviceId != undefined) {
      console.log("inside device id flow");
        if (fileObj.fields.deviceId != "")
        {
          imgType = "Device";
          Device.find(
            {where: {id : fileObj.fields.deviceId[0]} },
            function(err, device){
              if(!err){
                if(device.length == 0){
                  cb({"statusCode" : 401,"message": "device id is Invalid"});
                  return;
                }
                else {
                  var finalresponse = [];
                  let fileLength = fileObj.files.file.length;
                  let ln = 0;
                  fileObj.files.file.forEach((fileInfo) => {
                    console.log("fileInfo is ",fileInfo);
                    thumb({
                      prefix: '_',
                      suffix: '_250thumb',
                      source: img_source_path + fileInfo.name, //please give server related path
                    destination: img_destination_path,
                    overwrite: true,
                    width: 250
                }).then((done) => {
                  console.log("done[0].dstPath is ",done[0].dstPath);
                    var thumbpath1 =done[0].dstPath;

                  thumb({
                    prefix: '_',
                    suffix: '_100thumb',
                    source: img_source_path + fileInfo.name, //please give server related path
                    destination: img_destination_path,
                    overwrite: true,
                    width: 100
                  }).then( (done) => {
                    var thumbpath2 =done[0].dstPath;



                  Image.create({
                    name: fileInfo.name,
                    type: fileInfo.type,
                    container: fileInfo.container,
                    isActive: true,
                    // ImgURL:  encodeURI(imgURL+"/server/files/"+fileInfo.container +"/" + fileInfo.name),
                    // ThumbURL250: encodeURI(imgURL+"/"+thumbpath1),
                    // ThumbURL100: encodeURI(imgURL+"/"+thumbpath2),

                    ImgURL:  encodeURI("/server/files/"+fileInfo.container +"/" + fileInfo.name),
                    ThumbURL250: encodeURI("/"+thumbpath1),
                    ThumbURL100: encodeURI("/"+thumbpath2),
                    deviceId : fileObj.fields.deviceId[0],
                    // userId: fileObj.fields.userId[0]
                  }, function (err, obj) {
                    console.log("error is 00");
                    if (err !== null) {
                      console.log("error is 01");
                      cb(err);
                    } else {
                      console.log("obj is  -->>>" + JSON.stringify(obj));
                      finalresponse.push(obj);
                      ln = ln + 1;
                      // console.log('ln', ln)
                      if ( fileLength === ln ) {
                        // console.log('equal')
                        // console.log("finalresponse is  -->>>" + finalresponse);
                        cb(null, finalresponse);
                        return;
                      }
                    }
                  })
                })
                })
                });
                }
              }else{
                console.log("error is  -->",JSON.stringify(err));
                cb(err);
              }
            }
          )
        }
        else
        {
          cb({"statusCode" : 401,"message": "device id should not null"});
          return;
        }

      }
    
    });
  }


  Image.remoteMethod(
    'profileData',
    {

      accepts: [
        {arg: 'ctx', type: 'object', http: {source: 'context'} },
        {arg: 'options', type: 'object', http:{ source: 'query'}}

      ],
      returns: {arg: 'fileObject', type: 'object', root: true},
      http: {path: '/upload', verb: 'post'}


    });




};
