/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package cz.incad.nkp.inprove;

import cz.incad.nkp.inprove.importing.VDKSetProcessor;
import cz.incad.nkp.inprove.solr.Indexer;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.nio.charset.Charset;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.XML;

/**
 *
 * @author alberto
 */
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
          throws ServletException, IOException {
    try {

      String actionNameParam = req.getParameter(ACTION_NAME);
      if (actionNameParam != null) {

        Actions actionToDo = Actions.valueOf(actionNameParam.toUpperCase());
        actionToDo.doPerform(req, resp);

      } else {
        PrintWriter out = resp.getWriter();
        out.print("Action missing");
      }
    } catch (IOException e1) {
      LOGGER.log(Level.SEVERE, e1.getMessage(), e1);
      resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
      resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e1.toString());
      PrintWriter out = resp.getWriter();
      out.print(e1.toString());
    } catch (SecurityException e1) {
      LOGGER.log(Level.SEVERE, e1.getMessage(), e1);
      resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
    } catch (Exception e1) {
      LOGGER.log(Level.SEVERE, e1.getMessage(), e1);
      resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
      PrintWriter out = resp.getWriter();
      resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e1.toString());
      out.print(e1.toString());
    }

  }

  enum Actions {
    ADD_ISSUE {
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
    SAVE_ISSUE {
      @Override
      void doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception {

        resp.setContentType("application/json;charset=UTF-8");
        PrintWriter out = resp.getWriter();
        JSONObject json = new JSONObject();
        try {
          Indexer indexer = new Indexer();
          JSONObject jo = new JSONObject(req.getParameter("json"));
          json.put("save issue", indexer.fromJSON(jo));
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
          json.put("save titul", indexer.saveTitul(jo));
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
    DELETE_ISSUE {
      @Override
      void doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception {

        resp.setContentType("application/json;charset=UTF-8");
        PrintWriter out = resp.getWriter();
        JSONObject json = new JSONObject();
        try {
          Indexer indexer = new Indexer();
          indexer.delete(req.getParameter("id"));

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
    };

    abstract void doPerform(HttpServletRequest req, HttpServletResponse resp) throws Exception;
  }

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
    processRequest(request, response);
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
    processRequest(request, response);
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
