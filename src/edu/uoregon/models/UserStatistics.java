package edu.uoregon.models;

import java.util.ArrayList;
import javax.persistence.Id;

import com.googlecode.objectify.Key;
import com.googlecode.objectify.annotation.Cached;
import com.googlecode.objectify.annotation.Parent;
import com.googlecode.objectify.annotation.Serialized;

import edu.uoregon.models.groups.Group;

@Cached
public class UserStatistics {
	
	@Id public Long id; // id's of type Long are auto-generated
	@Parent public Key<Group> group;
	public Key<SaraUser> user;

	
	
	@Serialized private ArrayList<Integer> numberOfNotesTaken; //list of number of notes taken for an index
	@Serialized private ArrayList<Integer> hoursRead; //list highest rated comment posted on that index
	@Serialized private ArrayList<Integer> highestRatedComment; //list highest rated comment posted on that index
	private int BookCompletionPercentage = 0;
	
	
	public UserStatistics(ArrayList<String> dates, ArrayList<Integer> numberOfNotesTaken,ArrayList<Integer> highestRatedComment,ArrayList<Integer> hoursRead){
		
		
	}
	
	public UserStatistics() {}
	
	public UserStatistics(ArrayList<Integer> numberOfNotesTaken, ArrayList<Integer> hoursRead, ArrayList<Integer> highestRateComment) {
		this.numberOfNotesTaken = numberOfNotesTaken;
		this.hoursRead = hoursRead;
		this.highestRatedComment = highestRateComment;
	}

	public int getBookCompletionPercentage(){
		return BookCompletionPercentage;
	}
	
	public void setBookCompletionPercentage(int n){
		BookCompletionPercentage = n;
	}

	public void setNumberOfNotesTaken(ArrayList<Integer> numberOfNotesTaken) {
		this.numberOfNotesTaken = numberOfNotesTaken;
	}

	public ArrayList<Integer> getNumberOfNotesTaken() {
		return numberOfNotesTaken;
	}

	public void setHoursRead(ArrayList<Integer> hoursRead) {
		this.hoursRead = hoursRead;
	}

	public ArrayList<Integer> getHoursRead() {
		return hoursRead;
	}

	public void setHighestRatedComment(ArrayList<Integer> highestRatedComment) {
		this.highestRatedComment = highestRatedComment;
	}

	public ArrayList<Integer> getHighestRatedComment() {
		return highestRatedComment;
	}
	
	
}
