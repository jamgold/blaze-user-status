  UserConnections = new Meteor.Collection("user_status_sessions");
if (Meteor.isClient) {

  Accounts.ui.config({
    passwordSignupFields: 'USERNAME_AND_OPTIONAL_EMAIL'
  });

  Meteor.subscribe('user_status');
  Meteor.subscribe('user_status_sessions');

  Template.hello.greeting = function () {
    return "Welcome to blaze-user-status. (Meteor "+Meteor.release+")";
  };

  Template.hello.isMonitoring = function() {
    return UserStatus.isMonitoring()
      ? '<span class="idle success">monitoring</span>'
      : '<span class="idle error">nope</span>'
    ;
  }

  Template.users.user = function() {
    return Meteor.users.find();
  };

  Template.users.lastLogin = function(t) {
    if(t != undefined)
      return new Date(t);
  };

  Template.users.isIdle = function(i) {
    return i ? 'user-idle' : 'user-active';
  }

  Template.hello.events({
    'click input': function (e, t) {
      var u = UserConnections.findOne({userId: Meteor.userId()});
      $('#userConnection').html( EJSON.stringify(u,{indent:true}) );
    }
  });

  Template.users.events({
    'click a': function(e, t) {
      e.preventDefault();
      var userId = $(e.target).attr('userid');
      var u = UserConnections.findOne({userId: userId});
      $('#userConnection').html( EJSON.stringify(u,{indent:true}) );
    }
  })

  Deps.autorun(function(){
    try{
      if(Meteor.userId())
        UserStatus.startMonitor({
          threshold: 30000,
          idleOnBlur: true
        });
      else
        UserStatus.stopMonitor();
    } catch(e) {
      console.log(e.message);
    }
  });
}

if (Meteor.isServer) {
  // Meteor.users.allow({
  //   fetch: ['status','username']
  // });
  Meteor.publish('user_status_sessions',function(){
    return UserStatus.connections.find();
  });

  Meteor.publish('user_status', function(){
    // console.log(this.userId);
    if(this.userId)
    return Meteor.users.find({"status.online":true}
      ,{fields:{
         "status":1
        ,"username":1
      }}
    );
  });

  Meteor.startup(function () {
    // code to run on server at startup
  });
}
