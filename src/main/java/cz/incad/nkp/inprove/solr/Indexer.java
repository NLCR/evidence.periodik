package cz.incad.nkp.inprove.solr;

import cz.incad.nkp.inprove.CloneParams;
import cz.incad.nkp.inprove.Options;
import cz.incad.nkp.inprove.importing.VDKSetImportOptions;
import cz.incad.nkp.inprove.importing.VDKSetProcessor;
import java.io.IOException;
import java.math.BigInteger;
import java.net.MalformedURLException;
import java.net.URL;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.Period;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.apache.commons.io.IOUtils;
import org.apache.solr.client.solrj.ResponseParser;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.SolrServerException;
import org.apache.solr.client.solrj.impl.HttpSolrClient;
import org.apache.solr.client.solrj.impl.NoOpResponseParser;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.apache.solr.client.solrj.response.UpdateResponse;
import org.apache.solr.common.SolrDocument;
import org.apache.solr.common.SolrDocumentList;
import org.apache.solr.common.SolrInputDocument;
import org.apache.solr.common.util.NamedList;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.xml.sax.SAXException;

/**
 *
 * @author alberto
 */
public class Indexer {

  static final Logger LOGGER = Logger.getLogger(Indexer.class.getName());
  public static final String DEFAULT_HOST = "http://localhost:8983/solr/";

  public String host() {

    try {
      Options opts = Options.getInstance();
      return opts.getString("solrhost", DEFAULT_HOST);
    } catch (JSONException ex) {
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

  public static boolean isSpecial(SolrClient solr, LocalDate date) {
    if (date.getDayOfWeek() == DayOfWeek.SUNDAY) {
      return true;
    }
    try {
      SolrQuery query = new SolrQuery();
      query.setRows(1);
      query.set("wt", "json");
      //q = '(day:' + day + ' AND month:' + month + ' AND year:' + year + ') OR (day:' + day + ' AND month:' + month + ' AND year:0)';
      query.setQuery("id:\"" + date.format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "\" OR id:\"" + date.format(DateTimeFormatter.ofPattern("MMdd")) + "\"");
      return solr.query("calendar", query).getResults().getNumFound() > 0;
    } catch (SolrServerException ex) {
      Logger.getLogger(Indexer.class.getName()).log(Level.SEVERE, null, ex);
    } catch (IOException ex) {
      Logger.getLogger(Indexer.class.getName()).log(Level.SEVERE, null, ex);
    }
    return false;
  }

  public static List<String> getSpecialDays(SolrClient solr, LocalDate start, LocalDate end) {
    List<String> ret = new ArrayList<>();

    try {
      int yearsBetween = (int) ChronoUnit.YEARS.between(end, start) + 1;
      SolrQuery query = new SolrQuery();
      query.setRows(100);
      query.set("wt", "json");
      //q = "(day:" + day + " AND month:" + month + " AND year:" + year + ") OR (day:" + day + " AND month:" + month + " AND year:0)";
      String startFull = start.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
      int startMonth = start.getMonthValue();
      String endFull = end.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
      int endMonth = end.getMonthValue();
      int startYear = start.getYear();
      int endYear = end.getYear();
      String q = "id:[" + startFull + " TO " + endFull + "]";
      boolean changingYear = endMonth < startMonth && endYear == startYear + 1;
      //endYear > startYear;
      if (changingYear) {
        q += " OR id:[" + start.format(DateTimeFormatter.ofPattern("MMdd")) + " TO 1231] OR id:[0101 TO " + end.format(DateTimeFormatter.ofPattern("MMdd")) + "]";
      } else if (endYear > startYear) {
        q += " OR year:0";
      } else {
        q += " OR id:[" + start.format(DateTimeFormatter.ofPattern("MMdd")) + " TO " + end.format(DateTimeFormatter.ofPattern("MMdd")) + "]";
      }

      query.setQuery(q);
//      query.setFacet(true).addFacetField("year");
      QueryResponse resp = solr.query("calendar", query);
      SolrDocumentList docs = resp.getResults();
//      int days = (int) resp.getResults().getNumFound();
//      List<FacetField.Count> vals = resp.getFacetField("year").getValues();
//      for (int i = 0; i < vals.size(); i++) {
//        if (vals.get(i).getName().equals("0")) {
//          days += vals.get(i).getCount() * yearsBetween;
//        }
//      }
      for (int i = 0; i < docs.size(); i++) {
        SolrDocument doc = docs.get(i);
        if (doc.getFirstValue("year").equals(0)) {
          for (int y = startYear; y < endYear + 1; y++) {
            //Control months and days are in beetwen period
            String d = y + (String) doc.getFirstValue("id");

            SimpleDateFormat sdf1 = new SimpleDateFormat("yyyyMMdd");

            LocalDate date = sdf1.parse(d).toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
            if ((date.isBefore(end) || date.isEqual(end)) && (date.isAfter(start) || date.isEqual(start))) {
              ret.add(d);
            }
          }
        } else {
          ret.add((String) doc.getFirstValue("id"));
        }
      }

    } catch (SolrServerException | IOException | ParseException ex) {
      Logger.getLogger(Indexer.class.getName()).log(Level.SEVERE, null, ex);
    }
    return ret;
  }

  public static int getNumSpecialDays(LocalDate start, LocalDate end) {
    int specialDays = 0;

    try (SolrClient solr = new HttpSolrClient.Builder(Options.getInstance().getString("solrhost", Indexer.DEFAULT_HOST)).build()) {
      int daysBetween = (int) ChronoUnit.DAYS.between(start, end);
      specialDays = daysBetween / 7;

      if (start.getDayOfWeek().getValue() > end.getDayOfWeek().getValue() || end.getDayOfWeek() == DayOfWeek.SUNDAY) {
        specialDays++;
      }

      List<String> days = Indexer.getSpecialDays(solr, start, end);

      specialDays += days.size();

    } catch (IOException | JSONException ex) {
      Logger.getLogger(VDKSetProcessor.class.getName()).log(Level.SEVERE, null, ex);
    }

    return specialDays;
  }

  public JSONObject days(String start, String end) {
    JSONObject ret = new JSONObject();
    try {

      SimpleDateFormat sdf1 = new SimpleDateFormat("yyyyMMdd");

      LocalDate startDate = sdf1.parse(start).toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
      LocalDate endDate = sdf1.parse(end).toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
      ret.put("days", getNumSpecialDays(startDate, endDate));

    } catch (ParseException ex) {
      Logger.getLogger(Indexer.class.getName()).log(Level.SEVERE, null, ex);
      ret.put("error", ex);
    }
    return ret;
  }

  /**
   * *
   * Method generate issues from vdk records
   *
   * @param issueData : JSONObject with common issue data { "nazev": "Lidové
   * noviny: Pražské vydání ", "id_titul":
   * "d2677fbe-f660-4da2-a55d-035c12c09aab",
   * "uuid_titulu":"d2677fbe-f660-4da2-a55d-035c12c09aab", "typ": "tištěné",
   * "vydani": "Ranní vydání", "mutace": "Čechy", "periodicita": "P1D",
   * "pocet_stran": 12, "druhe_cislo": 2, "id_bib_zaznamu": "NKC01-000761161"
   *
   * }
   * @param vdkRecord : JSONObject with vdk record data from solr
   *
   * We should generate next fields "id_bib_zaznamu", if it does not exists in
   * issueData "vlastnik" : [] "state": "auto", "datum_vydani": ,
   * "datum_vydani_den": , "cislo": ,
   */
  public void fromVDK(JSONObject issueData, JSONObject vdkObject) {
    int generated = 0;
    try (SolrClient solr = getClient()) {

      //A map which key represents unique issue by date
      Map<String, SolrInputDocument> issues = new HashMap<>();

      Period period = Period.parse(issueData.getString("periodicita"));
      SimpleDateFormat sdf1 = new SimpleDateFormat("yyyyMMdd");

      for (int i = 0; i < vdkObject.getJSONArray("ex").length(); i++) {
        //JSONObject zdroj = vdkObject.getJSONArray("ex").getJSONObject(i);
        JSONObject zdroj = new JSONObject(vdkObject.getJSONArray("ex").getString(i));
        //Loop zdroj => vlastnik
        String vlastnik = zdroj.getString("zdroj");
        String id_vlastnik = zdroj.getString("id");

        //Loop ex of that zdroj
        for (int j = 0; j < zdroj.getJSONArray("ex").length(); j++) {
          JSONObject ex = zdroj.getJSONArray("ex").getJSONObject(j);

          //Extract and parse date
          //Toto je rok. Muze byt cislo, nebo cislo - cislo
          String yearstr = ex.optString("rok");
          String[] years = yearstr.split("-");

          //Toto je mesic. Muze byt cislo, nebo cislo - cislo
          String monthstr = ex.optString("cislo", "01");
          if ("".equals(monthstr)) {
            monthstr = "01";
          }
          String[] months = monthstr.split("-");

          //Toto je cislo rocniku
          //Zatim nic s nim
          String rocnik = ex.optString("svazek");
          if ("".equals(rocnik)) {
            rocnik = "1";
          }

          for (String year : years) {
            for (String month : months) {
              String vydani = year + String.format("%02d", Integer.parseInt(month)) + "01";
              //System.out.println(vydani);
              SolrInputDocument idoc;
              if (issues.containsKey(vydani)) {
                idoc = issues.get(vydani);
                idoc.addField("vlastnik", vlastnik);
              } else {
                idoc = new SolrInputDocument();

                //Add fields from issue
                for (Iterator it = issueData.keySet().iterator(); it.hasNext();) {
                  String key = (String) it.next();
                  idoc.addField(key, issueData.get(key));
                }

                if (!idoc.containsKey("vlastnik") || !idoc.getFieldValues("vlastnik").contains(vlastnik)) {
                  idoc.addField("vlastnik", vlastnik);
                }

                idoc.setField("state", "auto");

                idoc.setField("cislo", rocnik);
                idoc.setField("rocnik", year);

                issues.put(vydani, idoc);
              }

              //Add fields based on ex
              JSONObject exemplare = new JSONObject();
              exemplare.put("vlastnik", vlastnik);
              exemplare.put("carovy_kod", ex.getString("carkod"));
              exemplare.put("signatura", ex.getString("signatura"));

              idoc.addField("exemplare", exemplare.toString());

              //idoc.addField("exemplare", ex.toString());
            }
          }
        }
      }
//      for (Iterator it = issues.keySet().iterator(); it.hasNext();) {
//      System.out.println((String) it.next());
//      }

      //if (generated > 9) {
      for (Iterator it = issues.keySet().iterator(); it.hasNext();) {
        String vydani = (String) it.next();
        SolrInputDocument idoc = issues.get(vydani);

        //Generate each day in month  
        Date startDate = sdf1.parse(vydani);

        LocalDate start = startDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        LocalDate end = start.plus(Period.ofMonths(1));

        for (LocalDate date = start; date.isBefore(end); date = date.plus(period)) {
          //TODO
//          if (!cfg.onSpecialDays && isSpecial(solr, date)) {
//            continue;
//          }
          SolrInputDocument idocDen = idoc.deepCopy();

          idocDen.setField("datum_vydani", date.format(DateTimeFormatter.ISO_DATE));
          idocDen.setField("datum_vydani_den", date.format(DateTimeFormatter.BASIC_ISO_DATE));

          idocDen.setField("id", generateId(idocDen, Options.getInstance().getStrings("idfields")));
          solr.add("issue", idocDen);
          if (generated++ % 1000 == 0) {
            solr.commit("issue");
            LOGGER.log(Level.INFO, "generated {0} from vdk", generated);
          }
        }

      }
      // }

      solr.commit("issue");
    } catch (SolrServerException | IOException | ParseException ex) {
      LOGGER.log(Level.SEVERE, "Error generating issues from vdk", ex);
    }
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
            SolrInputDocument idoc = cloneOne(doc, date, mutation, number, year, cfg.cloneExemplare);
            solr.add("issue", idoc);
          }
        } else {
          SolrInputDocument idoc = cloneOne(doc, date, null, number, year, cfg.cloneExemplare);
          solr.add("issue", idoc);
        }
        number++;
        year = Period.between(start, date).getYears() + cfg.start_year;
      }

      solr.commit("issue");
    } catch (SolrServerException | IOException | ParseException ex) {
      LOGGER.log(Level.SEVERE, "Error cloning", ex);
    }
  }

  private SolrInputDocument cloneOne(SolrDocument doc, LocalDate date, String mutace, int number, int year, boolean cloneExemplars) {
    try {
      SolrInputDocument idoc = new SolrInputDocument();
      doc.getFieldNames().forEach((name) -> {
        idoc.addField(name, doc.getFieldValue(name));
      });
      idoc.removeField("_version_");
      idoc.setField("datum_vydani", date.format(DateTimeFormatter.ISO_DATE));
      idoc.setField("datum_vydani_den", date.format(DateTimeFormatter.BASIC_ISO_DATE));

      idoc.setField("state", "auto");
      idoc.setField("cislo", number);
      //idoc.setField("rocnik", year);
      if (mutace != null) {
        idoc.setField("mutace", mutace);
      }
      if (!cloneExemplars) {
        idoc.setField("exemplare", "");
      }
      //idoc.setField("id", UUID.randomUUID());
      //idoc.removeField("id");
      idoc.setField("id", generateId(idoc, Options.getInstance().getStrings("idfields")));
      return idoc;
    } catch (JSONException ex) {
      LOGGER.log(Level.SEVERE, null, ex);
      return null;
    }
  }

  private String generateId(SolrInputDocument doc, String[] fields) {
    try {
      MessageDigest md = MessageDigest.getInstance("SHA-1");
      StringBuilder sb = new StringBuilder();

      for (String field : fields) {
        if (doc.containsKey(field)) {
          sb.append(doc.getFieldValue(field).toString()).append(" ");
        }
      }
      md.update(sb.toString().getBytes());
      BigInteger id = new BigInteger(1, md.digest());
      return String.format("%032X", id);

    } catch (NoSuchAlgorithmException | JSONException ex) {
      LOGGER.log(Level.SEVERE, null, ex);
      return null;
    }
  }

  public JSONObject indexSvazek(JSONObject json) {

    LOGGER.info(json.toString());
    JSONObject ret = new JSONObject();
    try (SolrClient solr = getClient()) {
      SolrInputDocument idoc = new SolrInputDocument();
      for (Object key : json.keySet()) {
        String name = (String) key;
        if (null == name) {
          //idoc.addField(name, json.get(name));
        } else {
          switch (name) {
            case "stav":
              break;
            case "datum_vydani_den":
              //idoc.setField("datum_vydani_den", json.getString(name));
              //idoc.setField("datum_vydani_den", json.getString(name).replaceAll("-", ""));
              break;
            case "datum_vydani":
              idoc.setField("datum_vydani", json.getString(name));
              idoc.setField("datum_vydani_den", json.getString(name).replaceAll("-", "").substring(0, 8));
              break;
            case "periodicita":
              idoc.addField("periodicita", json.getJSONArray(name).toString());
              break;
            //Skip this
            case "titul":
              break;
            case "_version_":
              break;

            default:
              idoc.addField(name, json.get(name));
              break;
          }
        }
      }

      if ("".equals(json.optString("id", ""))) {
        idoc.setField("id", generateId(idoc, Options.getInstance().getStrings("idfields")));
      }
      // LOGGER.info(idoc.toString());
      solr.add("svazek", idoc);
      solr.commit("svazek");
      ret.put("success", "svazek saved");
    } catch (SolrServerException | IOException ex) {
      ret.put("error", ex);
      LOGGER.log(Level.SEVERE, null, ex);
    }
    return ret;
  }

  public JSONObject fromJSON(JSONObject json) {
    JSONObject ret = new JSONObject();
    try (SolrClient solr = getClient()) {
      SolrInputDocument idoc = new SolrInputDocument();
      for (Object key : json.keySet()) {
        String name = (String) key;
        if (null == name) {
          //idoc.addField(name, json.get(name));
        } else {
          switch (name) {
            case "vlastnik":
              break;
            case "stav":
              break;
            case "datum_vydani_den":
              //idoc.setField("datum_vydani_den", json.getString(name));
              //idoc.setField("datum_vydani_den", json.getString(name).replaceAll("-", ""));
              break;
            case "datum_vydani":
              idoc.setField("datum_vydani", json.getString(name));
              idoc.setField("datum_vydani_den", json.getString(name).replaceAll("-", "").substring(0, 8));
              break;
            //Skip this
            case "titul":
              break;
            case "_version_":
              break;
            case "index_time":
              break;
            case "pages":
              idoc.setField("pages", json.getJSONArray(name).toString());
              break;
            case "exemplare":
              //Extract vlastnik and index each exemplar
              JSONArray ex = json.getJSONArray(name);
              for (int i = 0; i < ex.length(); i++) {
                String vl = ex.getJSONObject(i).getString("vlastnik");
                idoc.addField("vlastnik", vl);
                if (ex.getJSONObject(i).optJSONArray("stav") != null) {
                  for (int j = 0; j < ex.getJSONObject(i).optJSONArray("stav").length(); j++) {
                    idoc.addField("stav", ex.getJSONObject(i).getJSONArray("stav").optString(j));
                  }
                }
                idoc.addField("exemplare", ex.getJSONObject(i).toString());
              }
              break;
            default:
              idoc.addField(name, json.get(name));
              break;
          }
        }
      }

      if ("".equals(json.optString("id", ""))) {
        idoc.setField("id", generateId(idoc, Options.getInstance().getStrings("idfields")));
      }
      // LOGGER.info(idoc.toString());
      solr.add("issue", idoc);
      solr.commit("issue");
      ret.put("success", "issue saved");
    } catch (SolrServerException | IOException ex) {
      ret.put("error", ex);
      LOGGER.log(Level.SEVERE, null, ex);
    }
    return ret;
  }

  public JSONObject saveTitul(JSONObject json) {
    JSONObject ret = new JSONObject();
    try (SolrClient solr = getClient()) {
      Titul titul = Titul.fromJSON(json);
      solr.addBean("titul", titul, 100);
      ret.put("id", titul.id);
    } catch (SolrServerException | IOException ex) {
      ret.put("error", ex);
      LOGGER.log(Level.SEVERE, null, ex);
    }
    return ret;
  }

  public JSONObject deleteTitul(String id) {
    JSONObject ret = new JSONObject();
    try (SolrClient solr = getClient()) {
      solr.deleteByQuery("issue", "id_titul:\"" + id + "\"", 100);
      solr.deleteByQuery("titul", "id:\"" + id + "\"", 100);
      ret.put("msg", "metatitul deleted");
    } catch (SolrServerException | IOException ex) {
      ret.put("error", ex);
      LOGGER.log(Level.SEVERE, null, ex);
    }
    return ret;
  }

  public static JSONObject indexJSON(JSONObject json, String core) {
    JSONObject ret = new JSONObject();
    UpdateResponse response;
    try (SolrClient client = new HttpSolrClient.Builder(Options.getInstance().getString("solrhost", DEFAULT_HOST))
            .withConnectionTimeout(10000)
            .withSocketTimeout(60000)
            .build()) {
      JSONUpdateRequest request = new JSONUpdateRequest(json);
      request.setCommitWithin(100);

//      response = request.process(client, core);
//      client.commit(core);
//      System.out.println(response.toString());
//      ret = new JSONObject(response.toString());
      NoOpResponseParser rawJsonResponseParser = new NoOpResponseParser();
      rawJsonResponseParser.setWriterType("json");
      request.setResponseParser(rawJsonResponseParser);

      NamedList<Object> resp = client.request(request, core);
      client.commit(core);
      String jsonResponse = (String) resp.get("response");

      ret = new JSONObject(jsonResponse);

    } catch (SolrServerException | IOException | JSONException ex) {
      ret.put("error", ex);
      LOGGER.log(Level.SEVERE, null, ex);
    }
    return ret;
  }

  public JSONObject saveTitul2(JSONObject json) {
    JSONObject ret = new JSONObject();
    try (SolrClient solr = getClient()) {
      SolrInputDocument idoc = new SolrInputDocument();
      for (Object key : json.keySet()) {
        String name = (String) key;
        if (null == name) {
          //idoc.addField(name, json.get(name));
        } else {
          switch (name) {
            case "_version_":
              break;
            case "exemplare":
              //Extract vlastnik and index each exemplar
              JSONArray ex = json.getJSONArray(name);
              for (int i = 0; i < ex.length(); i++) {
                String vl = ex.getJSONObject(i).getString("vlastnik");
                idoc.addField("vlastnik", vl);

                if (ex.getJSONObject(i).optJSONArray("stav") != null) {
                  for (int j = 0; j < ex.getJSONObject(i).optJSONArray("stav").length(); j++) {
                    idoc.addField("stav", ex.getJSONObject(i).getJSONArray("stav").optString(j));
                  }
                }

                idoc.addField("exemplare", ex.getJSONObject(i).toString());
              }
              break;
            default:
              idoc.addField(name, json.get(name));
              break;
          }
        }
      }

      if ("".equals(json.optString("id", ""))) {
        if (json.has("uuid") && !"".equals(json.optString("uuid", ""))) {
          idoc.setField("id", json.getString("uuid"));
        } else {
          idoc.setField("id", generateId(idoc, new String[]{"meta_nazev"}));
        }

      }
      LOGGER.info(idoc.toString());
      solr.add("titul", idoc);
      solr.commit("titul");
      ret.put("success", "titul saved");
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

  public void duplicateEx(JSONObject issue, String vlastnik, boolean onspecialdays,
          //int start_cislo,
          JSONObject exemplar, String start_date, String end_date) {

    LOGGER.log(Level.INFO,
            "Duplicate exemplar {0} from {1} to {2} for {3} {4}",
            new String[]{exemplar.toString(), start_date, end_date, vlastnik, issue.getString("id_titul")});
    try (SolrClient solr = getClient()) {

      String carovy_kod = exemplar.getString("carovy_kod");
      SimpleDateFormat sdf1 = new SimpleDateFormat("yyyyMMdd");
      Date startDate = sdf1.parse(start_date);
      Date endDate = sdf1.parse(end_date);
      LocalDate start = startDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
      LocalDate end = endDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();

      Period period = Period.parse(issue.getString("periodicita"));

      int specialdays = Indexer.getNumSpecialDays(start.minusDays(start.getDayOfYear()), start);

      int cislo = start.getDayOfYear() - specialdays;
      for (LocalDate date = start; date.isBefore(end) || date.isEqual(end); date = date.plus(period)) {
        if (!onspecialdays && isSpecial(solr, date)) {
          continue;
        }
        cislo++;
        SolrQuery query = new SolrQuery();
        query.setRows(1);
        query.set("wt", "json");
        query.setQuery("id_titul:\"" + issue.getString("id_titul") + "\"");
        query.addFilterQuery("datum_vydani_den:" + date.format(DateTimeFormatter.BASIC_ISO_DATE));
        query.setFields("*,exemplare:[json]");
        QueryResponse qr = solr.query("issue", query);

        SolrDocument doc = null;
        boolean hasEx = false;
        JSONArray exs = new JSONArray();
        SolrInputDocument idoc = new SolrInputDocument();

        if (!qr.getResults().isEmpty()) {
          doc = qr.getResults().get(0);

          for (String name : doc.getFieldNames()) {
            idoc.setField(name, doc.getFieldValues(name));
          }
          idoc.removeField("_version_");
          idoc.removeField("index_time");
          idoc.removeField("exemplare");

          if (doc.containsKey("exemplare")) {
            exs = new JSONArray(doc.getFieldValue("exemplare").toString());
          }
          for (int i = 0; i < exs.length(); i++) {
            if (exs.getJSONObject(i).getString("carovy_kod").equals(carovy_kod)) {
              hasEx = true;
              break;
            }
          }
        } else {
          //nemame toto vydani, musime pridat

          for (Iterator it = issue.keySet().iterator(); it.hasNext();) {
            String key = (String) it.next();
            idoc.addField(key, issue.get(key));
          }
          idoc.removeField("_version_");
          idoc.removeField("index_time");
          idoc.removeField("exemplare");
          idoc.removeField("titul");
          idoc.setField("state", "auto");

          idoc.setField("datum_vydani", date.format(DateTimeFormatter.ISO_DATE));
          idoc.setField("datum_vydani_den", date.format(DateTimeFormatter.BASIC_ISO_DATE));
          idoc.setField("cislo", cislo);
          idoc.setField("id", generateId(idoc, Options.getInstance().getStrings("idfields")));
        }
        if (!hasEx) {

          exs.put(exemplar);

          for (int i = 0; i < exs.length(); i++) {
            idoc.addField("exemplare", exs.getJSONObject(i).toString());

            if (exs.getJSONObject(i).optJSONArray("stav") != null) {
              for (int j = 0; j < exs.getJSONObject(i).optJSONArray("stav").length(); j++) {
                idoc.addField("stav", exs.getJSONObject(i).getJSONArray("stav").optString(j));
              }
            }

          }

          idoc.addField("vlastnik", vlastnik);

          //System.out.println(idoc.getFieldValue("id"));
          solr.add("issue", idoc);
          LOGGER.log(Level.FINE, "{0} added", date.format(DateTimeFormatter.BASIC_ISO_DATE));

        }
      }
      solr.commit("issue");

    } catch (SolrServerException | IOException | ParseException ex) {
      LOGGER.log(Level.SEVERE, "Error duplicating exemplars", ex);
    }
  }

  public JSONObject addExFromVdkSet(JSONObject issue, String url, JSONObject options) {
    JSONObject ret = new JSONObject();
    try {
      VDKSetProcessor vp = new VDKSetProcessor();
      VDKSetImportOptions vdkOptions = VDKSetImportOptions.fromJSON(options);
      vp.getFromUrl(url);
      JSONArray exs = vp.exemplarsToJson();
      LOGGER.log(Level.INFO, "processing {0} exemplars", exs.length());

      for (int i = 0; i < exs.length(); i++) {
        JSONObject ex = exs.getJSONObject(i);
        if (vdkOptions.barcode.equals("") || vdkOptions.barcode.equals(ex.getString("b"))) {

          if (vp.canProcess(ex)) {
            duplicateEx(issue, vdkOptions.vlastnik, vdkOptions.onSpecialDays,
                    //vp.getStartCislo_(ex, vdkOptions),
                    vp.asPermonikEx(ex, vdkOptions.vlastnik),
                    vp.getStart(ex, vdkOptions),
                    vp.getEnd(ex, vdkOptions));
            ret.append("exs", ex.getString("b"));
          } else {
            ret.append("unprocessables", ex);
          }
        }
      }

    } catch (IOException | SAXException ex) {
      LOGGER.log(Level.SEVERE, null, ex);
      ret.put("error", ex);
    }
    return ret;
  }

  private int getStartCisloFromDate(String date, boolean special) {
    try {
      if (date == null) {
        return -1;
      }
      SimpleDateFormat sdf1 = new SimpleDateFormat("yyyyMMdd");
      Date startDate = sdf1.parse(date);
      LocalDate start = startDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();

      int ret = start.getDayOfYear();
      if (!special) {
        ret = ret - Indexer.getNumSpecialDays(start.minusDays(start.getDayOfYear()), start);
      }

      return ret;
    } catch (ParseException ex) {
      LOGGER.log(Level.SEVERE, null, ex);
      return -1;
    }
  }

  public JSONObject collectExFromVdkSet(JSONObject issue, String url, JSONObject options) {
    JSONObject ret = new JSONObject();
    try {
      VDKSetProcessor vp = new VDKSetProcessor();
      VDKSetImportOptions vdkOptions = VDKSetImportOptions.fromJSON(options);
      vp.getFromUrl(url);
      JSONArray exs = vp.exemplarsToJson();
      LOGGER.log(Level.INFO, "processing {0} exemplars", exs.length());

      for (int i = 0; i < exs.length(); i++) {
        JSONObject ex = exs.getJSONObject(i);
        if (vdkOptions.barcode.equals("") || vdkOptions.barcode.equals(ex.getString("b"))) {

          if (vp.canProcess(ex)) {
            JSONObject vdk = new JSONObject();
            vdk.put("orig", ex);
            vdk.put("permonik", vp.asPermonikEx(ex, vdkOptions.vlastnik));
            String start_date = vp.getStart(ex, vdkOptions);
            int start_cislo = getStartCisloFromDate(start_date, vdkOptions.onSpecialDays);
            vdk.put("add", new JSONObject()
                    .put("year", ex.optString("y"))
                    .put("volume", ex.optString("v"))
                    .put("start_cislo", start_cislo)
                    .put("start_date", start_date)
                    .put("end_date", vp.getEnd(ex, vdkOptions)));
            ret.append("exs", vdk);
          } else {
            ret.append("unprocessables", ex);
          }
        }
      }
    } catch (IOException | SAXException ex) {
      LOGGER.log(Level.SEVERE, null, ex);
      ret.put("error", ex);
    }
    return ret;
  }

}
