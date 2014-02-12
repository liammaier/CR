package edu.uoregon.servlets;

import java.io.IOException;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import edu.uoregon.models.SaraUser;

import java.io.*;
import java.net.*;

public class TTSServlet extends HttpServlet {

	private static final long serialVersionUID = 1L;

	public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException, IllegalArgumentException {
		response.setHeader("Access-Control-Allow-Origin", "*");

		// gives us the current user or NULL if they are not allowed in the site
		SaraUser currentUser = SaraServlet.login(request,response);
		if(currentUser != null){

			try {

				response.setContentType("audio/mpeg");

				String text = request.getQueryString();
				response.setStatus(HttpServletResponse.SC_OK);

				OutputStream out = response.getOutputStream();
				byte[] buffer = new byte[1000];

				//InputStream content = new URL("http://translate.google.com/translate_tts?q=I+love+techcrunch").openStream();

				URL oracle = new URL("http://translate.google.com/translate_tts?tl=en&q="+text);
				URLConnection yc = oracle.openConnection();
				yc.addRequestProperty("User-Agent", "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.0)");

				InputStream content =  yc.getInputStream();

				for (int i = content.read(buffer); i >= 0; i = content.read(buffer))
					out.write(buffer, 0, i);
				out.close();

			} catch (IOException ex) {
				log(this.getClass().getName(), ex);
				response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "I/O Error");
				return;
			} catch (RuntimeException ex) {
				log(this.getClass().getName(), ex);
				response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Form Data Format Error");
				return;
			}//endtry
		}
	}
}
