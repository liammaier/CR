package edu.uoregon.servlets.options;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.googlecode.objectify.Objectify;

import edu.uoregon.models.DAO;
import edu.uoregon.models.Reminder;
import edu.uoregon.models.SaraUser;
import edu.uoregon.servlets.SaraServlet;

public class SubmitRemindersServlet extends HttpServlet {

	private static final long serialVersionUID = 1L;

	public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		response.setHeader("Access-Control-Allow-Origin", "*");

		// gives us the current user or NULL if they are not allowed in the site
		SaraUser currentUser = SaraServlet.login(request,response);
		if(currentUser != null){

	    	DAO dao = new DAO(); // access Objectify through this object which handles registration of our entity classes
	    	Objectify ofy = dao.ofy();
    	
	    	List<Reminder> reminders = ofy.query(Reminder.class).filter("user", currentUser.getKey()).list();    	
	    	
	    	// Reminder( name, type,  message,  hearIt,  frequencyType,  frequency,  time) {
	    	
	    	// TOTAL-TIME

	    	// get existing if there is one and delete it 
	    	dao.ofy().delete(findReminder(reminders, "total-time"));
	    	// add new one if it was added
	    	if (request.getParameter("total-time") != null && request.getParameter("time") != null)
	    		ofy.put(new Reminder(currentUser.getKey(), "total-time", "reminder-plan", "", "no message", false, "no frequency", 0, Integer.parseInt(request.getParameter("time"))));	    		
	    	
	    	// TIME-LEFT
	    	dao.ofy().delete(findReminder(reminders, "time-left"));
	    	// check main option. then check each one
	    	if (request.getParameter("time-left") != null ) { 
	    		if (request.getParameter("time-left5") != null ) 
	    			ofy.put(new Reminder(currentUser.getKey(), "time-left", "reminder-plan", "", "no message", false, "no frequency", 0, 5));
	    		if (request.getParameter("time-left10") != null ) 
	    			ofy.put(new Reminder(currentUser.getKey(), "time-left", "reminder-plan", "", "no message", false, "no frequency", 0, 10));
	    		if (request.getParameter("time-left20") != null ) 
	    			ofy.put(new Reminder(currentUser.getKey(), "time-left", "reminder-plan", "", "no message", false, "no frequency", 0, 20));
	    		if (request.getParameter("time-left30") != null ) 
	    			ofy.put(new Reminder(currentUser.getKey(), "time-left", "reminder-plan", "", "no message", false, "no frequency", 0, 30));
	    	}
	    	
	    	// STARTUP-MATERIALS
	    	dao.ofy().delete(findReminder(reminders, "startup-materials"));
	    	if (request.getParameter("startup-materials") != null ) { 
	    		if (request.getParameter("startup-materials-glasses") != null ) 
	    			ofy.put(new Reminder(currentUser.getKey(), "startup-materials", "reminder-prior", "glasses", "Glasses", false, "no frequency", 0, 0));
	    		if (request.getParameter("startup-materials-syllabus") != null ) 
	    			ofy.put(new Reminder(currentUser.getKey(), "startup-materials", "reminder-prior", "syllabus", "Syllabus", false, "no frequency", 0, 0));
	    		if (request.getParameter("startup-materials-notes") != null ) 
	    			ofy.put(new Reminder(currentUser.getKey(), "startup-materials", "reminder-prior", "notes", "Lecture notes", false, "no frequency", 0, 0));
	    		if (request.getParameter("startup-materials-other") != null && request.getParameter("startup-materials-other-text") != null) 
	    			ofy.put(new Reminder(currentUser.getKey(), "startup-materials", "reminder-prior", "other", request.getParameter("startup-materials-other-text"), false, "no frequency", 0, 0));
	    	}
	    	
	    	// ORGANIZE STUDY SPACE
	    	dao.ofy().delete(findReminder(reminders, "startup-organize"));
	    	if (request.getParameter("startup-organize") != null ) { 
	    		if (request.getParameter("startup-organize-door") != null ) 
	    			ofy.put(new Reminder(currentUser.getKey(), "startup-organize", "reminder-prior", "door", "Shut Door", false, "no frequency", 0, 0));
	    		if (request.getParameter("startup-organize-devices") != null ) 
	    			ofy.put(new Reminder(currentUser.getKey(), "startup-organize", "reminder-prior", "devices", "Turn off other devices (e.g. cellphone, tv)", false, "no frequency", 0, 0));
	    		if (request.getParameter("startup-organize-light") != null ) 
	    			ofy.put(new Reminder(currentUser.getKey(), "startup-organize", "reminder-prior", "light", "Turn on light", false, "no frequency", 0, 0));
	    		if (request.getParameter("startup-organize-other") != null && request.getParameter("startup-organize-other-text") != null) 
	    			ofy.put(new Reminder(currentUser.getKey(), "startup-organize", "reminder-prior", "other", request.getParameter("startup-organize-other-text"), false, "no frequency", 0, 0));
	    	}
	    	
	    	// REVIEW BY TIME AND SECTIOM
	    	dao.ofy().delete(findReminder(reminders, "modal"));
	    	// by time
	    	if (request.getParameter("review-time") != null ) { 
	    		if (request.getParameter("review-time-time") != null ) 
	    			ofy.put(new Reminder(currentUser.getKey(), "modal", "reminder-reivew", "review-time", "Would you like to review?", false, "time", Integer.parseInt(request.getParameter("review-time-time")), 0));
	    	}
	    	// by section
	    	if (request.getParameter("review-section") != null ) { 
	    		if (request.getParameter("review-section-num") != null ) 
	    			ofy.put(new Reminder(currentUser.getKey(), "modal", "reminder-reivew", "review-section", "Would you like to review?", false, "section", Integer.parseInt(request.getParameter("review-section-num")), 0));
	    	}
	    	
	    	// REMINDERS DURING
	    	List<Reminder> remindersDuring = findReminder(reminders, "temp");
	    	dao.ofy().delete(remindersDuring);
	    	List<Reminder> remindersPpermanent = findReminder(reminders, "permanent");
	    	dao.ofy().delete(remindersPpermanent);
	    	
	    	// ENCOURAGE PROGRESS & MANAGE SYMPTOMS
	    	// generate the list to check if the parent caragories are checked
	    	ArrayList<String> reminderList = new ArrayList<String>();
	    	if (request.getParameter("encourage-progress") != null) {
	    		reminderList.add("icandothis");
	    		reminderList.add("stepgoal");
	    		reminderList.add("oneday");
	    		reminderList.add("encourage-other");
	    	}
	    	if (request.getParameter("manage-symptoms") != null) {
	    		reminderList.add("deepbreath");
	    		reminderList.add("stretch");
	    		reminderList.add("massage");
	    		reminderList.add("manage-other");
	    	}
	    	// loop through the different types and paarse them
	    	String seeorhear = "";
	    	String frequencyType = "";
	    	int frequency = 0;
	    	String message = "";
	    	for (String name: reminderList) {
	    		// see if it's enabled at all
	    		if (request.getParameter(name) != null) {
	    			
	    			// get message
	    			if (request.getParameter(name+"-text") != null) {
	    				// if it's an "Other" one
    					message = request.getParameter(name+"-text");
	    			} else if (request.getParameter(name+"-message") != null) {
	    				message = request.getParameter(name+"-message");
	    			} else {
	    				continue;
	    			}
	    			// find see or hear
	    			if (request.getParameter(name+"-seeorhear") != null) {
	    				seeorhear = request.getParameter(name+"-seeorhear");
	    			} else {
	    				continue;
	    			}
	    			// find frequency type
	    			if (request.getParameter(name+"-"+seeorhear+"-frequencytype") != null) {
	    				frequencyType = request.getParameter(name+"-"+seeorhear+"-frequencytype");
	    			} else {
	    				continue; 
	    			}
	    			// if permanent reminder
	    			if (frequencyType.equals("permanent")) {
	    				ofy.put(new Reminder(currentUser.getKey(), "permanent", "reminder-during", name, message, (seeorhear.equals("seeithearit")), frequencyType, frequency, 0));
	    				continue;
	    			}
	    			// find frequency
	    			if (request.getParameter(name+"-"+seeorhear+"-"+frequencyType+"-frequency") != null) {
	    				frequency = Integer.parseInt(request.getParameter(name+"-"+seeorhear+"-"+frequencyType+"-frequency"));
	    			} else {
	    				continue;
	    			}
	    	    	// Save the reminder!
	    			ofy.put(new Reminder(currentUser.getKey(), "temp", "reminder-during", name, message, (seeorhear.equals("seeithearit")), frequencyType, frequency, 0));
	    		}
	    	}
	    	
	    	response.sendRedirect("/basic/options/reminders.html");
	    	
		}
	}
	
	// find the reminder we're looking for
	public List<Reminder> findReminder(List<Reminder> reminders, String name) {
		List<Reminder> output = new ArrayList<Reminder>();
		for (Reminder reminder : reminders){
			if (reminder.name.equals(name)){
				output.add(reminder);
			}
		}
		return output;
	}
	
}