/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package cz.incad.nkp.inprove.old;

import cz.incad.nkp.inprove.old.importing.VDKSetProcessor;
import cz.incad.nkp.inprove.old.solr.Indexer;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.net.InetAddress;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 *
 * @author alberto
 */
@WebServlet(value = "/index")
public class IndexServlet extends HttpServlet {

    public static final Logger LOGGER = Logger.getLogger(IndexServlet.class.getName());
    public static final String ACTION_NAME = "action";

    /**
     * Processes requests for both HTTP <code>GET</code> and <code>POST</code>
     * methods.
     *
     * @param req servlet request
     * @param resp servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    protected void processRequest(HttpServletRequest req, HttpServletResponse resp)
            throws Exception {
        String actionNameParam = req.getParameter(ACTION_NAME);
        boolean isLocalhost = false;
        Set<String> localAddresses = new HashSet<>();
        localAddresses.add(InetAddress.getLocalHost().getHostAddress());
        for (InetAddress inetAddress : InetAddress.getAllByName("localhost")) {
            localAddresses.add(inetAddress.getHostAddress());
        }
        if (localAddresses.contains(req.getRemoteAddr())) {
            LOGGER.log(Level.INFO, "running from local address");
            isLocalhost = true;
        }

        Actions actionToDo = Actions.valueOf(actionNameParam.toUpperCase());
        actionToDo.doPerform(req, resp);
    }


    enum Actions {
        CREATE_EXEMPLARS {
            @Override
            void doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception {

                resp.setContentType("application/json;charset=UTF-8");
                PrintWriter out = resp.getWriter();
                JSONObject json = new JSONObject();
                try {
                    Indexer indexer = new Indexer();
                    json = indexer.createExemplars();

                } catch (Exception ex) {
                    LOGGER.log(Level.SEVERE, null, ex);
                    json.put("error", ex.toString());
                }
                out.println(json.toString(2));
            }
        },
        SAVE_EXEMPLARS {
            @Override
            void doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception {

                resp.setContentType("application/json;charset=UTF-8");
                PrintWriter out = resp.getWriter();
                String js = IOUtils.toString(req.getInputStream(), "UTF-8");
                JSONObject json = new JSONObject();
                try {
                    Indexer indexer = new Indexer();
                    JSONObject jo = new JSONObject(js);
                    JSONArray ja = jo.getJSONArray("exemplars");
                    if (jo.has("svazek")){
                        json.put("svazek", indexer.indexSvazek(jo.getJSONObject("svazek")));
                    }
                    indexer.saveExemplars(ja);
                } catch (Exception ex) {
                    LOGGER.log(Level.SEVERE, null, ex);
                    json.put("error", ex.toString());
                }
                out.println(json.toString(2));
            }
        },
        SAVE_EXEMPLAR {
            @Override
            void doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception {

                resp.setContentType("application/json;charset=UTF-8");
                PrintWriter out = resp.getWriter();
                String js = IOUtils.toString(req.getInputStream(), "UTF-8");
                JSONObject json = new JSONObject();
                try {
                    Indexer indexer = new Indexer();
                    JSONObject jo = new JSONObject(js);

                    json = indexer.saveExemplar(jo);
                } catch (Exception ex) {
                    LOGGER.log(Level.SEVERE, null, ex);
                    json.put("error", ex.toString());
                }
                out.println(json.toString(2));
            }
        },
        DELETE_EXEMPLAR {
            @Override
            void doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception {

                resp.setContentType("application/json;charset=UTF-8");
                PrintWriter out = resp.getWriter();
                JSONObject json = new JSONObject();
                try {
                    Indexer indexer = new Indexer();
                    indexer.deleteExemplar(req.getParameter("id"));

                } catch (Exception ex) {
                    LOGGER.log(Level.SEVERE, null, ex);
                    json.put("error", ex.toString());
                }
                out.println(json.toString(2));
            }
        },
        DELETE_SVAZEK_AND_EXEMPLARS {
            @Override
            void doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception {

                resp.setContentType("application/json;charset=UTF-8");
                PrintWriter out = resp.getWriter();
                String js = IOUtils.toString(req.getInputStream(), StandardCharsets.UTF_8);
                JSONObject json = new JSONObject();
                try {
                    Indexer indexer = new Indexer();
                    JSONObject jo = new JSONObject(js);

                    JSONArray exemplars = jo.getJSONArray("exemplars");
                    String svazek = jo.getString("id_svazek");

                    List<String> exemplarsIds = new ArrayList<String>();
                    for(int i = 0; i < exemplars.length(); i++){
                        exemplarsIds.add(exemplars.getString(i));
                    }

                    if(exemplars.length() > 0){
                        indexer.deleteExemplars(exemplarsIds);
                    }
                    if(!svazek.equals("")){
                        indexer.deleteSvazek(svazek);
                    }

                } catch (Exception ex) {
                    LOGGER.log(Level.SEVERE, null, ex);
                    json.put("error", ex.toString());
                }
                out.println(json.toString(2));
            }
        },
        SAVE_TITUL {
            @Override
            void doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception {

                resp.setContentType("application/json;charset=UTF-8");
                PrintWriter out = resp.getWriter();
                JSONObject json = new JSONObject();
                try {
                    Indexer indexer = new Indexer();
                    JSONObject jo = new JSONObject(req.getParameter("json"));
                    LOGGER.log(Level.INFO, "getParameterMap: {0}", jo);
                    json.put("resp", indexer.saveTitul(jo));
                } catch (Exception ex) {
                    LOGGER.log(Level.SEVERE, null, ex);
                    json.put("error", ex.toString());
                }
                out.println(json.toString(2));
            }
        },
        DELETE_TITUL {
            @Override
            void doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception {

                resp.setContentType("application/json;charset=UTF-8");
                PrintWriter out = resp.getWriter();
                JSONObject json = new JSONObject();
                try {
                    Indexer indexer = new Indexer();
                    json.put("resp", indexer.deleteTitul(req.getParameter("id")));
                } catch (Exception ex) {
                    LOGGER.log(Level.SEVERE, null, ex);
                    json.put("error", ex.toString());
                }
                out.println(json.toString(2));
            }
        },
        DUPLICATE_EX {
            @Override
            void doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception {

                resp.setContentType("application/json;charset=UTF-8");
                PrintWriter out = resp.getWriter();
                JSONObject json = new JSONObject();
                try {
                    Indexer indexer = new Indexer();

                    indexer.duplicateEx(new JSONObject(req.getParameter("issue")),
                            req.getParameter("vlastnik"),
                            Boolean.parseBoolean(req.getParameter("onspecial")),
                            //Integer.parseInt(req.getParameter("cislo")),
                            new JSONObject(req.getParameter("exemplar")),
                            req.getParameter("start"),
                            req.getParameter("end"));

                } catch (Exception ex) {
                    LOGGER.log(Level.SEVERE, null, ex);
                    json.put("error", ex.toString());
                }
                out.println(json.toString(2));
            }
        },
        CLONE {
            @Override
            void doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception {

                resp.setContentType("application/json;charset=UTF-8");
                PrintWriter out = resp.getWriter();
                JSONObject json = new JSONObject();
                try {
                    Indexer indexer = new Indexer();
                    CloneParams jo = new CloneParams(new JSONObject(req.getParameter("cfg")));
                    indexer.clone(jo);

                } catch (Exception ex) {
                    LOGGER.log(Level.SEVERE, null, ex);
                    json.put("error", ex.toString());
                }
                out.println(json.toString(2));
            }
        },
        CLONE_VDK {
            @Override
            void doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception {

                resp.setContentType("application/json;charset=UTF-8");
                PrintWriter out = resp.getWriter();
                JSONObject json = new JSONObject();
                try {
                    Indexer indexer = new Indexer();

                    Map<String, String> reqProps = new HashMap<>();
                    reqProps.put("Content-Type", "application/json");
                    reqProps.put("Accept", "application/json");
                    String url = "http://vdk.nkp.cz/vdk/search?action=BYQUERY&offset=0&q=code:" + req.getParameter("vdkCode");
                    InputStream inputStream = RESTHelper.inputStream(url, reqProps);
                    JSONObject vdkJson = new JSONObject(org.apache.commons.io.IOUtils.toString(inputStream, Charset.forName("UTF-8")));
                    indexer.fromVDK(new JSONObject(req.getParameter("cfg")), vdkJson.getJSONObject("response").getJSONArray("docs").getJSONObject(0));

                } catch (Exception ex) {
                    LOGGER.log(Level.SEVERE, null, ex);
                    json.put("error", ex.toString());
                }
                out.println(json.toString(2));
            }
        },
        CLONE_VDK_SET {
            @Override
            void doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception {

                resp.setContentType("application/json;charset=UTF-8");
                PrintWriter out = resp.getWriter();
                JSONObject json = new JSONObject();
                try {

                    String url = req.getParameter("url");

                    VDKSetProcessor vp = new VDKSetProcessor();
                    vp.getFromUrl(url);

                    json.put("msg", vp.exemplarsToJson());
                    //JSONObject vdkJson = new JSONObject(s);
                    //indexer.fromVDK(new JSONObject(req.getParameter("cfg")), vdkJson.getJSONObject("response").getJSONArray("docs").getJSONObject(0));

                } catch (Exception ex) {
                    LOGGER.log(Level.SEVERE, null, ex);
                    json.put("error", ex.toString());
                }
                out.println(json.toString(2));
            }
        },
        ADD_VDK_SET {
            @Override
            void doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception {

                resp.setContentType("application/json;charset=UTF-8");
                PrintWriter out = resp.getWriter();
                JSONObject json = new JSONObject();
                try {
                    Indexer indexer = new Indexer();
                    json.put("added",
                            indexer.addExFromVdkSet(
                                    new JSONObject(req.getParameter("issue")),
                                    req.getParameter("url"),
                                    new JSONObject(req.getParameter("options")))
                    );
                } catch (Exception ex) {
                    LOGGER.log(Level.SEVERE, null, ex);
                    json.put("error", ex.toString());
                }
                out.println(json.toString(2));
            }
        },
        COLLECT_VDK_SET {
            @Override
            void doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception {

                resp.setContentType("application/json;charset=UTF-8");
                PrintWriter out = resp.getWriter();
                JSONObject json = new JSONObject();
                try {
                    Indexer indexer = new Indexer();
                    if (req.getMethod().equals("POST")) {
                        JSONObject js = new JSONObject();
                        js = new JSONObject(IOUtils.toString(req.getInputStream(), "UTF-8"));

                        json = indexer.collectExFromVdkSet(
                                js.getJSONObject("issue"),
                                js.getString("urlvdk"),
                                js.getJSONObject("options"));
                    } else {
                        json = indexer.collectExFromVdkSet(
                                new JSONObject(req.getParameter("issue")),
                                req.getParameter("url"),
                                new JSONObject(req.getParameter("options"))
                        );
                    }

                } catch (Exception ex) {
                    LOGGER.log(Level.SEVERE, null, ex);
                    json.put("error", ex.toString());
                }
                out.println(json.toString(2));
            }
        },
        SET_STATE {
            @Override
            void doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception {

                resp.setContentType("application/json;charset=UTF-8");
                PrintWriter out = resp.getWriter();
                JSONObject json = new JSONObject();
                try {
                    Indexer indexer = new Indexer();
                    indexer.setState(req.getParameter("id"));

                } catch (Exception ex) {
                    LOGGER.log(Level.SEVERE, null, ex);
                    json.put("error", ex.toString());
                }
                out.println(json.toString(2));
            }
        },
        SPECIAL_DAYS {
            @Override
            void doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception {

                resp.setContentType("application/json;charset=UTF-8");
                PrintWriter out = resp.getWriter();
                JSONObject json = new JSONObject();
                try {
                    Indexer indexer = new Indexer();
                    json.put("days", indexer.days(req.getParameter("start"), req.getParameter("end")));

                } catch (Exception ex) {
                    LOGGER.log(Level.SEVERE, null, ex);
                    json.put("error", ex.toString());
                }
                out.println(json.toString(2));
            }
        };

        abstract void doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception;
    };

// <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
    /**
     * Handles the HTTP <code>GET</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            processRequest(request, response);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * Handles the HTTP <code>POST</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            processRequest(request, response);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * Returns a short description of the servlet.
     *
     * @return a String containing servlet description
     */
    @Override
    public String getServletInfo() {
        return "Short description";
    }// </editor-fold>

}
