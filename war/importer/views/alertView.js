var Alert = Backbone.Model.extend({
    defaults: {
        type:"success",
        text:"null",
    }
});

var AlertView = Backbone.View.extend({
    id: "alertDiv",
    working:false,
    initialize: function(){
        this._alertQueue = [];
        this.render();
        Mongoose.vent.bind("alert",this.alert,this);
        Mongoose.vent.bind("newMessage",function(){
            this.alert("info","New Message Opened");
        },this);
        Mongoose.vent.bind("filterMessages",function(){
            this.alert("info","Filtering Messages");
        },this);
        Mongoose.vent.bind("editEvent",function(){
            this.alert("info","Editing Event");
        },this);
        Mongoose.vent.bind("filterDocuments",function(){
            this.alert("info","Filtering Documents");
        },this);
        Mongoose.vent.bind("projectChanged",function(){
            this.alert("info","Changing Project");
        },this);
        Mongoose.vent.bind("deleteMarkup",function(){
            this.alert("warning","Deleting Markup");
        },this);
        Mongoose.vent.bind("showResults",function(r,i,name){
            this.alert("info","Showing Query Results for "+name);
        },this);
        Mongoose.vent.bind("cancelMessageEdit",function(){
            this.alert("warning","Message Edit Canceled");
        },this);
        Mongoose.vent.bind("addSearchPin",function(x,y,name){
            this.alert("info","Showing Pin for " + name);
        },this);
        Mongoose.vent.bind("searchFor",function(name){
            this.alert("info","Searching for " + name);
        },this);
        Mongoose.vent.bind("mapError",function(){
            this.alert("error","Map Error");
        },this);
        Mongoose.vent.bind("saveMessagePin",function(){
            this.alert("success","Message Saved");
        },this);
    },
    events:{

    },
    render: function(){
        return this;
    },
    //called with an event triggered on "alert with [type,text] as args
    alert: function(type,text){
        this._alertQueue.push(new Alert({
                type:type,
                text:text,
        }));

        //use the helper function that handles queued alerts
        //this.alertNow();
    },
    
    alertNow: function(){
    	
        //if there are no messages being displayed and there is a message in the queue to show
        if(!this.working && this._alertQueue.length > 0 && this.$el.find("#alertMessage").length == 0){
        	
        	//now we are working on an alert
        	this.working = true;
        	
            //pull the first alert in the queue and display it
            var alert = this._alertQueue.shift();
           
            //add the html into the div wit the correct tags for style
        	this.$el.attr('class','stretch-x alert alert-'+alert.get("type"));
        	this.$el.html("<p> " + alert.get("text") + " </p>");
            this.$el.show();

            //tells the alert to fade after two seconds, then starts the next alert in the queue
            var that = this;
            this.$el.delay(1700).fadeOut("slow", function () { 
                //try to alert again
            	that.working = false;
                that.alertNow();
            });
        }
    },
}); 