package edu.uoregon.models.caret;

import java.io.Serializable;
import java.util.Date;

import com.googlecode.objectify.annotation.Cached;

import javax.persistence.Id;

/**
 * A class representing a document in SARA.
 */
@Cached
public class CaretBook implements Serializable {
	/**
	 * 
	 */
	private static final long serialVersionUID = -4094047696528162362L;
	@Id public Long id;
	public String title;
	public String description;
	public Date timeCreated;
	public Boolean current;
	//json of the tagTypes for now
	public String tagTypes;

  /**
   * Create a new document
   * @param title the title of the document.
   */
	
	// article
	// All
	public CaretBook(String title,String description) {
		this.title = title;
		this.description = description;
		this.timeCreated = new Date();
		this.current = false;
	}

	@SuppressWarnings("unused")
	private CaretBook() {}

	public Long getId() {return id;}
	public String getTitle() {return title;}
	

	
}
