package edu.uoregon.models.groups;

import javax.persistence.Id;

import com.googlecode.objectify.Key;
import com.googlecode.objectify.annotation.Cached;
import com.googlecode.objectify.annotation.Parent;

import edu.uoregon.models.SaraUser;

// if there is no UserRole defined for a user then they don't have any extra privileges
@Cached
public class UserGroupRole {

	@Id public Long id; // id's of type Long are auto-generated
	@Parent public Key<Group> group;
	public Key<SaraUser> user;
	public String role;
	
	// Objectify requires constructor with no parameters
	@SuppressWarnings("unused")
	private UserGroupRole() {}
	
	public UserGroupRole(Key<Group> group, Key<SaraUser> user, String role) {
		this.group = group;
		this.user = user;
		this.role = role;
	}
	
	public boolean isGroupLeader() {
		return role.equals("leader");
	}
	
}
