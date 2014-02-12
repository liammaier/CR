package edu.uoregon.models.libraries;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;

import javax.persistence.Id;

import com.googlecode.objectify.Key;
import com.googlecode.objectify.annotation.Cached;
import com.googlecode.objectify.annotation.Parent;


import edu.uoregon.models.Content;

@Cached
public class Assignment {
	@Id public Long id; // id's of type Long are auto-generated
	@Parent public Key<Library> lib;	
	public Date timeCreated;
	public String name;
	public String description;
	public Date dueDate;
	public Content resource;
	
	
	// Objectify requires constructor with no parameters
	@SuppressWarnings("unused")
	private Assignment() {}
	
	
	public Assignment(String name, String description, Date dueDate, Content resource) {
		this.timeCreated = new Date();
		this.name = name;
		this.description = description;
		this.dueDate = dueDate;
		this.resource = resource;
	}
	public Assignment(String name, String description, Date dueDate,Key<Library> lib) {
		this.lib = lib;
		this.timeCreated = new Date();
		this.name = name;
		this.description = description;
		this.dueDate = dueDate;

	}


	public static Collection<Assignment> getAllAssignments() {
		Collection<Library> libraries = Library.getAllLibraries();
		Collection<Assignment> allAssignments = new ArrayList<Assignment>();
		
		for(Library library : libraries){	
			Collection<Assignment> assignments = library.getAssignments();
			if(assignments != null){
				allAssignments.addAll(assignments);
			}
		}
		return allAssignments;
	}
	
	public boolean islate(){
		return new Date().compareTo(dueDate) > 0 ? true : false;
	}
	
}
