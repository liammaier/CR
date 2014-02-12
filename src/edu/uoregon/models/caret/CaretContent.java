package edu.uoregon.models.caret;

import java.io.Serializable;
import java.util.Date;

import com.googlecode.objectify.annotation.Cached;

import javax.persistence.Id;

/**
 * A class representing a document in SARA.
 */
@Cached
public class CaretContent implements Serializable {
	/**
	 * 
	 */
	private static final long serialVersionUID = -4094047696528162362L;
	@Id public Long id;
	public String title;
	public String type; // chapter, article, import
	public String description;
	public String contents;
	public Date timeCreated;
	public Object bookId;
	public String json;
	
  /**
   * Create a new document
   * @param title the title of the document.
   */
	
	// article
	// All
	public CaretContent(String contents,String json,String title, String type, String description) {
		this.json = json;
		this.contents = contents;
		this.title = title;
		this.type = type;
		this.description = description;
		this.timeCreated = new Date();
	}

	@SuppressWarnings("unused")
	private CaretContent() {}

	public Long getId() {return id;}
	public String getTitle() {return title;}
	

	
}
