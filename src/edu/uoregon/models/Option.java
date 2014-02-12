package edu.uoregon.models;

import javax.persistence.Id;

import com.googlecode.objectify.Key;
import com.googlecode.objectify.Objectify;
import com.googlecode.objectify.annotation.Cached;

@Cached
public class Option {
	@Id public Long id; // id's of type Long are auto-generated
			
	public String name;
	public String type; 
	public boolean enabled;
	public Key<SaraUser> user; // email
	public String data;
	
	// Objectify requires constructor with no parameters
	@SuppressWarnings("unused")
	private Option() {}
	
	public Option(Key<SaraUser> user, String name, String type, boolean enabled,  String data) {

		this.name = name;
		this.type = type;
		this.enabled = enabled;
		this.user = user;
		this.data = data;
	}
	
	public void setEnabled(boolean enabled) {
		this.enabled = enabled;
	}

	public void setData(String data) {
		this.data = data;
	}
	
	public static void addDefaultOptions(Key<SaraUser> userKey){
		
		DAO dao = new DAO();
		Objectify ofy = dao.ofy();
		
		// PREVIEW
		ofy.put(new Option(userKey, "previewsections", "preview", true, ""));
//		ofy.put(new Option(userKey, "previewfigures", "preview", true, "")); 
		
		// READ
		ofy.put(new Option(userKey, "ttsspeed", "read", true, ""));
		ofy.put(new Option(userKey, "ttsaccent", "read", true, ""));
		ofy.put(new Option(userKey, "ttspitch", "read", true, ""));

		
    	// REVIEW
		ofy.put(new Option(userKey, "reviewsummaries", "review", true, ""));
		ofy.put(new Option(userKey, "reviewmultimedia", "review", true, ""));
	    		
	}
	
}
