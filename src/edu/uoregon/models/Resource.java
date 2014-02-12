package edu.uoregon.models;

import java.io.Serializable;
import java.util.Collection;
import java.util.Date;

import com.googlecode.objectify.*;
import com.googlecode.objectify.annotation.Cached;

import javax.persistence.Id;

/**
 * A class representing a document in SARA.
 */
@Cached
public class Resource implements Serializable{
	/**
	 * 
	 */
	private static final long serialVersionUID = 4072513035660164678L;
	@Id public Long id;
	public String title;
	public String type;
	public String description;
	public String url;
	public Date timeCreated;
	public String drm;
	public Content[] chapters;

  /**
   * Create a new document
   * @param title the title of the document.
   * @param contents the contents of the document.
   */
	public Resource(String title, String type, String description, String url) {
		this.type = type;
		this.description = description;
		this.title = title;
		this.timeCreated = new Date();
		this.url = url;
	}

	@SuppressWarnings("unused")
	private Resource() {}

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
	
	public Resource getChapters(){
		DAO dao = new DAO(); // access Objectify through this object which handles registration of our entity classes
    	Objectify ofy = dao.ofy();
    	
    	Key<Resource> resourceKey = new Key<Resource>(Resource.class, id);
    	
    	Collection<Content> contents = ofy.query(Content.class).filter("resource", resourceKey).order("order").list();
    	chapters = new Content[contents.size()];
    	
    	int i = 0;
    	for (Content chapter : contents){
    		chapters[i] = chapter.getSections();
    		i++;
    	}
    	
    	return this;
	}

	public Content getNextChapter(long contentID) {
		this.getChapters();
		
		for (int i = 0; i< chapters.length; i ++){
			
			if (chapters[i].id == contentID){
				if (i+1 < chapters.length)
					return chapters[i+1];
				else
					return null;
			}
		}
		return null;
	}
	
	/**
	 * Get a Document with given ID.
	 * @param id the ID for the requested document.
	 */
	public static Resource getResourceById(Long id) {
		DAO dao = new DAO();
		Objectify objectify = dao.ofy();
		return objectify.get(Resource.class, id);
	}

	/**
	 * Get all documents.
	 * @return an Iterable of all documents in the datastore
	 */
	public Iterable<Resource> getDocuments() {
		DAO dao = new DAO();
		Objectify objectify = dao.ofy();
		return objectify.query(Resource.class);
	}

	public static Key<Resource> getResourceKeyById(Long id) {
		return new Key<Resource>(Resource.class ,id);
	}

	
}
