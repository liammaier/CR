package edu.uoregon.models;

import java.io.Serializable;
import java.util.Date;
import javax.persistence.Id;

import com.googlecode.objectify.Key;
import com.googlecode.objectify.annotation.Cached;

import edu.uoregon.models.reader.Section;

@Cached
public class SaraLog implements Serializable{

	/**
	 * 
	 */
	private static final long serialVersionUID = 1077907219720835082L;


	public enum Type {SCROLL, STRAT_CHANGE, NEW_USER_REGISTRATION, LOGIN, OPTIONS_CREATED, OPTIONS_DELETED, OPTIONS_UPDATED, USER_OPTION_UPDATED, ADD_REMINDER,
		HIGHLIGHT_CREATED, HIGHLIGHT_DELETED, HIGHLIGHT_UPDATED, NOTE_CREATED, NOTE_DELETED, NOTE_UPDATED, FONTSIZE, REVIEW_SECTION, CHANGE_SECTION, 
		SECTION_SUMMARY_REVIEW_FINISHED, SECTION_SUMMARY_REVIEW_STARTED, PS_SECTION_PREREVIEW, END_SESSION, CHANGE_PAGE, MAIN_MENU, USER_LIBRARY,
		CLICK_START_WHERE_LEFT_OFF, CLICK_START_NEW_SECTION, RESOURCE_PAGE, CLICK_READ_CONTENT, USER_OPTIONS_PAGE, USER_REMINDERS_PAGE, START_READING_SESSION,
		CHANGE_SESSION_TIME, START_READING, OPEN_NOTEBOOK, CLOSE_NOTEBOOK, CLICK_END_SESSION_BUTTON, ENDSESSION_BACKTOLIBRARY, ENDSESSION_LOGOUT, ENDSESSION_KEEPREADING,
		START_TTS, STOP_TTS, NOTEBOOK_HIGHLIGHTS_TAB, NOTEBOOK_LIST_TAB, NOTEBOOK_QUESTIONS_TAB, CHANGE_NOTEBOOK_SECTION, LATENCY_CHANGE, GOOGLE_LATENCY_CHANGE, WELCOME,
		DICTIONARY, REMINDER, PAGEGOAL, ENDSECTION, END_SESSION_FEELING} ;
		
	public enum Strategy {READ, PREVIEWSECTIONS, REVIEWSUMMARIES, MENUS, NEWSESSION, REVIEWMEDIA, PREVIEWFIGURES};
	
	@Id public Long id; // id's of type Long are auto-generated
	public Type logType;
	public String email;
	public Strategy logStrategy;
	public Key<Content> logContentKey;
	public Key<Section> logSectionKey;
	public String logData1;
	public String logData2;
	public Date timeCreated;
	
	// Objectify requires constructor with no parameters
	@SuppressWarnings("unused")
	private SaraLog() {}

	public SaraLog(String email, Type type, Strategy strategy, Key<Content> contentKey, Key<Section> sectionKey, String data1, String data2) {
		this(email, new Date().getTime(), type, strategy, contentKey, sectionKey, data1, data2);
	}
	
	public SaraLog(String email, long time, Type type, Strategy strategy, Key<Content> contentKey, Key<Section> sectionKey, String data1, String data2) {
		this.email = email;
		this.logType = type;
		this.logStrategy = strategy;
		this.logContentKey = contentKey;
		this.logSectionKey = sectionKey;
		this.logData1 = data1;
		this.logData2 = data2;
		this.timeCreated = new Date(time);
	}

	
	public static void log(String email, Long time, String type, String strategy, String section, String content, String data1, String data2){
		Type logType = null;
    	
    	if (type.equals("scroll")) {
    		logType = Type.SCROLL;
    	} else if (type.equals("changestrat")) {
    		logType = Type.STRAT_CHANGE;
    	} else if (type.equals("fontsize")){
    		logType = Type.FONTSIZE;
    	} else if (type.equals("reviewsection")){
    		logType = Type.REVIEW_SECTION;
    	} else if (type.equals("changesection")){
    		logType = Type.CHANGE_SECTION;
    	} else if (type.equals("sectionsummaryreviewfinished")){
    		logType = Type.SECTION_SUMMARY_REVIEW_FINISHED;
    	} else if (type.equals("sectionsummaryreviewstarted")){
    		logType = Type.SECTION_SUMMARY_REVIEW_STARTED;
    	} else if (type.equals("pssectionprereview")){
    		logType = Type.PS_SECTION_PREREVIEW;
    	} else if (type.equals("endsession")){
    		logType = Type.END_SESSION;
    	} else if (type.equals("changepage")){
    		logType = Type.CHANGE_PAGE;
    	}else if (type.equals("mainmenu")){
    		logType = Type.MAIN_MENU;
    	}else if (type.equals("userlibrary")){
    		logType = Type.USER_LIBRARY;
    	}else if (type.equals("clickstartwhereleftoff")){
    		logType = Type.CLICK_START_WHERE_LEFT_OFF;
    	}else if (type.equals("clicknewreading")){
    		logType = Type.CLICK_START_NEW_SECTION;
    	}else if (type.equals("resourcepage")){
    		logType = Type.RESOURCE_PAGE;
    	}else if (type.equals("readcontent")){
    		logType = Type.CLICK_READ_CONTENT;
    	}else if (type.equals("useroptionspage")){
    		logType = Type.USER_OPTIONS_PAGE;
    	}else if (type.equals("userreminderspage")){
    		logType = Type.USER_REMINDERS_PAGE;
    	}else if (type.equals("sessionstartpage")){
    		logType = Type.START_READING_SESSION;
    	}else if (type.equals("changesessiontime")){
    		logType = Type.CHANGE_SESSION_TIME;
    	} else if (type.equals("startreading")){
    		logType = Type.START_READING;
    	}else if (type.equals("opennotebook")){
    		logType = Type.OPEN_NOTEBOOK;
    	}else if (type.equals("closenotebook")){
    		logType = Type.CLOSE_NOTEBOOK;
    	}else if (type.equals("clickendsessionbtn")){
    		logType = Type.CLICK_END_SESSION_BUTTON;
    	}else if (type.equals("endsessionbacktolibrary")){
    		logType = Type.ENDSESSION_BACKTOLIBRARY;
    	}else if (type.equals("endsessionlogout")){
    		logType = Type.ENDSESSION_LOGOUT;
    	}else if (type.equals("endsessionkeepreading")){
    		logType = Type.ENDSESSION_KEEPREADING;
    	}else if (type.equals("starttts")){
    		logType = Type.START_TTS;
    	}else if (type.equals("stoptts")){
    		logType = Type.STOP_TTS;
    	}else if (type.equals("notebookhighlightstab")){
    		logType = Type.NOTEBOOK_HIGHLIGHTS_TAB;
    	}else if (type.equals("notebooklisttab")){
    		logType = Type.NOTEBOOK_LIST_TAB;
    	}else if (type.equals("notebookquestionstab")){
    		logType = Type.NOTEBOOK_QUESTIONS_TAB;
    	}else if (type.equals("changenotebooksection")){
    		logType = Type.CHANGE_NOTEBOOK_SECTION;
    	}else if (type.equals("latencychange")){
    		logType = Type.LATENCY_CHANGE;
    	}else if (type.equals("googlelatencychange")){
    		logType = Type.GOOGLE_LATENCY_CHANGE;
    	}else if (type.equals("welcome")){
    		logType = Type.WELCOME;
    	}else if (type.equals("dictionary")){
    		logType = Type.DICTIONARY;
    	}else if (type.equals("reminder")){
    		logType = Type.REMINDER;
    	}else if (type.equals("pagegoal")){
    		logType = Type.PAGEGOAL;
    	}else if (type.equals("endsection")){
    		logType = Type.ENDSECTION;
    	}else if (type.equals("endsessionfeeling")){
    		logType = Type.END_SESSION_FEELING;	
    	}else{
    		System.out.println("Not a valid log type");
    	}
    	
    	
    	Strategy logStrategy = null;
    	
    	if (strategy.equals("read")) {
    		logStrategy = Strategy.READ;
    	} else if (strategy.equals("review-summaries")) {
    		logStrategy = Strategy.REVIEWSUMMARIES;
    	} else if (strategy.equals("review-media")) {
    		logStrategy = Strategy.REVIEWMEDIA;
    	} else if (strategy.equals("preview-figures")) {
    		logStrategy = Strategy.PREVIEWFIGURES;
    	} else if (strategy.equals("preview-sections")) {
    		logStrategy = Strategy.PREVIEWSECTIONS;
    	} else if (strategy.equals("menus")){
    		logStrategy = Strategy.MENUS;
    	} else if (strategy.equals("newsession")){
    		logStrategy = Strategy.NEWSESSION;
    	} else{
    		System.out.println("Not a valid strategy type");
    	}
    	
    	Key<Section> sectionKey = null;
    	if (section != null && !section.equals("") && !section.equals("null"))
    		sectionKey = new Key<Section>(Section.class, Long.parseLong(section));
    	
    	Key<Content> contentKey = null;
    	if (content != null && !content.equals("") && !content.equals("null"))
    		contentKey = new Key<Content>(Content.class, Long.parseLong(content));
    	
    	if (logType == null || logStrategy == null){
    		return;
    	}
			
		//public SaraLog(String email,Type type, Strategy strategy, Key<Content> contentKey, int sectionNum, String data1, String data2) {
    	SaraLog log = new SaraLog(email, time, logType, logStrategy, contentKey, sectionKey, data1, data2);
    	new DAO().ofy().put(log);
	}
	
	
}
