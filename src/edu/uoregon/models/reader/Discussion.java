package edu.uoregon.models.reader;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.TimeZone;
import javax.persistence.Id;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.Objectify;
import com.googlecode.objectify.ObjectifyService;
import com.googlecode.objectify.annotation.Cached;

import edu.uoregon.models.DAO;
import edu.uoregon.models.FeedData;
import edu.uoregon.models.SaraUser;
import edu.uoregon.models.groups.Group;
import edu.uoregon.models.groups.UserGroupRole;

import static org.apache.commons.lang3.StringEscapeUtils.escapeHtml4;

@Cached
public class Discussion{

	@Id private Long id;
	private Key<Note> ownerKey; //the key to the object the discussion belongs to
	private int numberOfComments;
	private Date lastUpdated;
	private Date timeCreated;
	private int policy;


	@SuppressWarnings("unused")
	private Discussion(){} //Objectify requires an empty constructor.


	/** 
	 * Creates a new discussion with zero comments.
	 * @param ownerKey the key to the object the discussion belongs to
	 */
	public Discussion(Key<Note> ownerKey, int dPolicy){
		this.ownerKey = ownerKey;
		this.policy = dPolicy;
		this.numberOfComments = 0;
		this.timeCreated = new Date();
		this.lastUpdated = timeCreated;
	}

	/**
	 * Gets the id of this discussion.
	 * @return the id of this discussion
	 */
	public Long getId() {
		return id;
	}

	/**
	 * Gets the total number of comments in this discussion.
	 * @return the sum of all comments in this discussion
	 */
	public int getNumberOfComments(){
		return numberOfComments;
	}

	/**
	 * Gets the total number of comments visible for a specific user.
	 */
	public int getNumberOfComments(Key<SaraUser> user){
			DAO dao = new DAO();
			Key<Discussion> key = new Key<Discussion>(Discussion.class, id);
			return dao.ofy().query(Comment.class).ancestor(key).filter("author", user).count();
	}


	/** 
	 * Gets the time that the discussion was created.
	 */
	public Date getTimeCreated() {
		return timeCreated;
	}

	/** 
	 * Gets the time that the discussion was last updated.
	 */
	public Date getLastUpdated() {
		return lastUpdated;
	}

	/** 
	 * Gets the policy of the Discussion. For example, open or moderated.
	 */
	public int getPolicy() {
		return policy;
	}

	/** 
	 * Sets the policy of the Discussion.
	 */
	public void setPolicy(int policy) {
		this.policy = policy;
	}

	/**
	 * Creates a new comment and appends it to the end of the discussion
	 * @param text the text of the comment
	 * @param author the key of the creator of the the comment
	 */
	public Comment addNewComment(String text, Key<SaraUser> author){
		Objectify ofy = ObjectifyService.beginTransaction();
		try
		{
			numberOfComments++;
			lastUpdated = new Date();
			Key<Discussion> discussionKey = new Key<Discussion>(Discussion.class, id);
			Comment comment = new Comment(discussionKey, author, text);
			comment.setCommentNumber(numberOfComments);
			Key<Comment> commentKey = ofy.put(comment);
			ofy.put(this);
			ofy.getTxn().commit();

			//Save the data for the NewsFeed.
			DAO dao = new DAO();
			Note note = dao.ofy().get(ownerKey);
			FeedData feedData = new FeedData("comment", author, note.group, note.section, note.user, commentKey);
			dao.ofy().put(feedData);

			return comment;
		}
		finally
		{
			if (ofy.getTxn().isActive())
				ofy.getTxn().rollback();
		}
	}


	/**
	 * Convert the discussion to JSON.
	 * @return string version of discussion in json format
	 */
	public String toJSON(){
		DAO dao = new DAO();
		Key<Discussion> k = new Key<Discussion>(Discussion.class, id);
		List<Comment> comments = dao.ofy().query(Comment.class).order("timeCreated").ancestor(k).list();

		JsonObject jsonDiscussion = new JsonObject();
		JsonArray jsonComments = new JsonArray();

		//Add each comment within the discussion to the JSON array.
		for (Comment comment : comments) {
			JsonObject jsonComment = commentJSON(comment);
			jsonComments.add(jsonComment);
		}

		jsonDiscussion.add("comments", jsonComments);

		return jsonDiscussion.toString();
	}


	private boolean isGroupMember(Key<SaraUser> user, Key<Group> group){
		DAO dao = new DAO();
		UserGroupRole userRole = dao.ofy().query(UserGroupRole.class).ancestor(group).filter("user", user).get();
		if(userRole == null) return false;
		String role = userRole.role;
		if(role.equals("my") || role.equals("leader") || role.equals("member")) return true;
		else return false;
	}


	public String toJSON(Key<SaraUser> user, Key<Group> group){
		DAO dao = new DAO();
		Key<Discussion> k = new Key<Discussion>(Discussion.class, id);
		List<Comment> comments;

		if(policy == 0 || isGroupMember(user, group)){
			comments = dao.ofy().query(Comment.class).order("timeCreated").ancestor(k).list();
		}else{
			comments = dao.ofy().query(Comment.class).order("timeCreated").ancestor(k).filter("author", user).list();
		}

		JsonObject jsonDiscussion = new JsonObject();
		JsonArray jsonComments = new JsonArray();

		//Add each comment within the discussion to the JSON array.
		for (Comment comment : comments) {
			JsonObject jsonComment = commentJSON(comment);
			jsonComments.add(jsonComment);
		}

		jsonDiscussion.add("comments", jsonComments);

		return jsonDiscussion.toString();
	}



	private JsonObject commentJSON(Comment comment){
		DAO dao = new DAO();
		JsonObject jsonComment = new JsonObject();
		jsonComment.add("author", new JsonPrimitive(dao.ofy().get(comment.getAuthor()).email.getEmail()));
		jsonComment.add("text", new JsonPrimitive(escapeHtml4(comment.getText())));

		SimpleDateFormat formatter = new SimpleDateFormat("MMM d, yyyy h:mm a");
		TimeZone timezone = TimeZone.getTimeZone("America/Los_Angeles");
		formatter.setTimeZone(timezone);
		String time = formatter.format(comment.getTimeCreated());
		jsonComment.add("time", new JsonPrimitive(time));
		jsonComment.add("commentNumber", new JsonPrimitive(comment.getCommentNumber()));

		return jsonComment;
	}

}