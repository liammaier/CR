package edu.uoregon.models;

import java.io.Serializable;
import java.util.Collection;
import java.util.Date;

import com.googlecode.objectify.*;
import com.googlecode.objectify.annotation.Cached;

import edu.uoregon.models.reader.Section;

import javax.persistence.Id;

/**
 * A class representing a document in SARA.
 */
@Cached
public class Content implements Serializable {
	/**
	 * 
	 */
	private static final long serialVersionUID = -4094047696528162362L;
	@Id public Long id;
	public Key<Resource> resource;
	public String title;
	public String type; // chapter, article, import
	public String description;
	public String url;
	public Date timeCreated;
	public int order;
	public int numPages; 
	public int numSections;
	
	public String cssURL;
	public String importedHTML;
	public String importedURL;
	
	public Section[] sections;
	public String resourceTitle;
	

  /**
   * Create a new document
   * @param title the title of the document.
   */
	
	// article
	public Content(String title, String type, String description, String url, int numpages, int numsections, Key<Resource> resource, String cssURL) {
		this(title, type, description, url, numpages, numsections, resource, cssURL, 0);
	}
	
	// main
	public Content(String title, String type, String description, String url, int numpages, int numsections, Key<Resource> resource, String cssURL, int order) {
		this(title, type, description, url, numpages, numsections, resource, cssURL, order, null, null);
	}
	
	// All
	public Content(String title, String type, String description, String url, int numpages, int numsections, Key<Resource> resource, String cssURL, int order, String importedHTML, String importedURL) {
		this.resource = resource;
		this.title = title;
		this.type = type;
		this.description = description;
		this.url = url;
		this.timeCreated = new Date();
		this.order = order;
		this.numPages = numpages;
		this.numSections = numsections;
		this.importedHTML = importedHTML;
		this.cssURL = cssURL;
		this.importedURL = importedURL;
	}

	@SuppressWarnings("unused")
	private Content() {}

	public Long getId() {return id;}
	public String getTitle() {return title;}
	public String getUrl() {return url;}
	  
	
	  
	public String toString() {
		return "Document Id #"+this.getId().toString()+ " Title='"+this.title+" Url='"+this.url;
	}
	  
	  
	  
	public void addDocument() {
		DAO dao = new DAO();
		Objectify objectify = dao.ofy();
		objectify.put(this);
	}
  
	public Content getSections(){
		DAO dao = new DAO(); // access Objectify through this object which handles registration of our entity classes
    	Objectify ofy = dao.ofy();
    	
    	Key<Content> contentKey = new Key<Content>(Content.class, id);
    	
    	Collection<Section> sectionsCollection = ofy.query(Section.class).filter("content", contentKey).list();
    	sections = sectionsCollection.toArray(new Section[1]);
    			
    	return this;
	}
	
	/**
	 * Get a Document with given ID.
	 * @param id the ID for the requested document.
	 */
	public static Content getResourceById(Long id) {
		DAO dao = new DAO();
		Objectify objectify = dao.ofy();
		return objectify.get(Content.class, id);
	}

	/**
	 * Get all documents.
	 * @return an Iterable of all documents in the datastore
	 */
	public Iterable<Content> getDocuments() {
		DAO dao = new DAO();
		Objectify objectify = dao.ofy();
		return objectify.query(Content.class);
	}

	public static Key<Content> getResourceKeyById(Long id) {
		return new Key<Content>(Content.class ,id);
	}

	
}
