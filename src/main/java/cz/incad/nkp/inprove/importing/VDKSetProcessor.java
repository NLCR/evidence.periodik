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
  
  public void getInterval(JSONObject ex, VDKSetImportOptions vdkOptions){
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
      Map<String, SolrInputDocument> issues = new HashMap<>();
          //Extract and parse date
          //Toto je rok. Muze byt cislo, nebo cislo - cislo
          String yearstr = ex.optString("y");
          String[] years = yearstr.split("-");

          //Toto je mesic. Muze byt cislo, nebo cislo - cislo
          String cislo = ex.optString("i");
          String[] months = new String[]{};
          switch(vdkOptions.cisloFormat){
            case CISLO:
              break;
            case MESIC :
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

                idoc.setField("rocnik", year);

                issues.put(vydani, idoc);
              }

              //Add fields based on ex
              JSONObject exemplare = new JSONObject();
              exemplare.put("carovy_kod", ex.getString("carkod"));
              exemplare.put("signatura", ex.getString("signatura"));

              idoc.addField("exemplare", exemplare.toString());

              //idoc.addField("exemplare", ex.toString());
            }
          }
  }
}
