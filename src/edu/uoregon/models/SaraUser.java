package edu.uoregon.models;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;

import javax.persistence.Id;

import com.google.appengine.api.datastore.Email;
import com.google.appengine.api.users.User;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.Query;
import com.googlecode.objectify.annotation.Cached;

@Cached
public class SaraUser implements Serializable{

	/**
	 * 
	 */
	private static final long serialVersionUID = 7002275798864878515L;
	@Id public Long id; // id's of type Long are auto-generated
	public String googleId;
	public String name;
	public Email email;
	public String type;
	public boolean acceptUpdates = false;
	public boolean seenTutorial = false;
	public ArrayList<Key<Content>> accessibleContent;
	public ArrayList<Key<Resource>> accessibleResources;
	public String updateFrequency = "";
	public Object timeCreated;
	
	public String nextSessionNote;

	// Objectify requires constructor with no parameters
	@SuppressWarnings("unused")
	private SaraUser() {}

	public SaraUser(String email){
		this.email = new Email(email);
	}
	
	public SaraUser(User user, String type , String name) {
		accessibleContent = new ArrayList<Key<Content>>();
		accessibleResources = new ArrayList<Key<Resource>>();
		this.type = type;
		this.name = name; 
		this.googleId = user.getUserId();
		this.name = user.getNickname(); //why is name set twice?
		this.email = new Email(user.getEmail().toLowerCase());
	}
	
	/**
	 * Get the key of the user currently logged in.
	 */
	public static Key<SaraUser> getCurrentUserKey(){
		UserService userService = UserServiceFactory.getUserService();
		User user = userService.getCurrentUser();
		DAO dao = new DAO();
		
		return dao.ofy().query(SaraUser.class).filter("email", new Email(user.getEmail().toLowerCase())).getKey();
	}

	// Return all users
	public static Collection<SaraUser> getAllUsers(){
		DAO dao = new DAO();
		Query<SaraUser> q = dao.ofy().query(SaraUser.class);
		
		HashSet<SaraUser> users = new HashSet<SaraUser>();
		
		for (SaraUser u : q){
			users.add(u);
		}
		
		return users;
		
	}
	public void initilizeUser(User user, String type , String name) {
		accessibleContent = new ArrayList<Key<Content>>();
		accessibleResources = new ArrayList<Key<Resource>>();
		this.type = type;
		this.name = name; 
		this.googleId = user.getUserId();
		this.name = user.getNickname(); //why is name set twice?
	}

	
	public static SaraUser findUser(String email){
		DAO dao = new DAO();
		
		return dao.ofy().query(SaraUser.class).filter("email", new Email(email)).get();
	}
	
	public Key<SaraUser> getKey (){
		return new Key<SaraUser>(SaraUser.class ,this.id);
	}
	
	public String getEmail() {
		return email.getEmail();
	}
	
	public String getNextSessionNote() {
		return nextSessionNote;
	}

	public void setNextSessionNote(String nextSessionNote) {
		this.nextSessionNote = nextSessionNote;
	}
	
	
}
