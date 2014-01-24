define(['jquery', 'skyex', 'req', 'dom'], function($, skyex, req, xdom) {
  function jqm_alert(message, time) {
    message = message || '';
    if (message) {
      
      $.mobile.loading("show", {
          text : message,
          textVisible : true,
          theme : "z"
      });
    }
    
    if (time === -1) {
      return;
    }
    
    time = time ? time * 1000 : 1000;
    
    // Do your ajax call and processing here
    setTimeout(function() {
      $.mobile.loading("hide");
    }, time);
  }
  var user = {
      idx : 0,
      data : null,
      
      subscribed : function() {
        if (!user.data) {
          user.profile(function() {
            user.subscribed();
          });
        }
        ;
      },
      
      subscribe : function(book_id, subscribe, callback) {
        var data = {
            type : 'user',
            act : 'subscribe',
            book_id : book_id,
            subscribe : subscribe
        };
        skyex.lib.req(skyex.requestUrl, data, function(data) {
          switch (data.status) {
          case 1:
            if (subscribe) {
              if (!user.data.sub_books) {
                user.data.sub_books = [book_id];
              } else {
                user.data.sub_books.push(book_id);
              }
            } else {
              if (user.data.sub_books) {
                var idx = user.data.sub_books.indexOf(book_id);
                user.data.sub_books.splice(idx, 1);
              }
            }
            
            callback();
            break;
          case 2:
            jqm_alert('您尚未登录，请先完成账号的登录！', -1);
            setTimeout(function() {
              jqm_alert('');
            }, 3000);
            
            break;
          default:

          }
        });
      },
      logout : function() {
        var data = {
            type : 'user',
            act : 'logout'
        };
        
        skyex.lib.req(skyex.requestUrl, data, function(data) {
          switch (data.status) {
          case 1:
            user.initLogin();
            break;
          default:

          }
        });
      },
      init : function(idx) {
        user.initLogin();
        user.profile();
      },
      profile : function(callback) {
        var data = {
            type : 'user',
            act : 'profile'
        }
        skyex.lib.req(skyex.requestUrl, data, function(data) {
          switch (data.status) {
          case 1:
            user.data = data.data;
            if (!callback) {
              user.initAccount(data.data);
            } else {
              callback();
            }
            break;
          default:
            user.initLogin();
          }
        });
      },
      initProfile : function(user) {
        skyex.app.book.backBtn('我的信息', {
            click : function() {
              user.initAccount(user.data);
              return false;
            },
            show : true
        });
        $.json2html(xdom.htmlTemplate['initProfile'], $('.wrapper'), user);
      },
      initForgetPassword : function() {
        skyex.app.book.backBtn('忘记密码', {
            click : function() {
              user.initLogin();
            },
            show : true
        });
        
        $.json2html(xdom.htmlTemplate['initForgetPassword'], $('.wrapper'));
      },
      initModifyPassword : function() {
        skyex.app.book.backBtn('修改密码', {
            click : function() {
              user.initAccount(user.data);
            },
            show : true
        });
        $.json2html(xdom.htmlTemplate['initModifyPassword'], $('.wrapper'));
      },
      initAccount : function(user) {
        $('.wrapper').html('');
        skyex.app.book.backBtn('我的天易', {
          click : function() {
            return false;
          },
        });
        xdom.htmlTemplate['initAccount'].children[0].children[1].text = user.username;
        xdom.htmlTemplate['initAccount'].children[1].children[0].children[0].events.click = function() {
          user.initProfile(user);
        };
        xdom.htmlTemplate['initAccount'].children[1].children[1].children[0].events.click = function() {
          user.initModifyPassword();
        };
        $.json2html(xdom.htmlTemplate['initAccount'], $('.wrapper'));
      },
      
      initRegister : function() {
        
        skyex.app.book.backBtn('用户注册', {
            click : function() {
              user.initLogin();
            },
            show : true
        });
        
        $.json2html(xdom.htmlTemplate['initRegister'], $('.wrapper'));
      },
      
      initLogin : function() {
        skyex.app.book.backBtn('用户登录', {
          click : function() {
            user.init();
            return false;
          }
        });
        skyex.app.tab.swap($('#nav-bar-' + user.idx));
        $.json2html(xdom.htmlTemplate['initLogin'], $('.wrapper'));
      }
  };
  
  skyex.app.user = user;
  
  return user;
});