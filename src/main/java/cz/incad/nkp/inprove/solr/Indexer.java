package cz.incad.nkp.inprove.solr;

import cz.incad.nkp.inprove.CloneParams;
import cz.incad.nkp.inprove.Options;
import java.io.IOException;
import java.math.BigInteger;
import java.net.MalformedURLException;
import java.net.URL;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.ResolverStyle;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.apache.commons.io.IOUtils;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.SolrServerException;
import org.apache.solr.client.solrj.impl.HttpSolrClient;
import org.apache.solr.common.SolrDocument;
import org.apache.solr.common.SolrInputDocument;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author alberto
 */
public class Indexer {

  static final Logger LOGGER = Logger.getLogger(Indexer.class.getName());
  private final String DEFAULT_HOST = "http://localhost:8983/solr/";

  public String host() {

    try {
      Options opts = Options.getInstance();
      return opts.getString("solrhost", DEFAULT_HOST);
    } catch (IOException | JSONException ex) {
      LOGGER.log(Level.SEVERE, null, ex);
    }
    return DEFAULT_HOST;
  }

  private SolrClient getClient() throws IOException {
    SolrClient client = new HttpSolrClient.Builder(Options.getInstance().getString("solrhost", DEFAULT_HOST)).build();
    return client;
  }

  private SolrClient getClient(String core) throws IOException {
    SolrClient client = new HttpSolrClient.Builder(String.format("%s%s",
            Options.getInstance().getString("solrhost", DEFAULT_HOST),
            core)).build();
    return client;
  }

  private boolean isSpecial(SolrClient solr, LocalDate date) {
    try {
      SolrQuery query = new SolrQuery();
      query.setRows(1);
      query.set("wt", "json");
      query.setQuery("id:\"" + date.format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "\" OR id:\"" + date.format(DateTimeFormatter.ofPattern("MMdd")) + "\"");
      return solr.query("calendar", query).getResults().getNumFound() > 0;
    } catch (SolrServerException ex) {
      Logger.getLogger(Indexer.class.getName()).log(Level.SEVERE, null, ex);
    } catch (IOException ex) {
      Logger.getLogger(Indexer.class.getName()).log(Level.SEVERE, null, ex);
    }
    return false;
  }

  /**
   * Method clones existing issue
   *
   * @param cfg : JsonObject with the clone parameters
   */
  public void clone(CloneParams cfg) {
    try (SolrClient solr = getClient()) {

      SolrQuery query = new SolrQuery();
      query.setRows(1);
      query.set("wt", "json");
      query.setQuery("id:\"" + cfg.id + "\"");
      query.setFields("*,exemplare:[json]");
      //JSONObject doc = json(query, "issue").getJSONObject("response").getJSONArray("docs").getJSONObject(0);
      //LOGGER.log(Level.INFO,doc.toString(2));
      SolrDocument doc = solr.getById("issue", cfg.id);
      LOGGER.log(Level.INFO, doc.toString());
      SimpleDateFormat sdf1 = new SimpleDateFormat("yyyy-MM-dd");
      Date startDate = sdf1.parse(cfg.start_date);
      Date endDate = sdf1.parse(cfg.end_date);

      LocalDate start = startDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
      LocalDate end = endDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();

      Period period = Period.parse(cfg.periodicity);

      int number = cfg.start_number;
      int year = cfg.start_year;

      for (LocalDate date = start; date.isBefore(end); date = date.plus(period)) {
        if (!cfg.onSpecialDays && isSpecial(solr, date)) {
          continue;
        }
        if (cfg.mutations.size() > 0) {
          for (String mutation : cfg.mutations) {
            SolrInputDocument idoc = cloneOne(doc, date, mutation, number, year);
            solr.add("issue", idoc);
          }
        } else {
          SolrInputDocument idoc = cloneOne(doc, date, null, number, year);
          solr.add("issue", idoc);
        }
        number++;
        year = Period.between(start, date).getYears() + cfg.start_year;
      }

      solr.commit("issue");
    } catch (SolrServerException | IOException | ParseException ex) {
      LOGGER.log(Level.SEVERE, null, ex);
    }
  }

  private SolrInputDocument cloneOne(SolrDocument doc, LocalDate date, String mutace, int number, int year) {
    SolrInputDocument idoc = new SolrInputDocument();
    doc.getFieldNames().forEach((name) -> {
      idoc.addField(name, doc.getFieldValue(name));
    });
    idoc.removeField("_version_");
    idoc.setField("datum_vydani", date.format(DateTimeFormatter.ISO_DATE));
    idoc.setField("datum_vydani_den", date.format(DateTimeFormatter.BASIC_ISO_DATE));
    
    idoc.setField("state", "auto");
    idoc.setField("exemplare", "");
    idoc.setField("cislo", number);
    idoc.setField("rocnik", year);
    if (mutace != null) {
      idoc.setField("mutace", mutace);
    }
    //idoc.setField("id", UUID.randomUUID());
    //idoc.removeField("id");
    idoc.setField("id", generateId(idoc));
    return idoc;
  }

  private String generateId(SolrInputDocument doc) {
    try {
      MessageDigest md = MessageDigest.getInstance("SHA-1");
      StringBuilder sb = new StringBuilder();
      String[] fields = Options.getInstance().getStrings("idfields");
      for (String field : fields) {
        if (doc.containsKey(field)) {
          sb.append(doc.getFieldValue(field).toString()).append(" ");
        }
      }
      md.update(sb.toString().getBytes());
      BigInteger id = new BigInteger(1, md.digest());
      return String.format("%032X", id);

    } catch (NoSuchAlgorithmException | IOException | JSONException ex) {
      LOGGER.log(Level.SEVERE, null, ex);
      return null;
    }
  }

  public JSONObject fromJSON(JSONObject json) {
    JSONObject ret = new JSONObject();
    try (SolrClient solr = getClient()) {
      SolrInputDocument idoc = new SolrInputDocument();
      for (Object key : json.keySet()) {
        String name = (String) key;
        if (null == name) {
          idoc.addField(name, json.get(name));
        } else//      json.keySet().forEach((String name) -> {
        switch (name) {
          case "datum_vydani":
            //          SimpleDateFormat sdf1 = new SimpleDateFormat("yyyy-MM-dd");
            
//          LocalDate date = LocalDate.now();
            DateTimeFormatter f = DateTimeFormatter.ISO_INSTANT.withResolverStyle(ResolverStyle.SMART);
            Instant ins = Instant.from(f.parse(json.getString(name)));
            LocalDateTime date = LocalDateTime.ofInstant(ins, ZoneId.systemDefault());
            idoc.setField("datum_vydani", date.format(DateTimeFormatter.ISO_DATE));
            idoc.setField("datum_vydani_den", date.format(DateTimeFormatter.BASIC_ISO_DATE));
            break;
        //Skip this
          case "_version_":
            break;
          case "exemplare":
            //Extract vlastnik and index each exemplar
            JSONArray ex = json.getJSONArray(name);
            for(int i = 0; i<ex.length(); i++){
              String vl = ex.getJSONObject(i).getString("vlastnik");
              idoc.addField("vlastnik", vl);
              idoc.addField("exemplare", ex.getJSONObject(i).toString());
            } break;
          default:
            idoc.addField(name, json.get(name));
            break;
        }
      }
      
      if("".equals(json.optString("id", ""))){
        idoc.setField("id", generateId(idoc));
      }
      LOGGER.info(idoc.toString());
      solr.add("issue", idoc);
      solr.commit("issue");
      ret.put("success", "issue saved");
    } catch (SolrServerException | IOException ex) {
      ret.put("error", ex);
      LOGGER.log(Level.SEVERE, null, ex);
    }
    return ret;
  }

  public JSONObject json(SolrQuery query, String core) throws MalformedURLException, IOException {
    query.set("wt", "json");
    String solrURL = String.format("%s%s/select",
            host(),
            core);
    URL url = new URL(solrURL + query.toQueryString());
    return new JSONObject(IOUtils.toString(url, "UTF-8"));

    //return doQuery(query, core);
  }

  public String json(String urlQueryString, String core) throws MalformedURLException, IOException {

    String solrURL = String.format("%s/%s/select",
            host(),
            core);
    URL url = new URL(solrURL + "?" + urlQueryString);

    // use org.apache.commons.io.IOUtils to do the http handling for you
    String resp = IOUtils.toString(url, "UTF-8");

    return resp;
  }

  public void delete(String id) {
    try (SolrClient solr = getClient("issue")) {
      solr.deleteById(id, 10);
    } catch (IOException | SolrServerException ex) {
      LOGGER.log(Level.SEVERE, null, ex);
    }
  }

  public void setState(String id) {
    try (SolrClient solr = getClient("issue")) {
      SolrInputDocument doc = new SolrInputDocument();
      Map<String, String> partialUpdate = new HashMap<>();
      partialUpdate.put("set", "ok");
      doc.addField("id", id);
      doc.addField("state", partialUpdate);
      solr.add(doc, 10);
    } catch (IOException | SolrServerException ex) {
      LOGGER.log(Level.SEVERE, null, ex);
    }
  }

}
