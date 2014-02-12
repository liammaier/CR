package edu.uoregon.models.groups;

import java.util.ArrayList;

import javax.persistence.Id;

import com.googlecode.objectify.Key;
import com.googlecode.objectify.annotation.Cached;
import com.googlecode.objectify.annotation.Parent;

import edu.uoregon.models.SaraUser;

@Cached
public class GroupBanList {
	
	@Id public Long id;
	@Parent public Key<Group> group;
	private ArrayList<Key<SaraUser>> bannedUsers;
	
	// Objectify requires constructor with no parameters
	@SuppressWarnings("unused")
	private GroupBanList() {}
	
	// Initiates a group ban list
	public GroupBanList(Key<Group> group){
		this.group = group;
		bannedUsers = new ArrayList<Key<SaraUser>>();
	}
	
	// Initiates a group ban list with one user to start with
	public GroupBanList(Key<Group> group, Key<SaraUser> user){
		this.group = group;
		bannedUsers = new ArrayList<Key<SaraUser>>();
		bannedUsers.add(user);
	}
	
	public void add(Key<SaraUser> user){
		if(!bannedUsers.contains(user)){
			bannedUsers.add(user);
		}
	}
	
	public boolean contains(Key<SaraUser> user){
		return bannedUsers.contains(user);
	}
	
}
