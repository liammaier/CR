package edu.uoregon.models.libraries;

import javax.persistence.Id;

import com.googlecode.objectify.Key;
import com.googlecode.objectify.annotation.Cached;


import edu.uoregon.models.SaraUser;

// if there is no UserRole defined for a user then they don't have any extra privileges
@Cached
public class UserLibraryRole {

	@Id public Long id; // id's of type Long are auto-generated
	public Key<Library> library;
	public Key<SaraUser> user;
	public String role;
	
	// Objectify requires constructor with no parameters
	@SuppressWarnings("unused")
	private UserLibraryRole() {}
	
	public UserLibraryRole(Key<Library> library, Key<SaraUser> user, String role) {
		this.library= library;
		this.user = user;
		this.role = role;
	}
	
	public boolean isLibraryInstructor() {
		return role.equals("instructor");
	}
	
}
