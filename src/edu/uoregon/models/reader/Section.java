package edu.uoregon.models.reader;

import java.util.Collection;

import javax.persistence.Id;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.annotation.Cached;

import edu.uoregon.models.DAO;
import edu.uoregon.models.Content;

@Cached
public class Section {
	
	/*
	 *  This class identifies a section of a document, and its children are GroupStatRecords for each group
	 *  that has a member that has read this section / document.
	 *  
	 */
	
	@Id public Long id;
	public String name;
	public int sectionNum; // n sections in a document, ranging from 0 to n-1
	public Key<Content> content;
	public Boolean subsection;
	
	// For Objectify
	@SuppressWarnings("unused")
	private Section() {}
	
	public Section(Key<Content> doc, int sectionNum, String name){
		this.sectionNum = sectionNum;
		this.name = name;
		this.content = doc;
		this.subsection = false;
	}
	
	public Section(Key<Content> doc, int sectionNum, String name, Boolean subsection){
		this.sectionNum = sectionNum;
		this.name = name;
		this.content = doc;
		this.subsection = subsection;
	}
	
	public static Collection<Section> getAllSections(Key<Content> content){
		DAO dao = new DAO();
		return dao.ofy().query(Section.class).filter("content",content).list();
	}

	public static Section getSectionByNumber(Key<Content> content,int number){
		DAO dao = new DAO();
		return dao.ofy().query(Section.class).filter("content",content).filter("sectionNum",number).get();
	}
	
	// Getters
	public Key<Content> getContent(){
		return content;
	}
	public String getName(){
		return name;
	}
	public int getSectionNum(){
		return sectionNum;
	}

	public static Key<Section> getSectionKeyByNumber(Key<Content> content,int number){
			DAO dao = new DAO();
			return dao.ofy().query(Section.class).filter("content",content).filter("sectionNum",number).getKey();
	}

	public static Section getSectionById(Long secId) {
		return new DAO().ofy().get(new Key<Section>(Section.class,secId));
	}

}
