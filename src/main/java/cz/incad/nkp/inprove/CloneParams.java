/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package cz.incad.nkp.inprove;

import java.util.ArrayList;
import java.util.List;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 *
 * @author alberto.a.hernandez
 */
public class CloneParams {

    //id of the issue to be cloned
    public String id;

    //Dates in yyyy-mm-dd format
    public String start_date;
    public String end_date;

    /**
     * Valid string for java.time.Period.parse() method, which is based on the
     * ISO-8601 period formats PnYnMnD and PnW 
     * "P2Y" -- Period.ofYears(2) 
     * "P3M"     * -- Period.ofMonths(3) 
     * "P4W" -- Period.ofWeeks(4) 
     * "P5D" -- Period.ofDays(5) 
     * "P1Y2M3D" -- Period.of(1, 2, 3) 
     * "P1Y2M3W4D" -- Period.of(1, 2, 25) 
     * "P-1Y2M" -- Period.of(-1, 2, 0) 
     * "-P1Y2M" -- Period.of(-1, -2, 0)
   *
     */
    public String periodicity;
    
    //Cislo pri start
    public int start_number;
    
    //Cislo rocniku pri startu
    public int start_year;
    
    public List<String> mutations = new ArrayList<>();
    
    public boolean onSpecialDays;
    

    public CloneParams(JSONObject jo) {
        this.id = jo.getString("id");
        this.start_date = jo.getString("start_date");
        this.end_date = jo.getString("end_date");
        this.start_number = jo.optInt("start_number", 0);
        this.start_year = jo.optInt("start_year", 0);
        this.periodicity = jo.getString("periodicity");
        this.onSpecialDays = jo.optBoolean(id, false);
        if (jo.has("mutations")) {
            JSONArray arr = jo.getJSONArray("mutations");
            for (int i = 0; i < arr.length(); i++) {
                this.mutations.add(arr.getString(i));
            }
        }
    }
}
