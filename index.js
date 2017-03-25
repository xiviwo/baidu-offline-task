var Horseman = require('node-horseman');
var _ = require('lodash');
var Promise = require("bluebird");
var _ = require('lodash');
var MongoClient = Promise.promisifyAll(require('mongodb').MongoClient);
var debug = require('debug')('task');
var config = require('./config')
var count = 0

Horseman.registerAction('waitForSelectorVisible', function(selector,visible) {
  var self = this;
  return this.waitFor(function waitForSelectorNotVisible(selector) {
              return $(selector).is(':visible')
            }, selector, visible)
});

Horseman.registerAction('textVisible', function(selector) {
  var self = this;
  return this.visible(selector)
             .then(function(visible){
                if(visible) return self.text(selector).log()
             })
});

Horseman.registerAction('visibleor', function(selector,selector2,selector3) {
  var self = this;
  return this.evaluate( function AnyOneIsVisible(selector,selector2,selector3){

      return ( $(selector).is(':visible') ||  $(selector2).is(':visible') || $(selector3).is(':visible'))

  },selector,selector2,selector3).then(function(visible){
    return visible
  })

            
});
Horseman.registerAction('clickSelector', function(selector) {

  var self = this;
  return this.log("点击:")
            .text(selector)
            .log()
            .click(selector)
            
});
Horseman.registerAction('openDownDialog', function() {

  var self = this;
  return this.visible('a#_disk_id_2')
            .then(function(visible){
                if(!visible) 
                  return self.waitForSelector('a[data-button-id="b13"]')
                        .clickSelector('a[data-button-id="b13"]')
            })
            
});



Horseman.registerAction('waitForClick', function(selector) {
  var self = this
  return this.log("点击:")
            .text(selector)
            .log()
            .click(selector)
            .wait(1000)
            .text('div.module-tip')
            .log()
            .waitFor(function waitForSelectorNotVisible(selector) {
              return $(selector).is(':visible')
            }, 'div.module-tip', false)
            .text('div.module-tip')
            .log()
            .screenshot('afterClick.png')
            .waitFor(function waitForOneOfSelectorVisible(selector,selector2,selector3,selector4) {

              return ( $(selector).is(':visible') || $(selector2).is(':visible') || $(selector3).is(':visible') || $(selector4).is(':visible'))

            }, 'div#offlinebtlist-dialog', 'div#newoffline-dialog','div#offlinelist-dialog','div#dialog1',true)
   
})



var horseman = new Horseman({
  timeout: 50000,
  ignoreSSLErrors:true,
  bluebirdDebug:true ,
  cookiesFile:'horseman.cookie',
  phantomOptions:{
  debug : true
  },
  });

var skipResourcesList = [
"https://passport.baidu.com/passApi/html/_blank.html",
"https://c3.pcs.baidu.com/rest/2.0/pcs/superfile2?method=upload&app_id=250528"
]

horseman.on('resourceError',function(err)  {
      if(!_.isEmpty(err)) debug('resourceError',err);
});

horseman.on('ResourceRequested',function(requestData, networkRequest){
   
   var regex = new RegExp(skipResourcesList.join('|'),'i');
   var bypassPing = 'http://baidu.com'
   
   if (requestData.url.match(regex) != null){
      debug('Aborting networkRequest....',networkRequest)
      return
   }
})

horseman
  .on('consoleMessage', function( msg ){
    console.log(msg);
  })

function MongoConnect() {
  var self = this
  uri = 'mongodb://localhost:27017/torrent';
    return MongoClient.connectAsync(uri).then(function(db){
    console.log("Connected correctly to server:" + uri)
    collection = db.collection('torrent');

    return {db:db,collection:collection}

  }).disposer(function(conn, promise) {
       conn.db.close();
       console.log("Disconnected to server:" + uri)
    });
}



function ask_vcode(status){

  return horseman.visible('div#dialog1')
         .then(function(visible){
            if(visible)
            return horseman
                 .textVisible('div.verify-body')
                 .textVisible('div.verify-error')
                 .waitForSelector('img.img-code')
                 .screenshot('vcode.png')
                 .then(function(){

                    return new Promise(function(resolve,reject){

                      console.log("Please open 'vcode.png' to check the verification code")
                      process.stdin.once('data',function(text){

                        vcode = text.toString().trim()
                        debug("Length:",vcode.length)
                        console.log('The code you input:', vcode)
                        if(vcode.length !== 4){
                          console.log("The length of your input is incorrect,please re-input")
                          return ask_vcode()
                        }
                        else{
                        
                        return resolve(vcode)}
                      })

                    }).then(function(vcode){
                      debug('vcode',vcode)
                      return horseman.value('input.input-code',vcode)
                             .waitForSelector('div#dialog1')                         
                             .waitForClick('a.g-button.g-button-blue-large:visible')
                             .then(function(){
                                return ask_vcode()
                             })
                    })
                })
        }).then(function(){
          return status
        })

}



function newoffline_dialog(){
  return horseman.visible('div#newoffline-dialog')
         .then(function(visible){
          if(visible)
            return horseman.textVisible('dt.dlg-inner-f.error.center.red')
                   .waitForSelector('a.g-button.g-button-gray:visible:not(a.mbtn)')
                   .waitForClick('a.g-button.g-button-gray:visible:not(a.mbtn)')
                   //.then(function(){ return waitForMsg()   })
                   .log("任务取消")
                   .then(function(){ return { status: 'canceled' }})
          else 
              return horseman.log('Waiting...')
                       .then(function(){ return { status: 'done' } })
          
         })
}
function offlinebtlist_dialog(status){
  debug("offlinebtlist_dialog",status)
  return horseman.visible('div#offlinebtlist-dialog')
         .then(function(visible){
            if(visible)
               return horseman.waitForSelector('a.g-button.g-button-blue-large:visible')
                      .waitForClick('a.g-button.g-button-blue-large:visible')
                      .then(function(){ return { status: 'done' }})
            else 
              return horseman.log('Waiting...')
                       .then(function(){ return status })
         })
 
}

function add_general(){

  return horseman.visibleor('div#offlinelist-dialog','div#newoffline-dialog','div#dialog1')
         .then(function(visible){
            debug("add_general",visible)
            if(visible)
              return horseman.log("添加普通任务")
                      .then(function(){ return ask_vcode() })
                      .then(function(){ return newoffline_dialog() })
                      .then(function(status){ return cancel_task(status) })
         })
}

function add_magnet(){

  return horseman.visibleor('div#offlinebtlist-dialog','div#newoffline-dialog','div#dialog1')
         .then(function(visible){
              if(visible) {

                return horseman.log("添加磁力任务")
                      .then(function(){ return newoffline_dialog() })
                      .then(function(status){ return offlinebtlist_dialog(status) })
                      .then(function(status){ return ask_vcode(status)   })
                      .then(function(status){ return cancel_task(status) })
             }
        })
}
function waitForMsg(){

  return horseman.text('div.module-tip')
            .log()
            .wait(1000)
            .waitFor(function waitForSelectorNotVisible(selector) {
              return $(selector).is(':visible')
            }, 'div.module-tip', false)
            .text('div.module-tip')
            .log()
            
}

function add_single(link)
{
  console.log("-----------------------------New Task:---------------------------------------")
  return horseman
            .openDownDialog()
            .waitForSelector('a#_disk_id_2')
            .clickSelector('a#_disk_id_2')
            .waitForSelector('input#share-offline-link')
            .textVisible('dt.dlg-inner-t.left.global-gray2')
            .log(link)
            .value('input#share-offline-link',link)
            .waitForClick('a.g-button.g-button-blue:visible:not(a.blue-upload)')
             .then(function(){ 
              if(link.indexOf('magnet:?xt=urn') > -1) return add_magnet() 
            })
            .then(function(){ 
              if(link.indexOf('magnet:?xt=urn') == -1) return add_general() 
            })
                  
}

function batch_add(collection){

  return Promise.map(collection,function(doc,index,length){
    
      if(typeof doc === 'object'){

             console.log("Adding: " + doc.name )
             return add_single(doc.magnetLink)
      }
      else
          return add_single(doc)

  },{concurrency:1})
}

function login(logged){

  if(logged){
    console.log("Logging in")
    return horseman.clickSelector('div.account-title a')
                   .waitForSelector("input[name='userName']")
                   .screenshot('inputUsername.png')
                   .value("input[name='userName']",config.bdid)
                   .waitForSelector("input[name='password']")
                   .screenshot('inputPassword.png')
                   .value("input[name='password']",config.bdpw)
                   .clickSelector("input[type='submit']")
                   .screenshot('login.png')
                   .waitForNextPage()
                   .screenshot('logined.png')
                   .log("成功登录")
  }
  else{
        console.log("成功打开主页")
  }
}


function cancel_task(msg){
  debug("cancel_task",msg)
  if(msg.status !== 'canceled')
    return horseman
          .openDownDialog()
          .textVisible('dd.loading-tips:visible')
          .waitFor(function waitForSelectorNotExsit(selector) {

              return  ( $(selector).length  == 0 )

          }, 'dd.loading-tips',true)
          .waitFor(function waitForOneOfSelectorVisible(selector,selector2) {

              return ( $(selector).is(':visible') || $(selector2).is(':visible') )

          }, 'dl#OfflineListView', 'div#msgListOffline',true)
          

          .textVisible('div#msgListOffline:visible')
          .exists('a.offline-cancel:not(a.displaynone)')
         .then(function(exists){
  
            if(exists) 
              return horseman.log("任务下载不完整，取消...")
                     .waitForSelector('dd.offline-item:nth-child(1) > div:nth-child(4) > a.offline-cancel:not(a.displaynone)')
                     .waitForSelector('dd.offline-item:nth-child(1) > div:nth-child(4) > a.offline-open:not(a.displaynone)')
                     .clickSelector('dd.offline-item:nth-child(1) > div:nth-child(4) > a.offline-cancel:not(a.displaynone)')
                     .screenshot('click_cancel.png')
                     .waitForSelector('div#confirm')
                     .html('div#confirm')
                     .textVisible('div#confirm')
                     .waitForClick('a.g-button.g-button-blue-large:visible')
                     
            else
              console.log("任务添加成功")
         })
}


function add_task(collection,singleLink){
  var ErrorOcurr = false
  return horseman
    .userAgent('Mozilla/5.0 (X11; Fedora; Linux x86_64; rv:47.0) Gecko/20100101 Firefox/47.0')
    .open('https://pan.baidu.com')
    .html('title')
    .log()
    .screenshot('beginning.png')
    .exists("div.account-title a")
    .then(function(log){

      return login(log)
    })
    .then(function(){

      if(singleLink)
        return add_single(singleLink)
      else
        return batch_add(collection)
    })
    .log("All Tasks are done")
    .screenshot('end.png')
    .catch(e =>{
      console.log(e)
      ErrorOcurr = true
    })
    .finally(function() {
           
        if(ErrorOcurr && count < 5){
          count++
          return horseman.wait(500).then(function(){ return add_task(collection,singleLink) })
        }
        else {
          if(count == 5 ) console.log("Too many error,exit ")
          horseman.close();
          process.exit();
        }

    });

}


var argv = require('minimist')(process.argv.slice(2),{
  string:['search','link'],
  boolean:[],
  alias:{search:'s',link:'l'},

  unknown : function(param){ console.log("unknown parameter:" + param);process.exit();}
});

debug(argv)

if(_.isEmpty(config.bdpw) || _.isEmpty(config.bdid))
{
  console.log("Baidu ID or password is empty or undefine, please edit 'config.js' to configurate that.")
  process.exit(1)
}
if(argv.s){
    Promise.using(MongoConnect(), function(connection) {

          return Promise.fromCallback(function(done){
      
            return collection.find({ name: { $regex: argv.s, $options: "si" } }).toArray(done)
      
          }).then(function(collection){

            if(!_.isEmpty(collection)) {
              console.log("Found " + collection.length + " records")
              return add_task(collection,false)
            }
            else{
              console.log("No results found,exit")
              return horseman.close()
            }
          })


    })
}else if(typeof argv.l === 'object') {
  
    add_task(argv.l,false)
}else{
    add_task(null,argv.l)
}