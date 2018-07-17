/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package cz.incad.nkp.inprove.importing;

import cz.incad.nkp.inprove.solr.Indexer;
import java.io.IOException;
import java.io.InputStream;
import java.io.StringReader;
import java.net.MalformedURLException;
import java.net.URL;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Date;
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
//import org.apache.solr.client.solrj.SolrClient;
//import org.apache.solr.client.solrj.impl.HttpSolrClient;
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

  SimpleDateFormat sdf1 = new SimpleDateFormat("yyyyMMdd");

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
    stream.close();
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

  public int getStartCislo_(JSONObject ex, VDKSetImportOptions vdkOptions) {

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
        try {
          return Integer.parseInt(nums[0]);
        } catch (Exception ex1) {
          LOGGER.log(Level.SEVERE, "Can't parse i as CISLO {0}", nums[0]);
          return -1;
        }
      case MESIC:
        months = cislo.split("-");
        month = String.format("%02d", Integer.parseInt(months[0]));
        try {

          LocalDate start = sdf1.parse(year + "0101").toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
          LocalDate end = sdf1.parse(year + month + "01").toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
          int days = (int) ChronoUnit.DAYS.between(start, end);
          if (!vdkOptions.onSpecialDays) {
            int specialdays = Indexer.getNumSpecialDays(start, end);
            days = days - specialdays;
          }

          return days;
        } catch (ParseException ex1) {
          Logger.getLogger(VDKSetProcessor.class.getName()).log(Level.SEVERE, null, ex1);
        }
        return -1;
      case MESIC_SLOVA:
        months = cislo.split("-");
        try {
          VDKSetMonths m = VDKSetMonths.valueOf(months[0]);
          month = m.num();
        } catch (IllegalArgumentException iex) {
          month = "01";
        }
        try {
          month = String.format("%02d", Integer.parseInt(month));

          LocalDate start = sdf1.parse(year + "0101").toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
          LocalDate end = sdf1.parse(year + month + "01").toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
          int days = (int) ChronoUnit.DAYS.between(start, end);
          if (!vdkOptions.onSpecialDays) {
            int specialdays = Indexer.getNumSpecialDays(start, end);
            days = days - specialdays;
          }

          return days + 1;
        } catch (ParseException ex1) {
          Logger.getLogger(VDKSetProcessor.class.getName()).log(Level.WARNING, ex1.toString());
        }
        return -1;

    }

    return 0;
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
        try {
          int icislo = Integer.parseInt(nums[0]);
          if (vdkOptions.periodicity.getDays() == 1) {

            Date d;
            try {
              d = sdf1.parse(year + "0101");
              int specialdays = 0;
              LocalDate dfStart = d.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
              LocalDate df = dfStart.plusDays(icislo - 1);

              if (!vdkOptions.onSpecialDays) {
                specialdays = Indexer.getNumSpecialDays(dfStart, df);
                df = df.plusDays(specialdays);
              }
              return df.format(DateTimeFormatter.BASIC_ISO_DATE);
            } catch (ParseException ex1) {
              Logger.getLogger(VDKSetProcessor.class.getName()).log(Level.WARNING, ex1.toString());
            }

          } else if (vdkOptions.periodicity.getMonths() == 1) {
            return year + "0101";
          } else {
            return year + "0101";
          }

        } catch (Exception ex1) {
          LOGGER.log(Level.SEVERE, "Cant parse i as CISLO {0}", nums[0]);
          return null;
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
          return year + month + "01";
        } catch (IllegalArgumentException iex) {
          LOGGER.log(Level.INFO, "invalid value: {0}", months);
        }
        return null;

    }

    return null;
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
        try {
          int icislo = Integer.parseInt(nums[nums.length - 1]);
          if (vdkOptions.periodicity.getDays() == 1) {

            Date d;
            try {
              d = sdf1.parse(year + "0101");
              int specialdays = 0;
              LocalDate dfStart = d.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
              LocalDate df = dfStart.plusDays(icislo);

              if (!vdkOptions.onSpecialDays) {
                specialdays = Indexer.getNumSpecialDays(dfStart, df);
                df = df.plusDays(specialdays);
              }

              return df.format(DateTimeFormatter.BASIC_ISO_DATE);
            } catch (ParseException ex1) {
              Logger.getLogger(VDKSetProcessor.class.getName()).log(Level.SEVERE, null, ex1);
            }

          } else if (vdkOptions.periodicity.getMonths() == 1) {
            return year + "0101";
          } else {
            return year + "0101";
          }

        } catch (Exception ex1) {
          LOGGER.log(Level.SEVERE, "Cant parse i as CISLO {0}", nums[0]);
          return null;
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
          Date d = sdf1.parse(year + month + "01");
          LocalDate df = d.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
          return df.plusMonths(1).minusDays(1).format(DateTimeFormatter.BASIC_ISO_DATE);
        } catch (ParseException | IllegalArgumentException iex) {
          LOGGER.log(Level.INFO, "invalid value: {0}", months[months.length - 1]);
        }
        return null;

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

  public boolean canProcess(JSONObject ex) {
    return ex.has("i");

  }
}
