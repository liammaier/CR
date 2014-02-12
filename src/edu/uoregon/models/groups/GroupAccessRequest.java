package edu.uoregon.models.groups;

import javax.persistence.Id;

import com.googlecode.objectify.Key;
import com.googlecode.objectify.annotation.Cached;
import com.googlecode.objectify.annotation.Parent;

import edu.uoregon.models.SaraUser;

@Cached
public class GroupAccessRequest {

	@Id public Long id; // id's of type Long are auto-generated
	@Parent public Key<Group> group;
	public Key<SaraUser> user;

	// Objectify requires constructor with no parameters
	@SuppressWarnings("unused")
	private GroupAccessRequest() {}
	
	public GroupAccessRequest(Key<Group> group, Key<SaraUser> user) {
		this.group = group;
		this.user = user;
	}
	
}
