package edu.uoregon.models.libraries;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import javax.persistence.Id;

import com.googlecode.objectify.Key;
import com.googlecode.objectify.annotation.Cached;

import edu.uoregon.models.DAO;
import edu.uoregon.models.Resource;
import edu.uoregon.models.SaraUser;

@Cached
public class Library {
	@Id public Long id; // id's of type Long are auto-generated
		
	public Date timeCreated;
	public String name;
	public String type;
	public String description;
	public boolean followable;
	public ArrayList<Key<Resource>> resources;
	
	// Objectify requires constructor with no parameters
	@SuppressWarnings("unused")
	private Library() {}
	
	public Library(String name, String description, String type) {

		this.timeCreated = new Date();
		this.name = name;
		this.description = description;
		this.type = type;
		this.resources = new ArrayList<Key<Resource>>();
	}
	
	public static Collection<Key<Library>> getAllLibraryKeys(){
		DAO dao = new DAO();
		
		return dao.ofy().query(Library.class).listKeys();
	}
	
	public static Collection<Library> getAllLibraries(){
		DAO dao = new DAO();
		
		return dao.ofy().query(Library.class).list();
	}

	public String getLeaderEmail(){
		DAO dao = new DAO();
		UserLibraryRole userRole = dao.ofy().query(UserLibraryRole.class).ancestor(this).filter("role", "leader").get();
		if(userRole != null){
			Key<SaraUser> userK = userRole.user;
		
			return dao.ofy().get(userK).email.getEmail();
		}else{
			System.out.println("could not find group leader for " + name);
			return "";
		}
		
	}
	public Collection<Assignment> getAssignments(){
		DAO dao = new DAO();
		return dao.ofy().query(Assignment.class).ancestor(this).list();
	}
	
	public void addResource(Key<Resource> rkey){
		if(resources == null){
			resources = new ArrayList<Key<Resource>>();
		}
		resources.add(rkey);
	}
	public void removeResource(Key<Resource> rkey){
		if (resources != null)
			resources.remove(rkey);
	}

	public Key<Library> getKey() {
		return new Key<Library>(Library.class ,this.id);
	}
	
}
