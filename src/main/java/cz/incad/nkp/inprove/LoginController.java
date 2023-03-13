
package cz.incad.nkp.inprove;

import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.http.HttpServletRequest;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author alberto
 */
public class LoginController {
  public static JSONObject get(HttpServletRequest req){
    Object session = req.getSession().getAttribute("login");
    return session != null ? (JSONObject) session : null;
  }
  
  public static void logout(HttpServletRequest req){
    req.getSession().invalidate();
  }
  
  public static boolean login(HttpServletRequest req, String user, String pwd){
    try {
      Options opts = Options.getInstance();
      JSONObject users = opts.getJSONObject("users");
      if(users.has(user) && users.getJSONObject(user).getString("pwd").equals(pwd)){
        req.getSession().setAttribute("login", users.getJSONObject(user));
        return true;
      }
      return false;
    } catch (JSONException ex) {
      Logger.getLogger(LoginController.class.getName()).log(Level.SEVERE, null, ex);
      return false;
    }
  }

  static boolean isLogged(HttpServletRequest req) {
    return req.getSession().getAttribute("login") != null;
  }
}
