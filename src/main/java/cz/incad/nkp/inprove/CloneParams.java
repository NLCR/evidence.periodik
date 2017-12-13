/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package cz.incad.nkp.inprove;

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
    
    public CloneParams(JSONObject jo){
        this.id = jo.getString("id");
        this.start_date = jo.getString("start_date");
        this.end_date = jo.getString("end_date");
    }
}
