package edu.uoregon.models;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.Serializable;
import java.net.URL;
import java.net.URLConnection;
import java.util.Date;

import com.google.appengine.api.datastore.Blob;
import com.googlecode.objectify.annotation.Cached;

import javax.persistence.Id;
import javax.servlet.ServletInputStream;

/**
 * A class representing a document in SARA.
 */
@Cached
public class Image implements Serializable {
	/**
	 * 
	 */
	private static final long serialVersionUID = -4094047696528162362L;
	@Id public Long id;
	public Blob src;
	public String credit; // chapter, article, import
	public String caption;
	public String contents;
	public String mimeType;
	public Date timeCreated;
	
  /**
   * Create a new document
   * @param title the title of the document.
   */
	
	// article
	// All
	public Image(String src,String caption, String credit) {
		
	    // construct our entity objects
		try{
			this.src = srcToBlob(src);
		}catch(Exception e){
			System.err.println("failed to create blob for image");
		}
		if(src.lastIndexOf(".") + 1 != 0){
			String mime = src.substring(src.lastIndexOf(".")+1,src.length());
			if(mime.equals("")){
				this.mimeType = "image/jpeg";
			}else{
				this.mimeType = "image/jpeg";
				//for now make everything a jpeg
				//this.mimeType = "image/"+mime;
			}
		}else{
			this.mimeType = "image/jpeg";
		}
		System.out.println("Image saved with mime type:" + this.mimeType);
		this.caption = caption;
		this.credit = credit;
		this.timeCreated = new Date();
	}
	
	private Blob srcToBlob(String src) throws Exception{
		URL url = new URL(src);
		URLConnection con = url.openConnection();
		
		InputStream imgStream = con.getInputStream();
		ByteArrayOutputStream buffer = new ByteArrayOutputStream();

		int nRead;
		byte[] data = new byte[16384];

		while ((nRead = imgStream.read(data, 0, data.length)) != -1) {
		  buffer.write(data, 0, nRead);
		}

		buffer.flush();

		return new Blob(buffer.toByteArray());
	}
	@SuppressWarnings("unused")
	private Image() {}

	public Image(ServletInputStream imgStream,String name) throws IOException {
		ByteArrayOutputStream buffer = new ByteArrayOutputStream();

		int nRead;
		byte[] data = new byte[16384];
		while ((nRead = imgStream.read(data, 0, data.length)) != -1) {
		  buffer.write(data, 0, nRead);
		}

		buffer.flush();

		this.src =  new Blob(buffer.toByteArray());
		
		if(name.lastIndexOf(".") + 1 != 0){
			String mime = name.substring(name.lastIndexOf(".")+1,name.length());
			if(mime.equals("")){
				this.mimeType = "image/jpeg";
			}else{
				this.mimeType = "image/"+mime;
			}
		}else{
			this.mimeType = "image/jpeg";
		}
		System.out.println("Image saved with mime type:" + this.mimeType);
		this.caption = "";
		this.credit = "";
		this.timeCreated = new Date();
	}

	public Long getId() {return id;}
}
