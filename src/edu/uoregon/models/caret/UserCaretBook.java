package edu.uoregon.models.caret;

import javax.persistence.Id;

import com.googlecode.objectify.Key;
import com.googlecode.objectify.annotation.Cached;


import edu.uoregon.models.SaraUser;

// if there is no UserRole defined for a user then they don't have any extra privileges
@Cached
public class UserCaretBook {

	@Id public Long id; // id's of type Long are auto-generated
	public Key<CaretBook> book;
	public Key<SaraUser> user;
	
	// Objectify requires constructor with no parameters
	@SuppressWarnings("unused")
	private UserCaretBook() {}
	
	public UserCaretBook(Key<CaretBook> book, Key<SaraUser> user) {
		this.book= book;
		this.user = user;
	}
	
}
