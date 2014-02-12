package edu.uoregon.models.libraries;

import java.util.Date;
import javax.persistence.Id;

import com.googlecode.objectify.annotation.Cached;

@Cached
public class Schedule {
	@Id public Long id; // id's of type Long are auto-generated
	public Date endDate;
	public Date startDate;
		
	
	
	
	// Objectify requires constructor with no parameters
	@SuppressWarnings("unused")
	private Schedule() {}
	
	
	public Schedule(Date startDate, Date endDate) {
		this.startDate = startDate;
		this.endDate = endDate;
		
	}
	
}
