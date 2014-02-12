package edu.uoregon.models.groups;

import javax.persistence.Id;

import com.googlecode.objectify.Key;
import com.googlecode.objectify.annotation.Cached;
import com.googlecode.objectify.annotation.Parent;

import edu.uoregon.models.Content;
import edu.uoregon.models.reader.Section;

@Cached
public class GroupStatRecord {
	
	/*
	 * A GroupStatRecord has a child of UserSectionStat for each user in the group that has read this
	 * document. The GroupStatRecord itself contains all of this information with respect to a certain
	 * section in a document.
	 * 
	 */
	
	@Id public Long id;
	@Parent private Key<Section> docSection;
	private Key<Content> document;
	private Key<Group> group;
	
	// Data-specific
	private double topCommentRating;
	private int topNotesTaken;
	
	// For objectify
	@SuppressWarnings("unused")
	private GroupStatRecord() {}
	
	public GroupStatRecord(Key<Content> document, Key<Section> docSec, Key<Group> group){
		this.document = document;
		this.docSection = docSec;
		this.group = group;
		
		// Data-specific
		this.topCommentRating = 0;
		this.topNotesTaken = 0;
	} 
	
	
	// Getters
	public Key<Section> getDocSection(){
		return docSection;
	}
	public Key<Content> getDocument(){
		return document;
	}
	public Key<Group> getGroup(){
		return group;
	}

	public double getTopCommentRating() {
		return topCommentRating;
	}

	public void setTopCommentRating(double topCommentRating) {
		this.topCommentRating = topCommentRating;
	}

	public int getTopNotesTaken() {
		return topNotesTaken;
	}

	public void setTopNotesTaken(int topNotesTaken) {
		this.topNotesTaken = topNotesTaken;
	}
	
	
	
}
