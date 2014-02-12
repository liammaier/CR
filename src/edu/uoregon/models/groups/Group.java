package edu.uoregon.models.groups;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Map;

import javax.persistence.Id;

import com.googlecode.objectify.Key;
import com.googlecode.objectify.annotation.Cached;
import com.googlecode.objectify.annotation.Parent;

import edu.uoregon.models.DAO;
import edu.uoregon.models.SaraUser;
import edu.uoregon.models.libraries.Library;

@Cached
public class Group {
	@Parent public Key<Library> lib;
	@Id public Long id; // id's of type Long are auto-generated
	public Date timeCreated;
	public String name;
	public String type;
	public String description;
	public boolean followable;
	
	// Objectify requires constructor with no parameters
	@SuppressWarnings("unused")
	private Group() {}
	
	
	public Group(Library lib ,String name, String description, String type, boolean followable) {
		this.lib = new Key<Library>(Library.class,lib.id);
		this.timeCreated = new Date();
		this.name = name;
		this.description = description;
		this.type = type;
		this.followable = followable;
	}
	
	
	/**
	 * get the leader of the group's email
	 * @return the leader's user email
	 */
	
	public String getLeaderEmail(){
		DAO dao = new DAO();
		return dao.ofy().get(dao.ofy().query(UserGroupRole.class).ancestor(this).filter("role", "leader").get().user).email.getEmail();
	}
	
	public String getUserRole(SaraUser user){
		DAO dao = new DAO();
		return dao.ofy().get(dao.ofy().query(UserGroupRole.class).ancestor(this).filter("role", "leader").get().user).email.getEmail();
	}
	
	/**
	 * Get the key to the user's private group.
	 * @return the user's group of type private
	 */
	public static Key<Group> getPrivateGroupKey(SaraUser user){
		DAO dao = new DAO();
		return dao.ofy().query(UserGroupRole.class).filter("user",new Key<SaraUser>(SaraUser.class,user.id)).filter("role", "my").get().group;
		
	}
	
	/**
	 * Get all study groups. This includes everything except for class groups and private groups.
	 * @return a collection of groups the user is in
	 */
	public static Collection<Key<Group>> getMyGroupKeys(SaraUser user){
		Collection<Group> groups = getGroups(user);
		Collection<Key<Group>> userGroups = new ArrayList<Key<Group>>();
		for(Group group : groups){
			String type = group.type;
			if(!type.equals("Class") && !type.equals("Private")) userGroups.add(new Key<Group>(Group.class,group.id));
		}
		return userGroups;
	}
	
	public static Collection<Group> getMyGroups(SaraUser user){
		Collection<Group> groups = getGroups(user);
		ArrayList<Group> userGroups = new ArrayList<Group>();
		for(Group group : groups){
			String type = group.type;
			if(!type.equals("Class") && !type.equals("Private")) userGroups.add(group);
		}
		return userGroups;
	}
	
	/**
	 * Get the keys to all groups the user is a member of. This includes class groups and private groups.
	 * @return a Collection of Group keys
	 */
	public static Collection<Key<Group>> getGroupKeys(SaraUser user){
		DAO dao = new DAO();
		List<UserGroupRole> roles = dao.ofy().query(UserGroupRole.class).filter("user", new Key<SaraUser>(SaraUser.class, user.id)).list();
		if (roles != null && (roles.size() != 0)) {
			List<Key<Group>> groupKeys = new ArrayList<Key<Group>>();
			for (UserGroupRole rol : roles) {
				if (!groupKeys.contains(rol.group)) {
					groupKeys.add(rol.group);
				}
			}
			
			return groupKeys;
		}else{
			return new ArrayList<Key<Group>>();
		}
	}
	public static Collection<Key<Group>> getAllGroupKeys(){
		DAO dao = new DAO();
		
		return dao.ofy().query(Group.class).filter("type !=", "Private").filter("type !=", "Class").listKeys();
	}
	
	public static Collection<Group> getAllGroup(){
		DAO dao = new DAO();
		
		return dao.ofy().query(Group.class).filter("type !=", "Private").filter("type !=", "Class").list();
	}
	
	
	/**
	 * Get all groups the given user is not a member of that are available to follow
	 * @return a Collection of Groups
	 */
	public static Collection<Key<Group>> getOtherGroupKeys(SaraUser user){
		
		Collection<Key<Group>> allgroups = getAllGroupKeys();
		
		Collection<Key<Group>> ingroups = getGroupKeysByRole("member",user);
		System.out.println(ingroups.size());
		ingroups.addAll(getGroupKeysByRole("leader",user));
		System.out.println(ingroups.size());
		ingroups.addAll(getGroupKeysByRole("follower",user));
		Collection<Key<Group>> outgroups = new ArrayList<Key<Group>>();
		
		
		// Get the groups we're not in (again, not including private and class groups)
		for (Key<Group> each : allgroups) {
			
			//if we are looking at a non-private and non-class group see if we are in that group, if not add to group we can follow
			if(!ingroups.contains(each)){
				outgroups.add(each);
				
			}
		}
		return outgroups;
	}
	
	/**
	 * Get all groups that the user is a member of. This includes class groups and private groups.
	 * @return a Collection of groups the user belongs to
	 */
	public static Collection<Group> getGroups(SaraUser user){
		Collection<Key<Group>> groupKeys = getGroupKeys(user);
		if(groupKeys == null){
			return null;
		}else{
			DAO dao = new DAO();
			Map<Key<Group>, Group> groupMap = dao.ofy().get(groupKeys);
			return groupMap.values();
		}
	}
	

	/**
	 * Get all group keys by role (not class or private)
	 */
	public static ArrayList<Key<Group>> getGroupKeysByRole(String role,SaraUser user){
		DAO dao = new DAO();
		
		List<UserGroupRole> userroles = dao.ofy().query(UserGroupRole.class).filter("user", new Key<SaraUser>(SaraUser.class, user.id)).filter("role", role).list();
		
		
		ArrayList<Key<Group>> groupkeys = new ArrayList<Key<Group>>();
		for(UserGroupRole rol : userroles){
			String roltype = dao.ofy().get(rol.group).type;
			if(!roltype.equals("Class") && !roltype.equals("Private") && !groupkeys.contains(rol.group) ){
				groupkeys.add(rol.group);
			}
		}
		
		return groupkeys;
	}
	
	/**
	 * Get all groups by role (not class or private)
	 */
	public static ArrayList<Group> getGroupsByRole(String role, SaraUser user){
		DAO dao = new DAO();
		ArrayList<Key<Group>> keys = getGroupKeysByRole(role, user);
		ArrayList<Group> groups = new ArrayList<Group>();
		for(Key<Group> key : keys){
			groups.add(dao.ofy().get(key));
		}
		
		return groups;
	}


//get the class, only one for now so just get it
	public Key<Library> getClassKey(){
		return lib;
	}
}
