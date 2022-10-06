/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package cz.incad.nkp.inprove.importing;

import java.time.Period;
import org.json.JSONObject; 

/**
 *
 * @author alberto.a.hernandez
 */
public class VDKSetImportOptions {
  public VDKCisloFormat cisloFormat;
  public String vlastnik;
  public Period periodicity;
  public boolean onSpecialDays; 
  public String barcode = "";
  
  public static VDKSetImportOptions fromJSON(JSONObject j){
    VDKSetImportOptions v = new VDKSetImportOptions();
    v.cisloFormat = VDKCisloFormat.valueOf(j.getString("format"));
    v.vlastnik = j.getString("vlastnik");
    v.barcode = j.optString("barcode");
    v.periodicity = Period.parse(j.optString("periodicity", "P1D"));
    v.onSpecialDays = j.optBoolean("onspecial", false);
    return v;
  }
}
