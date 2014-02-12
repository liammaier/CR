package edu.uoregon.models;

import javax.persistence.Id;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.annotation.Cached;

@Cached
public class Reminder {
	@Id public Long id; // id's of type Long are auto-generated
			
	public Key<SaraUser> user; 
	public String name;
	public String reminderid;
	public String type;
	public String message;
	public boolean hearIt;
	public String frequencyType;
	public int frequency;
	public int time;
	
	// Objectify requires constructor with no parameters
	@SuppressWarnings("unused")
	private Reminder() {}
	
	public Reminder(Key<SaraUser> user, String name, String type, String reminderid, String message, boolean hearIt, String frequencyType, int frequency, int time) {

		this.user = user;
		this.name = name;
		this.reminderid = reminderid;
		this.type = type;
		this.message = message;
		this.hearIt = hearIt;
		this.frequencyType = frequencyType;
		this.frequency = frequency;
		this.time = time;
	}
	
	
	
}
