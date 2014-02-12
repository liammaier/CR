package edu.uoregon.models.reader;

import com.googlecode.objectify.*;
import com.googlecode.objectify.annotation.Cached;
import javax.persistence.Id;
import com.google.appengine.api.datastore.Text;
import com.google.gson.Gson;

import edu.uoregon.models.DAO;
import edu.uoregon.models.SaraUser;
import edu.uoregon.models.groups.Group;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import org.owasp.html.HtmlPolicyBuilder;
import org.owasp.html.PolicyFactory;

@Cached
public class Highlight {
	@Id	public Long id;
	public Key<Group> group;
	public Key<SaraUser> user;
	public Key<Section> section;
	public String annotation;
	public Text contents;
	public Text completesentences;
	public int sentenceOffset;
	public String question;
	public String answer;
	public String type;
	public String othertype;
	
	public int startContainer;
	public int startOffset;
	public int endContainer;
	public int endOffset;
	
	int privacy; // 0 if private
	public Date timeCreated;
	Date lastUpdated;
	List<String> tags;
	Long audioId;
	public boolean reviewed;

	public Highlight(Key<Section> section, String contents, String completesentences, String annotation, Key<SaraUser> user, String type, int startContainer, int startOffset, int endContainer, int endOffset)
	{	
		this.reviewed = false;
		this.annotation = annotation; 
		this.section = section;
		this.contents = new Text(contents);
		this.completesentences = new Text(completesentences);
		this.user = user;
		this.startContainer = startContainer;
		this.startOffset = startOffset;
		this.endContainer = endContainer;
		this.endOffset = endOffset;
		this.timeCreated = new Date();
		this.lastUpdated = timeCreated;
		this.tags = new ArrayList<String>();
		this.audioId = 0L;
		this.type = type;
		this.othertype = "";
	}

	@SuppressWarnings("unused")
	private Highlight() {}

	/**
	 * @return the ID of the highlight.
	 */
	public Long getId() { return id; }

	/**
	 * @return a JSON representation of the highlight.
	 */
	public String toJson() {
		Gson gson = new Gson();
		String json = gson.toJson(this);
		return json;
	}

	public SaraUser getSaraUser() {
		DAO dao = new DAO();
		return dao.ofy().get(user);
	}

	public String getStringKey(){
		Key<Highlight> key = new Key<Highlight>(Highlight.class, id);
		return key.getString();
	}

	/**
	 * Sanitizes the HTML in the annotation field of the Highlight.
	 */
	public void sanitizeHTML() {
		PolicyFactory policy = new HtmlPolicyBuilder()
		.allowElements("a")
		.allowAttributes("href").onElements("a")
		.requireRelNofollowOnLinks()
		.toFactory();
		contents = new Text(policy.sanitize(contents.getValue()));;
	}

}
