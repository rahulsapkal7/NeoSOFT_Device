// /server/boot/hook.js
module.exports = function(app) {
  var remotes = app.remotes();
  // modify all returned values
  remotes.after('**', function (ctx, next) {
    // console.log("ctx is ",ctx);
    // console.log("ctx.result is ",ctx.result);
    if (ctx.result != undefined) {
      ctx.result.status = 200;
      ctx.result = {
        data: ctx.result
       
      };
       console.log("ctx is ",ctx.result);
    } 
   
    

next();

  });
};