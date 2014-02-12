package edu.uoregon.models;

import java.util.Iterator;

import com.googlecode.objectify.Key;
import com.googlecode.objectify.annotation.Cached;

import edu.uoregon.models.groups.Group;

@Cached
public class NewsFeed {
	private int limit;
	
	public NewsFeed(){
		this.limit = 25;
	}
	
	/**
	 * @param limit the maximum number of items the NewsFeed will fetch
	 */
	public NewsFeed(int limit){
		this.limit = limit;
	}
	
			
	/**
	 * Get the news feed for a specific group.
	 * @return an iterator with data sorted by time (descending)
	 */
	public Iterator<FeedData> getGroupFeed(Key<Group> group){
		DAO dao = new DAO();
		return dao.ofy().query(FeedData.class).filter("group", group).order("-time").limit(limit).fetch().iterator();
	}
	
	/**
	 * Get the news feed for a user, where the user is the target.
	 * @return an iterator with data sorted by time (descending)
	 */
	public Iterator<FeedData> getUserFeed(Key<SaraUser> user){
		DAO dao = new DAO();
		return dao.ofy().query(FeedData.class).filter("targetUser", user).order("-time").limit(limit).fetch().iterator();
	}
	
}
