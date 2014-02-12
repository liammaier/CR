package edu.uoregon.models;

import javax.persistence.Id;

import com.googlecode.objectify.Key;
import com.googlecode.objectify.annotation.Cached;

// if there is no UserRole defined for a user then they don't have any extra privileges
@Cached
public class ContentImage {

	@Id public Long id; // id's of type Long are auto-generated
	public Key<Content> content;
	public Key<Image> image;
	
	// Objectify requires constructor with no parameters
	@SuppressWarnings("unused")
	private ContentImage() {}
	
	public ContentImage(Key<Content> content, Key<Image> image) {
		this.image = image;
		this.content = content;
	}
	
}
