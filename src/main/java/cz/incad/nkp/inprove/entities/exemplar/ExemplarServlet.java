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
//@WebServlet(value = "/exemplar/*")
//public class ExemplarServlet extends HttpServlet {
//
//    public static final Logger LOGGER = Logger.getLogger(SearchServlet.class.getName());
//    public static final String solrDefaultHost = "localhost:8983/solr";
//    public static final String space = "%20";
//    public static final String exemplarPath = "exemplar/query";
//
//    /**
//     * Processes requests for HTTP <code>GET</code> method.
//     * Creates solr query based on requested path and returns solr response.
//     * @param request servlet request
//     * @param response servlet response
//     * @throws ServletException if a servlet-specific error occurs
//     * @throws IOException if an I/O error occurs
//     */
//    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
//            throws ServletException, IOException {
//        try {
//            response.setContentType("application/json;charset=UTF-8");
//            response.addHeader("Access-Control-Allow-Methods", "GET");
//            PrintWriter out = response.getWriter();
//
//            String id;
//            String query = null;
//            UriComponents uri;
//
//            if (request.getPathInfo() == null) {
//                throw new RuntimeException("Path does not exist.");
//            }
//
//            //example format of requestPathInfo: "/2081c9cc60d1101b53c4a0ce348195ee/dates"
//            int firstSlashIndex = request.getPathInfo().indexOf("/") + 1;
//            int secondSlashIndex = request.getPathInfo().indexOf("/", firstSlashIndex);
//            id = request.getPathInfo().substring(firstSlashIndex, secondSlashIndex);
//
//            //GET /api/exemplar/{id}/title-page-name
//            //"Název na titulní straně"
//            if (request.getPathInfo().contains("/title-page-name")) {
//                query = "*:*&q.op=OR&indent=true&facet=true&rows=0&facet.field=nazev&facet.mincount=1&fq=id_titul:\"" + id + "\"";
//            }
//            //GET /api/exemplar/{id}/mutations
//            //"Mutace"
//            else if (request.getPathInfo().contains("/mutations")) {
//                query = "*:*&q.op=OR&indent=true&facet=true&rows=0&facet.field=mutace&facet.mincount=1&fq=id_titul:\"" + id + "\"";
//            }
//            //GET /api/exemplar/{id}/publications
//            //Vydání
//            else if (request.getPathInfo().contains("publications")) {
//                query = "*:*&q.op=OR&indent=true&facet=true&rows=0&facet.field=vydani&facet.mincount=1&fq=id_titul:\"" + id + "\"";
//            }
//            //GET /api/exemplar/{id}/mutation-markings
//            //"Mutační vydání"
//            else if (request.getPathInfo().contains("mutation-markings")) {
//                query = "*:*&q.op=OR&indent=true&facet=true&rows=0&facet.field=oznaceni&facet.mincount=1&fq=id_titul:\"" + id + "\"";
//            }
//            //GET /api/exemplar/{id}/owners
//            //"Vlastník"
//            else if (request.getPathInfo().contains("owners")) {
//                query = "*:*&q.op=OR&indent=true&facet=true&rows=0&facet.field=vlastnik&facet.mincount=1&vlastnik=&fq=id_titul:\"" + id + "\"";
//            }
//            //GET /api/exemplar/{id}/state
//            //"Stav"
//            else if (request.getPathInfo().contains("state")) {
//                query = "*:*&q.op=OR&indent=true&facet=true&rows=0&facet.field=stav&facet.mincount=1&fq=id_titul:\"" + id + "\"";
//            }
//            //GET /api/exemplar/{id}/dates-range
//            //"Rozsah datumu"
//            else if (request.getPathInfo().contains("dates-range")) {
//                query = "*:*&q.op=OR&indent=true&rows=0&stats=true&stats.field=datum_vydani_den&fq=id_titul:\"" + id + "\"";
//            }
//            //GET /api/exemplar/{id}/from-year/{year}
//            //"Všechny záznamy z uvedeného roku"
//            else if (request.getPathInfo().contains("from-year")) {
//                //example format of requestPathInfo: "/2081c9cc60d1101b53c4a0ce348195ee/from-year/1995"
//                int thirdSlashIndex = request.getPathInfo().indexOf("/", secondSlashIndex+1);
//                String year = request.getPathInfo().substring(thirdSlashIndex+1, request.getPathInfo().length());
//
//                query = "*:*&q.op=OR&indent=true&rows=10000&sort=datum_vydani_den" + space + "asc&fq=datum_vydani_den:{" + year + "0101" + space + "TO" + space + year + "1231}&fq=id_titul:\"" + id + "\"";
//            }
//            //GET /api/exemplar/{id}/years-range/{yearFrom-yearTo}
//            //"Všechny záznamy z uvedeného rozpětí roků"
//            else if (request.getPathInfo().contains("years-range")) {
//                //example format of requestPathInfo: "/2081c9cc60d1101b53c4a0ce348195ee/years-range/1995-1997"
//                int thirdSlashIndex = request.getPathInfo().indexOf("/", secondSlashIndex+1);
//                int dashIndex = request.getPathInfo().lastIndexOf("-");
//                String yearFrom = request.getPathInfo().substring(thirdSlashIndex+1, dashIndex);
//                String yearTo = request.getPathInfo().substring(dashIndex+1, request.getPathInfo().length());
//
//                query = "*:*&q.op=OR&indent=true&rows=10000&sort=datum_vydani_den" + space + "asc&fq=datum_vydani_den:%7B" + yearFrom + "0101" + space + "TO" + space + yearTo + "1231%7D&fq=id_titul:\"" + id + "\"";
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
//                JSONObject result = removeUnnecessaryData(inputStream);
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
//    /**
//     * Creates correct URI for specific environment.
//     * Passes given `query` to the URI.
//     * @param query - solr query
//     * @return correct URI
//     */
//    private UriComponents createUri(String query) {
//        //TODO: Take into account that solr can run on different than default url
////        Options opts = Options.getInstance();
////        String solrhost = opts.getString("solrhost", solrDefaultHost);
//
//        return UriComponentsBuilder.newInstance()
//                .scheme("http")
//                .host(solrDefaultHost)
//                .path(exemplarPath)
//                .query("q={keyword}")
//                .buildAndExpand(query);
//    }
//
//    /**
//     * Removes `responseHeader` from given `inputStream` representing solr response.
//     * Also removes unnecessary facet attributes, leaving only relevant and filled data.
//     * @param inputStream solr response in form of inputstream
//     * @return JSONObject without `responseHeader`
//     */
//    private JSONObject removeUnnecessaryData(InputStream inputStream) {
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
//            if (result.has("facet_counts")) {
//                JSONObject facet_counts = result.getJSONObject("facet_counts");
//
//                facet_counts.remove("facet_intervals");
//                facet_counts.remove("facet_queries");
//                facet_counts.remove("facet_heatmaps");
//                facet_counts.remove("facet_ranges");
//
//                result.remove("facet_counts");
//                result.append("facet_counts", facet_counts);
//            }
//
//            return result;
//        }
//        catch (IOException ioException) {
//            throw new RuntimeException("Could not create buffered reader.");
//        }
//    }
//
//}
