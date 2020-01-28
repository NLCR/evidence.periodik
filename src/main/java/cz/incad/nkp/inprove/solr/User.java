package cz.incad.nkp.inprove.solr;

import com.alibaba.fastjson.JSON;
import java.util.logging.Logger;
import org.apache.solr.client.solrj.beans.Field;
import org.json.JSONObject;

/**
 *
 * @author alberto
 */
public class User {

  final static Logger LOGGER = Logger.getLogger(User.class.getName());
  @Field
  public String code;
  @Field
  public String username;
  @Field
  public String nazev;
  @Field
  public String heslo;
  @Field
  public String sigla;
  @Field
  public String adresa;
  @Field
  public String role;
  @Field
  public int priorita;
  @Field
  public String email;
  @Field
  public String telefon;
  @Field
  public boolean active;
  @Field
  public String[] platba;
  @Field
  public String[] doprava;
  @Field
  public boolean celostatni;
  @Field
  public boolean regionalni;
  @Field
  public boolean periodicky;
  @Field
  public String prijemce;
  @Field
  public String poznamka;
  @Field
  public String osoba;
  @Field
  public String cenik_osobni;
  @Field
  public String cenik_nadobirku;
  @Field
  public String cenik_predem;
  
  
  public static User fromJSON(JSONObject json) {
    User user = JSON.parseObject(json.toString(), User.class);
    if (user.code == null || user.code.trim().isEmpty()) {
      user.code = MD5.generate(new String[]{user.nazev, user.email});
    }
    return user;
  }
  
//  public static User fromJSONx(JSONObject json) {
//    
//    User user = new User();
//    user.code = json.getString("code");
//    user.username = json.getString("username");
//    user.heslo = MD5.generate(json.getString("heslo"));
//    user.nazev = json.getString("nazev");
//    user.role = json.getString("role");
//    user.priorita = json.getInt("priorita");
//    user.telefon = json.getString("telefon");
//    user.email = json.getString("email");
//    user.sigla = json.getString("sigla");
//    user.adresa = json.getString("adresa");
//    user.active = json.getBoolean("active");
//    return user;
//  }

//  public static User byCode(String code) {
//    try {
//      SolrQuery query = new SolrQuery("code:\"" + code + "\"");
//      return query(query);
//    } catch (IOException ex) {
//      LOGGER.log(Level.SEVERE, null, ex);
//      return null;
//    }
//  }

//  private static User query(SolrQuery query) throws IOException {
//
//    Options opts = Options.getInstance();
//    try (SolrClient client = new HttpSolrClient.Builder(String.format("%s/%s/",
//            opts.getString("solrHost", "http://localhost:8983/solr"),
//            opts.getString("usersCore", "users")))
//            .build()) {
//
//      final QueryResponse response = client.query(query);
//      return response.getBeans(User.class).get(0);
//
//    } catch (SolrServerException | IOException ex) {
//      LOGGER.log(Level.SEVERE, null, ex);
//      return null;
//    }
//  }
}
