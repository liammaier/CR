package edu.uoregon.models;

import javax.persistence.Id;

import com.googlecode.objectify.Key;
import com.googlecode.objectify.annotation.Cached;
import com.googlecode.objectify.annotation.Parent;

import edu.uoregon.models.groups.Group;
import edu.uoregon.models.groups.GroupStatRecord;
import edu.uoregon.models.reader.Section;

@Cached
public class UserSectionGroupStat {
	
	/*
	 * A UserSectionGroupStat contains one user's data within a document section that pertains to a specific
	 * group. It is used by GroupStatRecord to calculate the group averages and top values.
	 * 
	 */
	
	@Id public Long id;
	@Parent private Key<GroupStatRecord> groupStatRecord;
	private Key<Content> document;
	private Key<Section> docSection;
	private Key<Group> group;
	private Key<SaraUser> user;
	
	// Data specific to each user in a section
	private int notesTaken;
	private double topCommentRating; // The rating of the user's top-most rated comment in this section
	
	
	// For objectify
	@SuppressWarnings("unused")
	private UserSectionGroupStat() {}
	
	public UserSectionGroupStat(Key<GroupStatRecord> groupStatRecord, Key<Content> document, Key<Section> docSec, Key<Group> group, Key<SaraUser> user){
		this.groupStatRecord = groupStatRecord;
		this.document = document;
		this.docSection = docSec;
		this.group = group;
		this.user = user;
		
		// Data-specific
		notesTaken = 0;
		topCommentRating = 0;
	}
	
	
	// Getters
	public Key<GroupStatRecord> getGroupStatRecord(){
		return groupStatRecord;
	}
	public Key<Content> getDocument(){
		return document;
	}
	public Key<Section> getDocSection(){
		return docSection;
	}
	public Key<Group> getGroup(){
		return group;
	}
	public Key<SaraUser> getUser(){
		return user;
	}

	public int getNotesTaken() {
		return notesTaken;
	}

	public void setNotesTaken(int notesTaken) {
		this.notesTaken = notesTaken;
	}

	public double getTopCommentRating() {
		return topCommentRating;
	}

	public void setTopCommentRating(double topCommentRating) {
		this.topCommentRating = topCommentRating;
	}
	
	
	
}
