package edu.uoregon.models.reader;

import java.util.Date;
import javax.persistence.Id;
import org.owasp.html.HtmlPolicyBuilder;
import org.owasp.html.PolicyFactory;
import com.google.appengine.api.datastore.Text;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.annotation.Cached;
import com.googlecode.objectify.annotation.Parent;

import edu.uoregon.models.SaraUser;


/** A comment represents the data object stored for user created comments within a discussion.  */

@Cached
public class Comment {

	@Id private Long id;
	@Parent private Key<Discussion> discussion;
	private Key<SaraUser> author;
	private int commentNumber;
	private Text text;
	private Date timeCreated;
	private Date lastUpdated;
	private int status;

	
	@SuppressWarnings("unused")
	private Comment() {} //Objectify requires an empty constructor.

	/** Creates a comment that belongs to a certain discussion.
	 * @param discussionKey the key of the discussion the comment belongs to
	 * @param author the author of the comment
	 * @param text the actual text of the comment
	 */
	public Comment(Key<Discussion> discussionKey, Key<SaraUser> author, String text) {
		this.discussion = discussionKey;
		this.author = author;
		this.commentNumber = 0;
		this.text = new Text(text);
		this.timeCreated = new Date();
		this.lastUpdated = timeCreated;
	}
	
	/** Gets the comment id.
	 *  @return the id of type Long
	 */
	public Long getId() {
		return id;
	}


	/** Gets the actual text of the comment.
	 *  @return the actual text of the comment
	 */
	public String getText() {
		return text.getValue();
	}
	
	/** Gets the key of the discussion that the comment belongs to.
	 * @return the key of the discussion the comment belongs to
	 */
	public Key<Discussion> getDiscussion() {
		return discussion;
	}
	
	/** Gets the comment number.
	 * @return the number assigned to a comment within a discussion
	 */
	public int getCommentNumber() {
		return commentNumber;
	}

	/** Gets the author of the comment.
	 * @return a Key object of the user.
	 */
	public Key<SaraUser> getAuthor() {
		return author;
	}

	/** Gets the time that the comment was created.
	 * @return the time the comment was created
	 */
	public Date getTimeCreated() {
		return timeCreated;
	}
	
	/** Gets the time that the comment was last updated.
	 * @return a Date object representing time of last update
	 */
	public Date getLastUpdated() {
		return lastUpdated;
	}


	/** Sets the comment number.
	 * @param commentNumber the number assigned to a comment within a discussion
	 */
	public void setCommentNumber(int commentNumber) {
		this.commentNumber = commentNumber;
	}

	@SuppressWarnings("unused")
	private String sanitizeHTML(String s) {
		PolicyFactory policy = new HtmlPolicyBuilder()
		.allowElements("a")
		.allowAttributes("href").onElements("a")
		.requireRelNofollowOnLinks()
		.toFactory();
		return policy.sanitize(s);
	}

	public int getStatus() {
		return status;
	}

	public void setStatus(int status) {
		this.status = status;
	}

}
