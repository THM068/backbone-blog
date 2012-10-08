(function($){

window.monthNames = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");

// Here is my most basic model, for blog posts.
// Since blog posts are such basic, text-based content, this model doesn't have to be very fancy.
// I'm more or less just specifying that each post will have a title and content 
window.Post = Backbone.Model.extend({
	initialize: function(){
	},

	defaults: {
		title: "",
		content: "",
        time: "",
        mood: "neutral"
	}
});

// Here, I specify that my collection of posts, called 'Blog,' will consist of posts.
window.Blog = Backbone.Collection.extend({
	model: Post
});

//Here's where I specify how specific posts will be rendered in the view
window.PostView = Backbone.View.extend({
	// Every time a post is rendered, a new DOM element called 'post' will be rendered
    tagName: "div",

    // Here, I'm using Underscore and jQuery to specify which template I'll be extracting from the .html page to render specific posts
	template: _.template($('#postTemplate').html()),

    // Upon initialization, all of the possible events that interact with posts are identified and bound to the view model
	initialize: function(){
		_.bindAll(this, "render", "unrender", "change", "deletePost", "addPost");
		
        // Upon any change introduced into any post, that post will be re-rendered
        this.model.bind("change", this.render);
	},

    // Here, I specify which functions are called in response to specific events
	events: {
		"click button#delete": "deletePost",
		// I haven't yet added an "edit" function, but this will be on the way soon
        "click button#edit": "editPost",
	},

    // Upon rendering, each "post" element will be rendered according to the title/content of the post being inserted into the template
	render: function(){
		$(this.el).html(this.template(this.model.toJSON()));
		return this;
	},

    // Upon deleting a post, I need to both delete that post and also remove the DOM element associated with it from the view
	deletePost: function(){
        $(this.el).remove();
		this.model.destroy();
	},

    // This is still a work in progress and doesn't yet work
	editPost: function(e){
        e.preventDefault();
        var editTemplate = _.template($('#editPostTemplate').html());
		$(this.el).replaceWith(editTemplate);
	}
});


// Work in progress
/* window.EditPostView = Backbone.View.extend({
    tagName: "editPost",

    template: _.template($('#editPostTemplate').html()),

    initialize: function(){

    },

    events: {
        "submit form#editPost": "editPost"
    },

    editPost: function(){
        var editedPost = new Post({ title: $('#editTitle').val(), content: $('#editContent').val() });
        Blog.remove()
    }
}); */

// Here, I specify what my overarching view looks like
window.BlogView = Backbone.View.extend({
	// Right now, "posts" is just an empty div element in my .html file, out of which I will generate just about everything in my app
    el: $('#posts'),

    // When I submit a new post, that needs to render a new DOM element and add it to the others
	events: {
   		"submit form#newPost": "addPost",

        "submit form#editPost": "saveEdit"
    },
 
    initialize: function (){
    	_.bindAll(this, "render", "deletePost", "addPost", "appendPost");
        
        // Without this step, there's no initial collection to render!
        this.collection = new Blog();
        
        // When a new post is added, it needs to be appended to the collection
        this.collection.bind("add", this.appendPost);
        this.collection.bind("change", this.render);
        this.render();
        // this.collection.fetch();
    },
 
    // Here is where Underscore becomes really useful. The _.each method enables me to render all of the specific post views at once
    render: function (){
        var that = this;
        _.each(this.collection.models, function (post) {
            var postView = new PostView({ model: post });
            $(this.el).append(postView.render().el);
        }, this);
    },

    // Appending a new post to the application view
    appendPost: function(newPost){
    	// Here, I create a new post view using data from the variable newPost generated below in the "addPost" function
        var newPostView = new PostView({ model: newPost });
    	$('#postsContainer').append(newPostView.render().el);
    },

    addPost: function(e){
        //If you don't prevent the default action, then you will click "save" and nothing will happen!
    	e.preventDefault();

        // Note the if/else construct. If the title or content of the new post is empty, then an alerty will be triggered
    	if ($('#title').val() && $('#content').val() && $('#mood').val()){
            var currentMood = ($('#mood').val() ? $('#mood').val() : "undefined");
            var timeNow = new Date();
            var formattedTime = timeNow.getHours() + ":" + timeNow.getMinutes() + ":" + timeNow.getSeconds() + " on " + timeNow.getDate() + "-" + timeNow.getMonth() + "-" + timeNow.getFullYear();
    	    var newPost = new Post({ title: $('#title').val(),
                                    content: $('#content').val(),
                                    time: formattedTime, 
                                    mood: currentMood });
    	    this.collection.add(newPost);
    	} else {
    	    alert("Try again! Your post must have a title, content, and an associated mood.");
    	}
    },

    saveEdit: function(e){
        e.preventDefault();
        var editedPost = new Post({ title: $('#editTitle').val(), content: $('#editContent').val() });
        var editedPostView = new PostView({ model: editedPost });
        $(this.el).replaceWith(editedPostView);
    }
});

// Here, we actually instantiate the main app view. Without this step, nothing happens!
var blogView = new BlogView();

}(jQuery));
