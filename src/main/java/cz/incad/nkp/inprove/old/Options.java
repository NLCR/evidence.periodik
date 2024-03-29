package cz.incad.nkp.inprove.old;

import java.io.File;
import java.io.IOException;
import java.util.Iterator;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.apache.commons.io.FileUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author Alberto Hernandez
 */
public class Options {

    public static final Logger LOGGER = Logger.getLogger(Options.class.getName());
    private static final String ASSETS_DIR = "/assets";

    private static Options _sharedInstance = null;
    private final JSONObject client_conf;
    private final JSONObject server_conf;

    public synchronized static Options getInstance() {
        if (_sharedInstance == null) {
            try {
                _sharedInstance = new Options();
            } catch (IOException| JSONException ex) {
                Logger.getLogger(Options.class.getName()).log(Level.SEVERE, null, ex);
            }
        }
        return _sharedInstance;
    }

    public synchronized static void resetInstance() {
        _sharedInstance = null;
        LOGGER.log(Level.INFO, "Options reseted");
    }

    public Options() throws IOException, JSONException {

        File fdef = new File(ASSETS_DIR);

        if (fdef.exists()) {
            client_conf = new JSONObject(FileUtils.readFileToString(fdef, "UTF-8"));
        } else {
            client_conf = new JSONObject();
        }

        String path = ASSETS_DIR + File.separator + "config.json";

        //Get server options

        File fserver = FileUtils.toFile(Options.class.getResource("/server_config.json"));
        String sjson = FileUtils.readFileToString(fserver, "UTF-8");
        server_conf = new JSONObject(sjson);

        //Merge options defined in custom dir
        File f = new File(path);

        if (f.exists() && f.canRead()) {
            String json = FileUtils.readFileToString(f, "UTF-8");
            JSONObject customClientConf = new JSONObject(json).getJSONObject("client");
            Iterator keys = customClientConf.keys();
            while (keys.hasNext()) {
                String key = (String) keys.next();
                LOGGER.log(Level.FINE, "key {0} will be overrided", key);
                client_conf.put(key, customClientConf.get(key));
            }
            String fnmenu = ASSETS_DIR + File.separator + "menu.json";
            File fmenu = new File(fnmenu);
            if (fmenu.exists()) {
                JSONObject jsonMenu = new JSONObject(FileUtils.readFileToString(fmenu, "UTF-8"));
                client_conf.put("menu", jsonMenu);
            }

            JSONObject customServerConf = new JSONObject(json).getJSONObject("server");
            Iterator keys2 = customServerConf.keys();
            while (keys2.hasNext()) {
                String key = (String) keys2.next();
                LOGGER.log(Level.FINE, "key {0} will be overrided", key);
                server_conf.put(key, customServerConf.get(key));
            }
        }

    }

    public JSONObject getClientConf() {
        return client_conf;
    }

    public String getString(String key, String defVal) {
        return server_conf.optString(key, defVal);
    }

    public String getString(String key) {
        return server_conf.optString(key);
    }

    public int getInt(String key, int defVal) {
        return server_conf.optInt(key, defVal);
    }

    public boolean getBoolean(String key, boolean defVal) {
        return server_conf.optBoolean(key, defVal);
    }

    public String[] getStrings(String key) {
        JSONArray arr = server_conf.optJSONArray(key);
        String[] ret = new String[arr.length()];
        for (int i = 0; i < arr.length(); i++) {
            ret[i] = arr.getString(i);
        }
        return ret;
    }

    public JSONArray getJSONArray(String key) {
        return server_conf.optJSONArray(key);
    }

    public JSONObject getJSONObject(String key) {
        return server_conf.optJSONObject(key);
    }
}
