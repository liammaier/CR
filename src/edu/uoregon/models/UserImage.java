package edu.uoregon.models;

import javax.persistence.Id;

import com.googlecode.objectify.Key;
import com.googlecode.objectify.annotation.Cached;


import edu.uoregon.models.SaraUser;

// if there is no UserRole defined for a user then they don't have any extra privileges
@Cached
public class UserImage {

	@Id public Long id; // id's of type Long are auto-generated
	public Key<SaraUser> user;
	public Key<Image> image;
	
	// Objectify requires constructor with no parameters
	@SuppressWarnings("unused")
	private UserImage() {}
	
	public UserImage(Key<SaraUser> user, Key<Image> image) {
		this.image = image;
		this.user = user;
	}
	
}
