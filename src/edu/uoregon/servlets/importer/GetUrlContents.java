package edu.uoregon.servlets.importer;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.net.SocketTimeoutException;
import java.net.URL;
import java.net.URLConnection;

import javax.servlet.http.*;

@SuppressWarnings("serial")
public class GetUrlContents extends HttpServlet {
	public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		req.setCharacterEncoding("UTF-8");
		resp.setContentType("text/plain");
		resp.setCharacterEncoding("UTF-8");
		String urlString = req.getParameter("importURL");
		if(urlString.indexOf("#") != -1){
			urlString = urlString.substring(0,urlString.indexOf("#")-1);
		}
		//get the html from a url that the client asked for
		try{
			URL url = new URL(urlString);
			URLConnection con = url.openConnection();
			con.setReadTimeout(10000);
			
			//** http://stackoverflow.com/questions/1381617/simplest-way-to-correctly-load-html-from-web-page-into-a-string-in-java **//
			try{
				/* If Content-Type doesn't match this pre-conception, choose default and 
				 * hope for the best. */
				Reader r = new InputStreamReader(con.getInputStream(), "UTF-8");
				StringBuilder buf = new StringBuilder();
				while (true) {
				  int ch = r.read();
				  if (ch < 0)
				    break;
				  buf.append((char) ch);
				}
				resp.getWriter().print(buf.toString());

			}catch(SocketTimeoutException e){
				resp.getWriter().print("request timeout");
			}		
			
//			String str = buf.toString();
//			System.out.println(url.getProtocol());
//		    BufferedReader reader = new BufferedReader(new InputStreamReader(url.openStream(), "UTF-8"));
//		    String line;
//		    String all ="";
//		    while ((line = reader.readLine()) != null) {
//		    	all += line;
//		    }
//		    reader.close();
			
		}catch(Exception e){
			e.printStackTrace();
			resp.getWriter().print("invalid url");
		}
	}
}
