package edu.uoregon.models;

import javax.persistence.Id;

import com.googlecode.objectify.Key;
import com.googlecode.objectify.annotation.Cached;
import com.googlecode.objectify.annotation.Parent;

import edu.uoregon.models.reader.Section;

@Cached
public class UserSectionStat {

	/*
	 * A UserSectionStat contains one user's data within a document section that does NOT pertain to a
	 * specific group, i.e. hours read. It is used by GroupStatRecord to calculate the group averages
	 * and top values.
	 * 
	 */
	
	@Id public Long id;
	@Parent private Key<Section> docSection;
	private Key<Content> document;
	private Key<SaraUser> user;
	
	// Data specific to each user in a section
	private double hoursRead;
	
	
	// For objectify
	@SuppressWarnings("unused")
	private UserSectionStat() {}
	
	public UserSectionStat(Key<Content> document, Key<Section> docSec, Key<SaraUser> user){
		this.document = document;
		this.docSection = docSec;
		this.user = user;
		
		// Data-specific
		hoursRead = 0;
	}
	
	
	// Getters
	public Key<Content> getDocument(){
		return document;
	}
	public Key<Section> getDocSection(){
		return docSection;
	}
	public Key<SaraUser> getUser(){
		return user;
	}
	public double getHoursRead(){
		return hoursRead;
	}
	
	// Setters
	public void addHoursRead(double h){
		hoursRead += h;
	}
	public void setHoursRead(double h){
		hoursRead = h;
	}
}
