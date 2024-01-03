//package cz.incad.nkp.inprove;
//
//import org.json.JSONObject;
//
//import javax.servlet.ServletException;
//import javax.servlet.annotation.WebServlet;
//import javax.servlet.http.HttpServlet;
//import javax.servlet.http.HttpServletRequest;
//import javax.servlet.http.HttpServletResponse;
//import java.io.*;
//import java.nio.charset.StandardCharsets;
//import java.util.HashMap;
//import java.util.Map;
//import java.util.logging.Level;
//import java.util.logging.Logger;
//
//@WebServlet(value = "/metatitul/*")
//public class MetatitulServlet extends HttpServlet {
//
//    public static final Logger LOGGER = Logger.getLogger(MetatitulServlet.class.getName());
//    public static final String solrDefaultHost = "localhost:8983/solr";
//
//    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
//            throws ServletException, IOException {
//        try {
//            response.setContentType("application/json;charset=UTF-8");
//            response.addHeader("Access-Control-Allow-Methods", "GET");
//            PrintWriter out = response.getWriter();
//
//            String query = null;
//            UriComponents uri;
//
//            //GET /api/metatitul
//            if (request.getPathInfo() == null) {
//                //All title data excluding data with id = 1B569F5B32DD652280C63F6DB9C324D15E510C06 which is test data
//                query = "*:*&q.op=OR&indent=true&sort=meta_nazev_sort%20asc&rows=500&*=&fq=!id:\"1B569F5B32DD652280C63F6DB9C324D15E510C06\"";
//            }
//            //GET /api/metatitul/test
//            else if (request.getPathInfo() != null && request.getPathInfo().equals("/test")) {
//                //Title information only about TEST data
//                query = "*:*&q.op=OR&indent=true&sort=meta_nazev_sort%20asc&rows=500&*=&fq=id:\"1B569F5B32DD652280C63F6DB9C324D15E510C06\"";
//            }
//            else {
//                throw new RuntimeException("Path does not exist.");
//            }
//
//            uri = createUri(query);
//
//            LOGGER.log(Level.INFO, "requesting url {0}", uri.toString());
//            Map<String, String> reqProps = new HashMap<>();
//            reqProps.put("Content-Type", "application/json");
//            reqProps.put("Accept", "application/json");
//            try (InputStream inputStream = RESTHelper.inputStream(uri.toString(), reqProps)) {
//                JSONObject result = removeResponseHeader(inputStream);
//
//                String str = result.toString();
//                InputStream is = new ByteArrayInputStream(str.getBytes());
//
//                out.print(org.apache.commons.io.IOUtils.toString(is, StandardCharsets.UTF_8));
//                is.close();
//            }
//
//        } catch (IOException ex) {
//            LOGGER.log(Level.SEVERE, null, ex);
//        }
//    }
//
//*
//     * Creates correct URI for specific environment.
//     * Passes given `query` to the URI.
//     * @param query - solr query
//     * @return correct URI
//
//
//    private UriComponents createUri(String query) {
//        //TODO: Take into account that solr can run on different than default url
////        Options opts = Options.getInstance();
////        String solrhost = opts.getString("solrhost", solrDefaultHost);
//
//        return UriComponentsBuilder.newInstance()
//                .scheme("http")
//                .host(solrDefaultHost)
//                .path(titulPath)
//                .query("q={keyword}")
//                .buildAndExpand(query);
//    }
//
//*
//     * Removes `responseHeader` from given `inputStream` representing solr response
//     * @param inputStream solr response in form of inputstream
//     * @return JSONObject without `responseHeader`
//
//
//    private JSONObject removeResponseHeader(InputStream inputStream) {
//        try (BufferedReader bR = new BufferedReader(new InputStreamReader(inputStream))) {
//            String line = "";
//            StringBuilder responseStrBuilder = new StringBuilder();
//
//            while((line = bR.readLine()) != null){
//                responseStrBuilder.append(line);
//            }
//
//            JSONObject result= new JSONObject(responseStrBuilder.toString());
//            result.remove("responseHeader");
//
//            return result;
//        }
//        catch (IOException ioException) {
//            throw new RuntimeException("Could not create buffered reader.");
//        }
//    }
//}
