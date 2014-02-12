package edu.uoregon.servlets;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.googlecode.objectify.Objectify;
import com.googlecode.objectify.Query;

import edu.uoregon.models.DAO;
import edu.uoregon.models.SaraLog;
import edu.uoregon.models.SaraLog.Type;
import edu.uoregon.models.SaraUser;

public class GetParsedLogsServlet extends HttpServlet {
	
	private static final long serialVersionUID = 1L;
	
	//private static final Logger logger = Logger.getLogger(GetParsedLogsServlet.class.getName());
	
	@SuppressWarnings("unused")
	public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		response.setHeader("Access-Control-Allow-Origin", "*");
		
		// gives us the current user or NULL if they are not allowed in the site
		SaraUser currentUser = SaraServlet.login(request,response);
		if(currentUser != null){
	    	
	    	DAO dao = new DAO(); // access Objectify through this object which handles registration of our entity classes
	    	Objectify ofy = dao.ofy();  	      	
    		
    		ArrayList<ParsedData> results = new ArrayList<ParsedData>();
    		
    		// FOR EACH USER
    		Query<SaraUser> userList = ofy.query(SaraUser.class);
    		for (SaraUser user: userList){
    			
    			String email = user.getEmail();
    			
    			ParsedData userData = new ParsedData(email);

    			if (!email.startsWith("crpilot")){
    				continue;
    			}
    			
    			// GOING CHRONOLOGICALLY THROUGH THE LOG DATA 
    			// we're doing it this way because the log data is shitty
    			// and doesn't have everything we would need to easily do it another way. 
    			// after we redo the log data, i think this could be done better by section
    			
    			// get log data for this user!
    			Query<SaraLog> logList = ofy.query(SaraLog.class).filter("email", email).order("timeCreated");
    			
    			
    			// TODO: Change all of this
    			
    			// if it's not empty
    			if (logList.list().size() != 0) {
    				
	    			int section = -1;
	    			Type type;
	    			String content;
	    			Date time = null;
	    			
	    			Date startSection = null;
	    			Date startStrategy = logList.list().get(0).timeCreated;
	    			String currentStrategy = "preview-sections";
	    			boolean[] reviewProgress = new boolean[13];
	    			boolean[] previewProgress = new boolean[13];
	    			
	    			for (SaraLog log: logList){
	    				
	    				// CHECK FOR END OF SESSION (user left and came back)
	    				if (time != null && log.timeCreated.getTime() - time.getTime() > 120000) { // 2 mins
	    					
	    					// close out other times. 
	    					if (currentStrategy.equals("preview-sections")){
	    						userData.timeOnPreview += (double)(time.getTime() - startStrategy.getTime())/60000;
	    					} else if (currentStrategy.equals("review-summaries")){
	    						userData.timeOnReview += (double)(time.getTime() - startStrategy.getTime())/60000;
	    					} 
	    					
	    					if (startSection != null) {
		    						userData.sectionTime[section] += (double)(time.getTime() - startSection.getTime())/60000;	
	    					}
	    					
	    					// TODO: i think this is the problem. we don't know what we're coming back to so we're resetting both times... 
	    					startSection = log.timeCreated;
	    					startStrategy = log.timeCreated;
	    					
	    					if (log.timeCreated.getTime() - time.getTime() > 31800000) { // 30 mins
	    						currentStrategy = "preview-sections";
	    						section = 0;
	    						startSection = null;
	    					}
	    					userData.numReadingSessions ++;
	    				}
	    				
	    				type = log.logType;
	    				content = log.logData1;
	    				time = log.timeCreated;
	    				
	    				// Skip it if it's just a duplicate of the previous scroll to
	    				if (type.equals("Scrolled To") && getSectionNum(content) == section) {
	    					continue;
	    				} 
	    				
	    				response.getWriter().println(log);
	    				
		    			// STRATEGY CHANGE
	    				if (type.equals("click strategy") || type.equals("Clicked review") || type.equals("Clicked preview") || type.equals("Clicked Read")) {
	    					
							if (currentStrategy.equals("preview-sections")){
								userData.timeOnPreview += (double)(time.getTime() - startStrategy.getTime())/60000;
							} else if (currentStrategy.equals("review-summaries")){
								userData.timeOnReview += (double)(time.getTime() - startStrategy.getTime())/60000;
							} else { // reader
								// stop counting section time
								if (startSection != null && section != -1) {
									userData.sectionTime[section] += (double)(time.getTime() - startSection.getTime())/60000;
									startSection = null; 
								}
							}
	    					
							// two different types of strategy change. ugh.
							if (true){
							// TODO: Fix this
								// if (type.split(" ")[0].equals("Clicked")){
								
								if (type.equals("Clicked Read")) {
									currentStrategy = "reader";
								} else if (type.equals("Clicked review")) { 
									currentStrategy = "review-summaries";
								} else { 
									currentStrategy = "preview-sections";
								}
								
							} else {
								currentStrategy = content.split(" ")[1];
							}
	    					    					
	    					startStrategy = time;
	    					continue;
	    				}   				
	    				
	    				// SECTION CHANGE
	    				if (type.equals("Scrolled To")) {
	    					if (section != -1 && startSection != null){
	    						
	    						userData.sectionTime[section] += (double)(time.getTime() - startSection.getTime())/60000;
		    					
	    					}
	    					currentStrategy = "reader";
	    					section = getSectionNum(content);
	    					startSection = time; 
	    					continue;
	    				}
	    				
	    				// PREVIEW PROGRESS
	    				if (type.equals("click toc strat section")) {
	    					currentStrategy = "preview-sections";
	    					previewProgress[Integer.parseInt(content.substring(15))]=true;
	    					continue;
	    				}
	    				
	    				// REVIEW PROGRESS
	    				if (type.equals("strat summary off")) {
	    					currentStrategy = "review-summaries";
	     					reviewProgress[Integer.parseInt(content.substring(14,15))]=true;
	    					continue;
	    				}  		
	    				

	    				
	    				// HIGHLIGHTS
	    				if (type.equals("highlight created")) {
	    					currentStrategy = "reader";
	    					if (section == -1)
	    						section = 0;
	    					
	    					if (content.length() < 40) {
	    						userData.highlights_short[section] ++;
	    					} else if (content.length() > 250) {
	    						userData.highlights_long[section] ++;
	    					} else {
	    						userData.highlights_med[section] ++;
	    					}
	    					
	    					// calculate new average highlight length
	    					userData.averageHighlightLength = ((userData.numHighlights * userData.averageHighlightLength) + content.length()) / (userData.numHighlights + 1);
	    					
	    					userData.numHighlights ++;
	    					
	    					continue;
	    				}
	    				
	    				// NOTES
	    				if (type.equals("Notes note created")) {
	    					currentStrategy = "reader";
	    					if (content.length() < 40) {
	    						userData.notes_short[section] ++;
	    					} else if (content.length() > 250) {
	    						userData.notes_long[section] ++;
	    					} else {
	    						userData.notes_med[section] ++;
	    					}	

	    					// calculate new average note length
	    					userData.averageNoteLength = ((userData.numNotes * userData.averageNoteLength) + content.length()) / (userData.numNotes +1 );

	    					userData.numNotes ++;
	    					
	    					continue;
	    				}
	    				
	    				// SECTION SUMMARY
	    				if (type.equals("Section Summary Changed")) {
	    					currentStrategy = "reader";
	    					userData.summaryLength[section] = content.length();
	    					continue;
	    				}
	    				
	    				// HIGHLIGHT DELETED
	    				if (type.equals("highlight deleted")) {
	    					currentStrategy = "reader";
	    					userData.highlights_deleted[section] ++;
	    					
	    					
	    					if ((userData.numHighlights-1)>0) { // can't divide by zero
		    					// calculate new average highlight length
		    					userData.averageHighlightLength = ((userData.numHighlights * userData.averageHighlightLength) - content.length()) / (userData.numHighlights - 1);
		    					
		    					userData.numHighlights --;
	    					} else {
	    						userData.averageHighlightLength = 0;
		    					
		    					userData.numHighlights = 0;
	    					}
	    					continue;
	    				}
	    				
	    				// NOTE DELETED
	    				if (type.equals("note deleted")) {
	    					currentStrategy = "reader";
	    					userData.notes_deleted[section] ++;
	    					
	    					if ((userData.numNotes-1) > 0) { // can't divide by zero
		    					// calculate new average note length
		    					userData.averageNoteLength = ((userData.numNotes * userData.averageNoteLength) - content.length()) / (userData.numNotes - 1);
		    					userData.numNotes --;
	    					} else {
	    						userData.averageNoteLength = 0;
	    						userData.numNotes = 0;
	    					}
	    					
	    					
	    					
	    					continue;
	    				}

	    				
	    			} // end each log
	    			
	    			// CLOSING TIME CALCULATIONS
	    			if (currentStrategy.equals("preview-sections")){
						userData.timeOnPreview += (double)(time.getTime() - startStrategy.getTime())/60000;
					} else if (currentStrategy.equals("review-summaries")){
						userData.timeOnReview += (double)(time.getTime() - startStrategy.getTime())/60000;
					} 
	    			
	    			if (startSection != null) {
						userData.sectionTime[section] += (double)(time.getTime() - startSection.getTime())/60000;
						
	    			}
	    			// CALCULATE PREVIEW PROGRESS
	    			int count = 0;
	    			for (boolean sect : previewProgress ) {
	    				if (sect) count ++;
	    			}
	    			userData.percentPreviewCompleated = ((double)count/6)*100;
	    			// if they did sections before they were removed, just count as 100%
	    			if (userData.percentPreviewCompleated > 100)  
	    				userData.percentPreviewCompleated = 100;
	    			
	    			
	    			// CALCULATE REVIEW PROGRESS
	    			count = 0;
	    			for (boolean sect : reviewProgress ) {
	    				if (sect) count ++;
	    			}
	    			userData.percentReviewCompleated = ((double)count/6)*100;
	    			// if they did sections before they were removed, just count as 100%
	    			if (userData.percentReviewCompleated > 100)  
	    				userData.percentReviewCompleated = 100;
	    			
	    			// CALCULATE AVERAGE SUMMARY LENGTH
	    			count=0;
	    			for (int n = 0; n<7; n++){
	    				userData.averageSummaryLength += userData.summaryLength[n]; 
	    			}
	    			userData.averageSummaryLength = (double)userData.averageSummaryLength/6; 
	    			
	    			results.add(userData);
    			}
    			
    		}// end each user
    		
    		exportCVS(results, response);
    		response.getWriter().close();
    		
		} // end make sure loged in		
	}
	
	public int getSectionNum(String content){
		return Integer.valueOf(content.substring(content.length()-1));
	}
	
	public void exportCVS (ArrayList<ParsedData> results, HttpServletResponse response) throws IOException{
		
	    // ..... process request

	    // ..... then respond
	    response.setContentType("text/csv");
	    response.setStatus(HttpServletResponse.SC_OK);
	    
	    response.getWriter().println(ParsedData.getColumnNames());
	   
	    for (ParsedData data : results) {
	    	response.getWriter().println(data);
	    }
	}
}

class ParsedData {
	
	final static int NUMSECTIONS = 11;
	
	String userEmail;
	
	// per section
	double[] sectionTime;
	int[] highlights_short;
	int[] highlights_med;
	int[] highlights_long;
	int[] highlights_deleted;
	int[] notes_short;
	int[] notes_med;
	int[] notes_long;
	int[] notes_deleted;
	int[] summaryLength;
	
	// totals
	int numReadingSessions;
	int numHighlights;
	int numNotes; 
	
	// averages
	double averageHighlightLength;
	double averageNoteLength;
	double averageSummaryLength;
	
	// preview / review
	double percentPreviewCompleated;
	double percentReviewCompleated;
	double timeOnPreview;
	double timeOnReview;
	
	// evaluation results
	
	
	public ParsedData(String userEmail){
		this.userEmail = userEmail;
		
		numReadingSessions = 0;
		sectionTime = new double[NUMSECTIONS];
		highlights_short = new int[NUMSECTIONS];
		highlights_med = new int[NUMSECTIONS];
		highlights_long = new int[NUMSECTIONS];
		highlights_deleted = new int[NUMSECTIONS];
		notes_short = new int[NUMSECTIONS];
		notes_med = new int[NUMSECTIONS];
		notes_long = new int[NUMSECTIONS];
		notes_deleted = new int[NUMSECTIONS];
		summaryLength = new int[NUMSECTIONS];
		numHighlights = 0;
		numNotes = 0;
		averageHighlightLength = 0;
		averageNoteLength = 0;
		averageSummaryLength = 0;
		percentPreviewCompleated = 0;
		percentReviewCompleated = 0;
		timeOnPreview = 0;
		timeOnReview = 0;
	}
	
	public static String getColumnNames(){
		String result = "email, numSessions, ";
		
		for (int n=0;n<NUMSECTIONS;n++){
			result += "sectionTime"+n+"," +
				"highlights_short"+n+"," +
				"highlights_med"+n+"," +
				"highlights_long"+n+"," +
				"highlights_deleted"+n+"," +
				"notes_short"+n+"," +
				"notes_med"+n+"," +
				"notes_long"+n+"," +
				"notes_deleted"+n+"," +
				"summaryLength"+n+",";
		}
		
		result+="averageHighlightLength,averageNoteLength,averageSummaryLength,percentPreviewCompleated," +
				"percentReviewCompleated,timeOnPreview,timeOnReview";
		
		return result;
	}
	
	public String toString(){
		String result = userEmail+"," + numReadingSessions +",";
		
		for (int n=0;n<NUMSECTIONS;n++){
			result += sectionTime[n]+"," +
				highlights_short[n]+"," +
				highlights_med[n]+"," +
				highlights_long[n]+"," +
				highlights_deleted[n]+"," +
				notes_short[n]+"," +
				notes_med[n]+"," +
				notes_long[n]+"," +
				notes_deleted[n]+"," +
				summaryLength[n]+",";
		}
		
		result+=averageHighlightLength+","+averageNoteLength+","+averageSummaryLength+","+percentPreviewCompleated+"," +
				percentReviewCompleated+","+timeOnPreview+","+timeOnReview;
		
		return result;
	}
	
}
