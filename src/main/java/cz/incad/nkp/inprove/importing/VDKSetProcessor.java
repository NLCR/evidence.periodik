/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package cz.incad.nkp.inprove.importing;

import java.io.IOException;
import java.io.InputStream;
import java.io.StringReader;
import java.net.MalformedURLException;
import java.net.URL;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.Period;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;
import org.apache.solr.common.SolrInputDocument;
import org.json.JSONArray;
import org.json.JSONObject;
import org.w3c.dom.Document;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

/**
 * This has util method to process xml from marc21 format for vdk-set
 *
 * @author alberto.a.hernandez
 */
public class VDKSetProcessor {

  Logger LOGGER = Logger.getLogger(this.getClass().getName());

  private XPath xpath;
  private Document doc;
  boolean nsAware = false;
  DocumentBuilder builder;

  public VDKSetProcessor() {

    try {
      nsAware = true;
      XPathFactory factory = XPathFactory.newInstance();
      xpath = factory.newXPath();
      xpath.setNamespaceContext(new VDKNamespaceContext());
      DocumentBuilderFactory domFactory = DocumentBuilderFactory.newInstance();
      domFactory.setNamespaceAware(nsAware); // never forget this!
      builder = domFactory.newDocumentBuilder();
    } catch (ParserConfigurationException ex) {
      LOGGER.log(Level.SEVERE, null, ex);
    }
  }

  public void getFromUrl(String urlString) throws MalformedURLException, IOException, SAXException {
    URL url = new URL(urlString);
    InputStream stream = url.openStream();
    doc = builder.parse(stream);
  }

  public void getFromString(String xmlstr) throws SAXException, IOException {
    InputSource source = new InputSource(new StringReader(xmlstr));
    doc = builder.parse(source);
  }

  public JSONArray exemplarsToJson() {
    JSONArray ret = new JSONArray();

    try {
      String xPath = "//marc:datafield[@tag='996']";
      XPathExpression expr = xpath.compile(xPath);
      NodeList nodes = (NodeList) expr.evaluate(doc, XPathConstants.NODESET);
      for (int i = 0; i < nodes.getLength(); i++) {
        Node node = nodes.item(i);
        JSONObject json = new JSONObject();
        NodeList children = node.getChildNodes();
        for (int j = 0; j < children.getLength(); j++) {
          Node child = children.item(j);
          NamedNodeMap attrs = child.getAttributes();
          json.put(attrs.item(0).getTextContent(), child.getTextContent());
        }
        ret.put(json);
      }
    } catch (XPathExpressionException ex) {
      Logger.getLogger(VDKSetProcessor.class.getName()).log(Level.SEVERE, null, ex);
    }
    return ret;
  }

  public String getStart(JSONObject ex, VDKSetImportOptions vdkOptions) {

    //Extract and parse date
    //Toto je rok. Muze byt cislo, nebo cislo - cislo
    String yearstr = ex.optString("y");
    String[] years = yearstr.split("-");
    String year = years[0];
    //Toto je mesic. Muze byt cislo, nebo cislo - cislo
    String cislo = ex.optString("i", "01");
    String[] months = new String[]{};
    String month;
    switch (vdkOptions.cisloFormat) {
      case CISLO:
        
        //cislo is a number from the begining of the year
        //calculated day
        //depends on periodicity and especial days

        String[] nums = cislo.split("-");
        int icislo = Integer.parseInt(nums[nums.length - 1]);
        if (vdkOptions.periodicity == Period.ofDays(1)) {

          SimpleDateFormat sdf1 = new SimpleDateFormat("yyyyMMdd");
          Date d;
          try {
            d = sdf1.parse(year + "0101");
            LocalDate df = d.toInstant().atZone(ZoneId.systemDefault()).toLocalDate().plusDays(icislo);
            return df.format(DateTimeFormatter.BASIC_ISO_DATE);
          } catch (ParseException ex1) {
            Logger.getLogger(VDKSetProcessor.class.getName()).log(Level.SEVERE, null, ex1);
          }

        } else if (vdkOptions.periodicity == Period.ofMonths(1)) {
          return year + "0101";
        } else {
          return year + "0101";
        }
      case MESIC:
        months = cislo.split("-");
        month = String.format("%02d", Integer.parseInt(months[0]));
        return year + month + "01";
      case MESIC_SLOVA:
        months = cislo.split("-");
        try {
          VDKSetMonths m = VDKSetMonths.valueOf(months[0]);
          month = m.num();
        } catch (IllegalArgumentException iex) {
          month = "01";
        }
        return year + month + "01";

    }

    return years[years.length - 1] + String.format("%02d", Integer.parseInt(cislo)) + "01";
  }

  public String getEnd(JSONObject ex, VDKSetImportOptions vdkOptions) {

    //Extract and parse date
    //Toto je rok. Muze byt cislo, nebo cislo - cislo
    String yearstr = ex.optString("y");
    String[] years = yearstr.split("-");
    String year = years[years.length - 1];

    //Toto je mesic. Muze byt cislo, nebo cislo - cislo
    String cislo = ex.optString("i", "01");
    String[] months = new String[]{};
    String month;
    switch (vdkOptions.cisloFormat) {
      case CISLO:
        //cislo is a number from the begining of the year
        //calculated day
        //depends on periodicity and especial days

        String[] nums = cislo.split("-");
        int icislo = Integer.parseInt(nums[nums.length - 1]);
        if (vdkOptions.periodicity == Period.ofDays(1)) {

          SimpleDateFormat sdf1 = new SimpleDateFormat("yyyyMMdd");
          Date d;
          try {
            d = sdf1.parse(year + "0101");
            LocalDate df = d.toInstant().atZone(ZoneId.systemDefault()).toLocalDate().plusDays(icislo);
            return df.format(DateTimeFormatter.BASIC_ISO_DATE);
          } catch (ParseException ex1) {
            Logger.getLogger(VDKSetProcessor.class.getName()).log(Level.SEVERE, null, ex1);
          }

        } else if (vdkOptions.periodicity == Period.ofMonths(1)) {
          return year + "0101";
        } else {
          return year + "0101";
        }
        
      case MESIC:
        months = cislo.split("-");
        if (months.length > 1) {
          month = String.format("%02d", Integer.parseInt(months[months.length - 1]));
          return year + month + "01";
        } else {
          int i = Integer.parseInt(months[0]);
          if (i < 12) {
            i++;
            return year + String.format("%02d", i) + "01";
          } else {
            i = 1;
            return year + "1231";
          }

        }

      case MESIC_SLOVA:
        months = cislo.split("-");
        try {
          VDKSetMonths m = VDKSetMonths.valueOf(months[months.length - 1]);
          month = m.num();
        } catch (IllegalArgumentException iex) {
          month = "12";
        }
        return year + month + "01";

    }

    return year + String.format("%02d", Integer.parseInt(cislo)) + "01";
  }

  public JSONObject asPermonikEx(JSONObject ex, String vlastnik) {
    JSONObject ret = new JSONObject();
    ret.put("carovy_kod", ex.optString("b"));
    ret.put("signatura", ex.optString("c"));
    ret.put("vlastnik", vlastnik);
    return ret;
  }

  /**
   * *
   *
   * @param ex: one exemplar in vdk-set format (field 996)
   * @param vdkOptions
   * @param issues
   */
  public void exemplarToIDoc(JSONObject ex, VDKSetImportOptions vdkOptions, Map<String, SolrInputDocument> issues) {
    /*    
  {
    "a": "02",
    "b": "2650327917",                    carovy kod
    "c": "III 302.100/ 15(2002)LED-ÚN",   signatura
    "d": "2002 15 1-50",
    "i": "1-50",                          cislo 
    "j": "SVK50",
    "l": "Běžný fond",
    "m": "ISSBD",
    "n": "3",
    "r": "Hlavní sklad-kostel",
    "s": "P",
    "u": "001590",
    "v": "15",                            rocnik
    "w": "000502478",
    "y": "2002"                           rok
  }
     */

    //Extract and parse date
    //Toto je rok. Muze byt cislo, nebo cislo - cislo
    String yearstr = ex.optString("y");
    String[] years = yearstr.split("-");

    //Toto je mesic. Muze byt cislo, nebo cislo - cislo
    String cislo = ex.optString("i");
    String[] months = new String[]{};
    switch (vdkOptions.cisloFormat) {
      case CISLO:
        break;
      case MESIC:
        months = new String[]{cislo};
        break;
      case MESIC_SLOVA:
        months = cislo.split("-");
        break;

    }

    for (String year : years) {
      for (String month : months) {
        String vydani = year + String.format("%02d", Integer.parseInt(month)) + "01";
        //System.out.println(vydani);
        SolrInputDocument idoc;
        if (issues.containsKey(vydani)) {
          idoc = issues.get(vydani);
        } else {
          idoc = new SolrInputDocument();
          idoc.setField("state", "auto");
          idoc.setField("rocnik", ex.optString("v"));

          issues.put(vydani, idoc);
        }

        //Add fields based on ex
        JSONObject exemplare = new JSONObject();
        exemplare.put("carovy_kod", ex.optString("b"));
        exemplare.put("signatura", ex.optString("c"));

        idoc.addField("exemplare", exemplare.toString());

        //idoc.addField("exemplare", ex.toString());
      }
    }
  }
  
  public static int getWorkingDaysBetweenTwoDates(Date startDate, Date endDate) {
    Calendar startCal = Calendar.getInstance();
    startCal.setTime(startDate);        

    Calendar endCal = Calendar.getInstance();
    endCal.setTime(endDate);

    int workDays = 0;

    //Return 0 if start and end are the same
    if (startCal.getTimeInMillis() == endCal.getTimeInMillis()) {
        return 0;
    }

    if (startCal.getTimeInMillis() > endCal.getTimeInMillis()) {
        startCal.setTime(endDate);
        endCal.setTime(startDate);
    }

    do {
       //excluding start date
        startCal.add(Calendar.DAY_OF_MONTH, 1);
        if (startCal.get(Calendar.DAY_OF_WEEK) != Calendar.SATURDAY && startCal.get(Calendar.DAY_OF_WEEK) != Calendar.SUNDAY) {
            ++workDays;
        }
    } while (startCal.getTimeInMillis() < endCal.getTimeInMillis()); //excluding end date

    return workDays;
}

  public boolean canProcess(JSONObject ex) {
    return ex.has("i");
    
  }
}
