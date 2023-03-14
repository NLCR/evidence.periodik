
package cz.incad.nkp.inprove.entities.metatitle;

import com.alibaba.fastjson2.JSON;
import java.util.logging.Logger;

import cz.incad.nkp.inprove.utils.MD5;
import org.apache.solr.client.solrj.beans.Field;
import org.json.JSONObject;

/**
 *
 * @author alberto
 */
public class MetaTitle {


  final static Logger LOGGER = Logger.getLogger(MetaTitle.class.getName());
  @Field
  public String id;
  @Field
  public String meta_nazev;
  @Field
  public String poznamka;
  @Field
  public String periodicita;
  @Field
  public Boolean show_to_not_logged_users;

  // Odstraneno podle #138
//  @Field
//  public int pocet_stran;


  public static MetaTitle fromJSON(JSONObject json) {
    MetaTitle obj = JSON.parseObject(json.toString(), MetaTitle.class);
    if (obj.id == null || obj.id.trim().isEmpty()) {
      obj.id = MD5.generate(new String[]{obj.meta_nazev});
    }
    return obj;
  }

}
