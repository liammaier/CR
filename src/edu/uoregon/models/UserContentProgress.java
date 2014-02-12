package edu.uoregon.models;

import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.TimeZone;
import java.util.TreeSet;

import javax.persistence.Id;

import com.googlecode.objectify.Key;
import com.googlecode.objectify.Objectify;
import com.googlecode.objectify.annotation.Cached;

@Cached
public class UserContentProgress {

	/*
	 * A UserContentProgress stores stastistics for one user within a chapter or article
	 */
	
	@Id public Long id;
	public Key<Content> content;
	Key<SaraUser> user;
	
	// Data specific to each user in a content
	public double minutesRead;
	
	TreeSet<String> pagesRead = new TreeSet<String>();; 
	TreeSet<Integer> sectionsRead = new TreeSet<Integer>(); ;
	
	public String strategy; 
	
	public int notesTaken;
	public int highlightsMade; 
	
	public Date lastUpdated;
	
	// For objectify
	@SuppressWarnings("unused")
	private UserContentProgress() {}
	
	public UserContentProgress(Long time, Key<Content> content, Key<SaraUser> user){
		this.content = content;
		this.user = user;
		
		Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("PST"));
		lastUpdated= calendar.getTime();
		
		// Data-specific
		minutesRead = 0;
		notesTaken = 0;
		highlightsMade = 0;
		
		addPage("0");
	}
	
	public Date getLastUpdated() {
		return lastUpdated;
	}
	
	// only update the time if it is newer. This is for batch updates
	public void updateTime(long newTime){
		if (newTime > lastUpdated.getTime()){
			lastUpdated = new Date(newTime);
		}
	}
	
	public void addPage (String page){
		pagesRead.add(page);
	}
	public void addSection (String section){
		if (section != null)
			sectionsRead.add(Integer.parseInt(section));
	}
	public void addPages (String[] pages){
		if (pages != null)
			pagesRead.addAll(Arrays.asList(pages));
	}
	public void addSections (String[] sections){
		if (sections != null) {
			for (String section : sections){
				sectionsRead.add(Integer.parseInt(section));
			}
		}
	}
	public void setStrategy (String strategy) {
		this.strategy = strategy;
	}
	
	public Integer getMostRecentSection (){
		if (!sectionsRead.isEmpty())
			return sectionsRead.floor(100);
		return 0;
	}
	public String getStrategy (){
		return strategy;
	}
	
/*here*/
	// try to get the size of sectionsRead
	public Integer getNumSectionsRead() {
		if (sectionsRead != null) {
			return sectionsRead.size();
		}
		return 0;
	}
	
/*here*/
	// get the set of sections
	public TreeSet<Integer> getSections(){
		return sectionsRead;
	}
	
	public void incrementNotes (long time){
		notesTaken ++;
		updateTime(time);
	}
	public void incrementHighlights (long time){
		highlightsMade ++;
		updateTime(time);
	}
	public void addMinute(long time){
		minutesRead ++;
		updateTime(time);
	}
	public void addMinutes (int minutes) {
		minutesRead += minutes;
	}
	
	public static void incrementNotes(Key<Content> content, Key<SaraUser> user, long time) {
		
		DAO dao = new DAO(); // access Objectify through this object which handles registration of our entity classes
    	Objectify ofy = dao.ofy();  
    	
    	UserContentProgress userCP = ofy.query(UserContentProgress.class).filter("content", content).filter("user", user).get();
		
    	if (userCP == null) {
    		userCP = new UserContentProgress(time, content, user);
    	}
    	
    	userCP.incrementNotes(time);
		ofy.put(userCP);
    	
	}
	
	public static void incrementHighlights(Key<Content> content, Key<SaraUser> user, long time) {	
		DAO dao = new DAO(); // access Objectify through this object which handles registration of our entity classes
    	Objectify ofy = dao.ofy();  	
    	UserContentProgress userCP = ofy.query(UserContentProgress.class).filter("content", content).filter("user", user).get();	
    	if (userCP == null) {
    		userCP = new UserContentProgress(time, content, user);
    	}
    	userCP.incrementHighlights(time);
		ofy.put(userCP);
	}
	
	
}
