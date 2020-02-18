package cz.incad.nkp.inprove;

import com.alibaba.fastjson.JSON;
import cz.incad.nkp.inprove.solr.Indexer;
import cz.incad.nkp.inprove.solr.MD5;
import cz.incad.nkp.inprove.solr.User;
import java.io.IOException;
import java.util.Base64;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.http.HttpServletRequest;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.SolrServerException;
import org.apache.solr.client.solrj.impl.HttpSolrClient;
import org.apache.solr.client.solrj.impl.NoOpResponseParser;
import org.apache.solr.client.solrj.request.QueryRequest;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.apache.solr.common.util.NamedList;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author alberto
 */
public class UsersController {

  final static Logger LOGGER = Logger.getLogger(UsersController.class.getName());

  public static JSONObject get(HttpServletRequest req) {
    JSONObject jo = new JSONObject();
    Object session = req.getSession().getAttribute("login");
    if (session != null) {
      return (JSONObject) session;
    } else {
      return null;
    }
  }

  public static void logout(HttpServletRequest req) {
    req.getSession().invalidate();
  }

  public static JSONObject getOne(String id, boolean pwd) {
    try {

      Options opts = Options.getInstance();
      SolrQuery query = new SolrQuery("id:" + id);
      try (HttpSolrClient client = new HttpSolrClient.Builder(opts.getString("solrHost", "http://localhost:8983/solr")).build()) {
        final QueryResponse response = client.query("user", query);
        User user = response.getBeans(User.class).get(0);
        if (!pwd) {
          user.heslo = null;
        }
        return new JSONObject(JSON.toJSONString(user));

      } catch (SolrServerException | IOException ex) {
        LOGGER.log(Level.SEVERE, null, ex);
      }

    } catch (JSONException ex) {
      LOGGER.log(Level.SEVERE, null, ex);
    }
    return null;
  }

  public static User getUser(String id) {
    try {

      Options opts = Options.getInstance();
      SolrQuery query = new SolrQuery("id:" + id);
      try (HttpSolrClient client = new HttpSolrClient.Builder(opts.getString("solrHost")).build()) {
        final QueryResponse response = client.query("user", query);
        User user = response.getBeans(User.class).get(0);
        return user;

      } catch (SolrServerException | IOException ex) {
        LOGGER.log(Level.SEVERE, null, ex);
      }

    } catch (JSONException ex) {
      LOGGER.log(Level.SEVERE, null, ex);
    }
    return null;
  }

  public static JSONObject getAll() {
    try {

      Options opts = Options.getInstance();
      SolrQuery query = new SolrQuery("*");
      try (HttpSolrClient client = new HttpSolrClient.Builder(opts.getString("solrHost", "http://localhost:8983/solr")).build()) {
        QueryRequest qreq = new QueryRequest(query);

        NoOpResponseParser dontMessWithSolr = new NoOpResponseParser();
        dontMessWithSolr.setWriterType("json");
        client.setParser(dontMessWithSolr);
        NamedList<Object> qresp = client.request(qreq, "user");
        JSONObject r = new JSONObject((String) qresp.get("response"));
        JSONObject resp = r.getJSONObject("response");
        for (int i = 0; i < resp.getJSONArray("docs").length(); i++) {
          resp.getJSONArray("docs").getJSONObject(i).remove("heslo");
          resp.getJSONArray("docs").getJSONObject(i).remove("_version_");
          resp.getJSONArray("docs").getJSONObject(i).remove("timestamp");
        }
        return resp;

      } catch (SolrServerException | IOException ex) {
        LOGGER.log(Level.SEVERE, null, ex);
      }

    } catch (JSONException ex) {
      LOGGER.log(Level.SEVERE, null, ex);
    }
    return null;
  }

  public static JSONObject login(HttpServletRequest req, String username, String pwd) {
    try {

      Options opts = Options.getInstance();
      SolrQuery query = new SolrQuery("username:\"" + username + "\"");
      //query.addFilterQuery("active:true");
      try (SolrClient client = new HttpSolrClient.Builder(String.format("%s/%s/",
              opts.getString("solrHost", "http://localhost:8983/solr"),
              "user"))
              .build()) {

        final QueryResponse response = client.query(query);
        if (response.getResults().getNumFound() == 0) {
          LOGGER.log(Level.INFO, "Invalid username {0}", username);
          return null;
        }
        User user = response.getBeans(User.class).get(0);
        // if (user.getHeslo().equals(MD5.generate(pwd))) {
        if (user.heslo.equals(pwd)) {
          JSONObject json = new JSONObject(JSON.toJSONString(user));
          json.remove("heslo");
          req.getSession().setAttribute("login", json);
          return json;
        } else {
          LOGGER.log(Level.INFO, "Invalid password");
        }

      } catch (SolrServerException | IOException ex) {
        LOGGER.log(Level.SEVERE, null, ex);
        return null;
      }

      return null;
    } catch (JSONException ex) {
      LOGGER.log(Level.SEVERE, null, ex);
      return null;
    }
  }

  public static boolean isLogged(HttpServletRequest req) {
    if (req.getSession().getAttribute("login") != null) {
      return true;
    } else {
      try {
        // try Basic auth
        // Get Authorization header
        String auth = req.getHeader("Authorization");
        // Do we allow that user?
        if (!allowUser(req, auth)) {
          // Not allowed, so report he's unauthorized
          //res.setHeader("WWW-Authenticate", "BASIC realm=\"appuntivari test\"");
          //res.sendError(res.SC_UNAUTHORIZED);
          return false;
          // Could offer to add him to the allowed user list
        } else {
          // Allowed, so show him the secret stuff
          //out.println("Top-secret stuff");
          return true;
        }
      } catch (IOException ex) {
        LOGGER.log(Level.SEVERE, null, ex);
        return false;
      }
    }
  }

  protected static boolean allowUser(HttpServletRequest req, String auth) throws IOException {

    if (auth == null) {
      LOGGER.log(Level.INFO, "No Auth");
      return false;
    }
    if (!auth.toUpperCase().startsWith("BASIC ")) {
      LOGGER.log(Level.INFO, "Only Accept Basic Auth");
      return false;
    }

    // Get encoded user and password, comes after "BASIC "  
    String userpassEncoded = auth.substring(6);

    // Decode it, using any base 64 decoder  
    byte[] decoded = Base64.getDecoder().decode(userpassEncoded);

    String userpassDecoded = new String(decoded);

    String account[] = userpassDecoded.split(":");

    return login(req, account[0], account[1]) != null;
  }

  public static JSONObject add(JSONObject json) {
    User user = User.fromJSON(json);
    JSONObject jo = new JSONObject(JSON.toJSONString(user));
    return Indexer.indexJSON(jo, "user");
  }

  public static JSONObject initAdmin(String pwd) {
    User user = new User();
    user.heslo = MD5.generate(pwd);
    user.nazev = "Administrator";
    user.username = "admin";
    user.email = "test@test.cz";
    user.role = "ADMIN";
    user.active = true;
	user.id = MD5.generate(new String[]{user.nazev, user.email});
    JSONObject jo = new JSONObject(JSON.toJSONString(user));
    JSONObject ret =  Indexer.indexJSON(jo, "user");
    ret.put("user", jo);
    return ret;
  }

  public static JSONObject save(JSONObject json) {
    //Retreive pwd. It should be missed in request
    JSONObject orig = getOne(json.getString("id"), true);
    json.put("heslo", orig.get("heslo"));
    User user = User.fromJSON(json);
    JSONObject jo = new JSONObject(JSON.toJSONString(user));
    return Indexer.indexJSON(jo, "user");
  }

  public static JSONObject resetHeslo(JSONObject json) {

    JSONObject orig = getOne(json.getString("id"), true).getJSONArray("docs").getJSONObject(0);
    if (json.getString("oldheslo").equals(orig.getString("heslo"))) {
      orig.put("heslo", json.getString("newheslo"));
      return Indexer.indexJSON(orig, "user");
    } else {
      return (new JSONObject()).put("error", "heslo.nespravne_heslo");
    }
  }

  public static JSONObject exists(String username) {
    Options opts = Options.getInstance();
    SolrQuery query = new SolrQuery("username:\"" + username + "\"");
    try (HttpSolrClient client = new HttpSolrClient.Builder(opts.getString("solrHost", "http://localhost:8983/solr")).build()) {
      return new JSONObject().put("exists", client.query("user", query).getResults().getNumFound() > 0);
    } catch (SolrServerException | IOException ex) {
      LOGGER.log(Level.SEVERE, null, ex);
      return new JSONObject().put("error", ex);
    }
  }

}
