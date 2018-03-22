/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package cz.incad.nkp.inprove.importing;

import org.json.JSONObject;

/**
 *
 * @author alberto.a.hernandez
 * This class import periodicals from Kramerius instalation
 */
public class KrameriusImporter {
  
  /**
   * Origin url importing from
   */
  String importUrl;
  
  public  KrameriusImporter(String url){
    importUrl = url;
  }
  
  /**
   * Runs the importer
   * @return a JSON formated message object 
   */
  public JSONObject run(){
    JSONObject ret = new JSONObject();
    return ret;
  }
  
  private void listPeriodicals(){
    
  }
  
  private void indexPeriodical(String uuid){
    
  }
}
