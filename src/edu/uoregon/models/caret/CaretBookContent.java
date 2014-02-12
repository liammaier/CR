package edu.uoregon.models.caret;

import javax.persistence.Id;

import com.googlecode.objectify.Key;
import com.googlecode.objectify.annotation.Cached;

// if there is no UserRole defined for a user then they don't have any extra privileges
@Cached
public class CaretBookContent {

	@Id public Long id; // id's of type Long are auto-generated
	public Key<CaretContent> content;
	public Key<CaretBook> book;

	
	// Objectify requires constructor with no parameters
	@SuppressWarnings("unused")
	private CaretBookContent() {}
	
	public CaretBookContent(Key<CaretBook> book, Key<CaretContent> content) {
		this.content = content;
		this.book = book;

	}
	
}
