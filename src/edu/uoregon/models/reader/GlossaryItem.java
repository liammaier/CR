package edu.uoregon.models.reader;

import java.util.Date;

import javax.persistence.Id;

import com.googlecode.objectify.Key;
import com.googlecode.objectify.annotation.Cached;

import edu.uoregon.models.Content;

@Cached
public class GlossaryItem {
	
	@Id	public Long id;
	private Key<Content> content;
	private String name;
	private String description;
	private int order;
	private Date timeCreated;
	
	// for Objectify
	@SuppressWarnings("unused")
	private GlossaryItem() {}
	
	public GlossaryItem(Key<Content> content, String name, String description, int order){
		this.content = content;
		this.name = name;
		this.description = description;
		this.order = order;
		this.setTimeCreated(new Date());
	}
	
	
	// Getters
	public Key<Content> getContent() {
		return content;
	}
	
	public String getName() {
		return name;
	}
	
	public String getDescription() {
		return description;
	}
	
	public int getOrder() {
		return order;
	}

	public Date getTimeCreated() {
		return timeCreated;
	}

	public void setTimeCreated(Date timeCreated) {
		this.timeCreated = timeCreated;
	}
	
}
