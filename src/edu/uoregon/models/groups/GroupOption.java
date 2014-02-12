package edu.uoregon.models.groups;

import javax.persistence.Id;

import com.googlecode.objectify.Key;
import com.googlecode.objectify.annotation.Cached;
import com.googlecode.objectify.annotation.Parent;

@Cached
public class GroupOption {

	@Id public Long id; // id's of type Long are auto-generated
	@Parent public Key<Group> group;
	public String name;
	public String value;
	
	// Objectify requires constructor with no parameters
	@SuppressWarnings("unused")
	private GroupOption() {}
	
	public GroupOption(Key<Group> group, String name, String value) {
		this.group = group;
		this.name = name;
		this.value = value;
	}
}
