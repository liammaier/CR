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
public class Note {
	public Key<Section> section;
	@Id	public Long id;
	public Key<Group> group;
	public Key<SaraUser> user;
	public Text contents;
	public String type;
	int privacy; //0 if private
	public Date timeCreated;
	Date lastUpdated;
	List<String> tags;
	public boolean reviewed;

	public Note(Key<Section> section, String type, String contents, String annotation, Key<SaraUser> user)
	{	
		this.reviewed = false;
		this.section = section;
		this.contents = new Text(contents);
		this.type = type;
		this.user = user;
		this.timeCreated = new Date();
		this.lastUpdated = timeCreated;
		this.tags = new ArrayList<String>();
	}

	@SuppressWarnings("unused")
	private Note() {}

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
		Key<Note> key = new Key<Note>(Note.class, id);
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
